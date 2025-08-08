'use client'

import { Timestamp, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth'
import { db, auth } from './firebase'
import { sendVerificationEmail } from './emailService'
import { isValidBerkeleyEmail } from './auth'

const CODES_COLLECTION = 'emailVerificationCodes'
const CODE_TTL_MINUTES = 10
const MAX_ATTEMPTS = 3

const generateSixDigitCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export interface GenerateCodeResult {
  email: string
  code: string
  expiresAt: Timestamp
}

export const generateAndSendCode = async (email: string, rememberMe: boolean, firstName?: string): Promise<GenerateCodeResult> => {
  if (!isValidBerkeleyEmail(email)) {
    throw new Error('Must use a Berkeley email address')
  }

  const code = generateSixDigitCode()
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000))

  const ref = doc(db, CODES_COLLECTION, email)
  await setDoc(ref, {
    email,
    code,
    attempts: 0,
    createdAt: Timestamp.now(),
    expiresAt,
    rememberMe,
  })

  await sendVerificationEmail({ userEmail: email, verificationCode: code, firstName })

  return { email, code, expiresAt }
}

export const verifyCodeAndCreateAccount = async (email: string, code: string): Promise<void> => {
  const ref = doc(db, CODES_COLLECTION, email)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('No verification request found. Please request a new code.')

  const data = snap.data() as any
  if (data.attempts >= MAX_ATTEMPTS) throw new Error('Too many attempts. Please request a new code in a few minutes.')

  // Expiration check
  const now = Timestamp.now()
  if (data.expiresAt && data.expiresAt.toMillis() < now.toMillis()) {
    throw new Error('This code has expired. Please request a new one.')
  }

  if (data.code !== code) {
    await updateDoc(ref, { attempts: (data.attempts || 0) + 1 })
    throw new Error('Invalid code. Please double-check and try again.')
  }

  // At this point, code is valid → create or sign in a user with a random strong password
  const randomPassword = crypto.getRandomValues(new Uint32Array(4)).join('-')

  // Persistence based on rememberMe
  await setPersistence(auth, data.rememberMe ? browserLocalPersistence : browserSessionPersistence)

  try {
    await createUserWithEmailAndPassword(auth, email, randomPassword)
  } catch (err: any) {
    // If the user already exists, we can ignore account-exists error and continue
    if (err?.code !== 'auth/email-already-in-use') throw err
  }
}


