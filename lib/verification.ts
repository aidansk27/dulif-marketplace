'use client'

import { collection, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore'
import { db } from './firebase'

// Generate a random 6-digit code
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store verification code in Firestore
export const storeVerificationCode = async (email: string, code: string): Promise<void> => {
  const codeDoc = doc(db, 'verificationCodes', email)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  
  await setDoc(codeDoc, {
    code,
    email,
    expiresAt,
    createdAt: new Date(),
    attempts: 0
  })
}

// Verify the code
export const verifyCode = async (email: string, inputCode: string): Promise<boolean> => {
  const codeDoc = doc(db, 'verificationCodes', email)
  const codeSnap = await getDoc(codeDoc)
  
  if (!codeSnap.exists()) {
    throw new Error('Verification code not found or expired')
  }
  
  const data = codeSnap.data()
  const now = new Date()
  
  // Check if expired
  if (data.expiresAt.toDate() < now) {
    await deleteDoc(codeDoc)
    throw new Error('Verification code expired')
  }
  
  // Check attempts
  if (data.attempts >= 3) {
    await deleteDoc(codeDoc)
    throw new Error('Too many incorrect attempts')
  }
  
  // Check if code matches
  if (data.code !== inputCode) {
    // Increment attempts
    await setDoc(codeDoc, { ...data, attempts: data.attempts + 1 }, { merge: true })
    throw new Error('Invalid verification code')
  }
  
  // Success - delete the code
  await deleteDoc(codeDoc)
  return true
}

// Send verification email (mock function - in production you'd use a real email service)
export const sendVerificationEmail = async (email: string, code: string): Promise<void> => {
  // In a real app, you'd use SendGrid, Mailgun, or similar
  // For now, we'll simulate sending and log the code
  console.log(`Verification code for ${email}: ${code}`)
  
  // Store the code in Firestore
  await storeVerificationCode(email, code)
  
  // In development, we'll show an alert with the code
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      alert(`Development Mode: Your verification code is ${code}`)
    }, 1000)
  }
}