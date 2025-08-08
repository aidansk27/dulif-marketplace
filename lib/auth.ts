import {
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  signOut as firebaseSignOut,
  ActionCodeSettings,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import { User } from './types'
import { BERKELEY_EMAIL_DOMAIN } from './constants'

// Export auth instance for other components
export { auth }

// Auth helpers
export const isValidBerkeleyEmail = (email: string): boolean => {
  return email.endsWith(`@${BERKELEY_EMAIL_DOMAIN}`)
}

export const formatBerkeleyEmail = (netid: string): string => {
  return `${netid}@${BERKELEY_EMAIL_DOMAIN}`
}

// Check if URL is a magic link
export const isMagicLink = (url: string): boolean => {
  return isSignInWithEmailLink(auth, url)
}

// Send magic link to email with Remember Me option
export const sendMagicLink = async (email: string, rememberMe: boolean = false): Promise<void> => {
  if (!isValidBerkeleyEmail(email)) {
    throw new Error('Must use a Berkeley email address')
  }

  // Set persistence based on Remember Me choice
  const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence
  await setPersistence(auth, persistence)

  // Use the correct URL based on environment
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001'
    : process.env.NEXT_PUBLIC_APP_URL || 'https://dulif.com'
    
  const actionCodeSettings: ActionCodeSettings = {
    url: `${baseUrl}/verify`,
    handleCodeInApp: true
  }

  // Include dynamicLinkDomain only if provided
  if (process.env.NEXT_PUBLIC_FIREBASE_DYNAMIC_LINK_DOMAIN) {
    actionCodeSettings.dynamicLinkDomain = process.env.NEXT_PUBLIC_FIREBASE_DYNAMIC_LINK_DOMAIN
  }

  console.log('📧 Sending magic link with settings:', {
    url: actionCodeSettings.url,
    host: new URL(actionCodeSettings.url).host,
    rememberMe
  })

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    
    // Save email to storage based on Remember Me choice
    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem('emailForSignIn', email)
    
    console.log(`📧 Magic link sent to ${email} (Remember Me: ${rememberMe})`)
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
export const completeSignIn = async (url: string): Promise<User> => {
  console.log('🔍 Checking magic link:', url)
  
  if (!isSignInWithEmailLink(auth, url)) {
    console.error('❌ Not a valid sign-in link')
    throw new Error('Invalid sign-in link. Please use the link from your email.')
  }

  // Read emailForSignIn from both storages
  let email = localStorage.getItem('emailForSignIn') || sessionStorage.getItem('emailForSignIn')
  const emailExisted = !!email
  
  console.log('📧 Email from storage:', email, 'existed:', emailExisted)
  
  // If missing, prompt user for @berkeley.edu email (block until provided)
  if (!email) {
    console.log('🔍 No stored email, prompting user...')
    do {
      email = prompt('Please enter your @berkeley.edu email address to complete sign-in:')
      if (!email) {
        throw new Error('Email address is required to complete sign-in.')
      }
      if (!isValidBerkeleyEmail(email)) {
        alert('Please enter a valid @berkeley.edu email address.')
        email = null // Reset to continue loop
      }
    } while (!email)
  }

  if (!isValidBerkeleyEmail(email)) {
    console.error('❌ Invalid Berkeley email:', email)
    throw new Error('Must use a valid @berkeley.edu email address.')
  }

  try {
    const result = await signInWithEmailLink(auth, email, url)
    
    // Clean up emailForSignIn from both storages
    localStorage.removeItem('emailForSignIn')
    sessionStorage.removeItem('emailForSignIn')
    
    // Get or create user document
    const user = await getOrCreateUser(result.user.uid, email)
    
    console.log(`✅ Sign-in complete for ${email} (emailForSignIn existed: ${emailExisted})`)
    return user
  } catch (error: any) {
    console.error('❌ Sign-in failed:', error.code, error.message)
    throw error
  }
}

// Get or create user document in Firestore
export const getOrCreateUser = async (uid: string, email: string): Promise<User> => {
  const userDoc = doc(db, 'users', uid)
  const userSnap = await getDoc(userDoc)
  
  if (userSnap.exists()) {
    return userSnap.data() as User
  }
  
  // Create new user document
  const newUser: User = {
    uid,
    email,
    firstName: '',
    lastName: '',
    createdAt: new Date(),
    isVerified: true,
    profileComplete: false
  }
  
  await setDoc(userDoc, {
    ...newUser,
    createdAt: serverTimestamp()
  })
  
  return newUser
}

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser
  if (!firebaseUser) return null
  
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
  if (!userDoc.exists()) return null
  
  return userDoc.data() as User
}

// Sign out
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth)
  
  // Clear any remaining localStorage items
  localStorage.removeItem('emailForSignIn')
  localStorage.removeItem('rememberMe')
}

// Check if user is remembered (has persistent session)
export const isUserRemembered = (): boolean => {
  return localStorage.getItem('firebase:authUser:' + auth.app.options.apiKey + ':[DEFAULT]') !== null
}

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<User>): Promise<void> => {
  const userDoc = doc(db, 'users', uid)
  await setDoc(userDoc, {
    ...updates,
    updatedAt: serverTimestamp()
  }, { merge: true })
}