import {
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  signOut as firebaseSignOut,
  ActionCodeSettings
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import { User } from './types'
import { BERKELEY_EMAIL_DOMAIN } from './constants'

// Auth helpers
export const isValidBerkeleyEmail = (email: string): boolean => {
  return email.endsWith(`@${BERKELEY_EMAIL_DOMAIN}`)
}

export const formatBerkeleyEmail = (netid: string): string => {
  return `${netid}@${BERKELEY_EMAIL_DOMAIN}`
}

// Send magic link to email
export const sendMagicLink = async (email: string): Promise<void> => {
  if (!isValidBerkeleyEmail(email)) {
    throw new Error('Must use a Berkeley email address')
  }

  const actionCodeSettings: ActionCodeSettings = {
    url: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000/verify' 
      : 'https://dulif.com/verify',
    handleCodeInApp: true,
    iOS: {
      bundleId: 'com.dulif.marketplace'
    },
    android: {
      packageName: 'com.dulif.marketplace'
    },
    dynamicLinkDomain: 'dulif.page.link'
  }

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    
    // Save email for sign-in completion
    localStorage.setItem('emailForSignIn', email)
  } catch (error: any) {
    if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address')
    }
    if (error.code === 'auth/missing-email') {
      throw new Error('Email address is required')
    }
    throw error
  }
}

// Complete sign-in with magic link
export const completeSignIn = async (): Promise<User> => {
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    throw new Error('Invalid sign-in link')
  }

  let email = localStorage.getItem('emailForSignIn')
  
  if (!email) {
    // Fallback: ask user for email if not found in localStorage
    email = window.prompt('Please provide your email for confirmation')
  }

  if (!email || !isValidBerkeleyEmail(email)) {
    throw new Error('Valid Berkeley email required')
  }

  const result = await signInWithEmailLink(auth, email, window.location.href)
  
  // Clean up
  localStorage.removeItem('emailForSignIn')
  
  // Get or create user document
  const user = await getOrCreateUser(result.user.uid, email)
  
  return user
}

// Get or create user document in Firestore
export const getOrCreateUser = async (uid: string, email: string): Promise<User> => {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    return { uid, ...userSnap.data() } as User
  }

  // Create new user document
  const newUser: Omit<User, 'uid'> = {
    email,
    firstName: '',
    lastName: '',
    photoURL: '',
    rating: 0,
    ratingCount: 0,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
  }

  await setDoc(userRef, newUser)
  
  return { uid, ...newUser } as User
}

// Update user profile
export const updateUserProfile = async (
  uid: string, 
  updates: Partial<Omit<User, 'uid' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const userRef = doc(db, 'users', uid)
  
  await setDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

// Sign out
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth)
  
  // Clear any stored data
  localStorage.removeItem('emailForSignIn')
  localStorage.removeItem('profile_complete')
}

// Get current user data
export const getCurrentUser = async (): Promise<User | null> => {
  const currentUser = auth.currentUser
  
  if (!currentUser) return null

  const userRef = doc(db, 'users', currentUser.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) return null

  return { uid: currentUser.uid, ...userSnap.data() } as User
}

// Check if user profile is complete
export const isProfileComplete = (user: User): boolean => {
  return !!(user.firstName && user.lastName)
}