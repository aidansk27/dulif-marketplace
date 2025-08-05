'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { EnvelopeIcon, ClockIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { completeSignIn, sendMagicLink } from '@/lib/auth'
import { useCountdown } from '@/hooks/useCountdown'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function VerifyPage() {
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [isCompleting, setIsCompleting] = useState(false)
  const [emailsSent, setEmailsSent] = useState(1) // Start with 1 (initial email)
  const [isLocked, setIsLocked] = useState(false)
  const router = useRouter()
  
  const { timeLeft, isActive, start } = useCountdown(30) // 30 second timer
  const MAX_EMAILS = 3

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem('emailForSignIn')
    if (storedEmail) {
      setEmail(storedEmail)
    }

    // Check if we arrived here via email link
    const urlParams = new URLSearchParams(window.location.search)
    const isSignInWithEmailLink = urlParams.get('mode') === 'signIn'
    
    if (isSignInWithEmailLink && storedEmail) {
      completeSignInProcess(storedEmail)
    }
  }, [])

  const completeSignInProcess = async (emailAddress: string) => {
    setIsCompleting(true)
    try {
      await completeSignIn(emailAddress, window.location.href)
      // Clear the stored email
      localStorage.removeItem('emailForSignIn')
      router.push('/profile-setup')
    } catch (error: any) {
      setError(error.message || 'Failed to complete sign-in')
      setIsCompleting(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (verificationCode.length !== 6) return

    setIsLoading(true)
    setError('')

    try {
      // In a real implementation, you'd verify the code here
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/profile-setup')
    } catch (error: any) {
      setError(error.message || 'Invalid verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (!email || isResending || isActive || isLocked) return

    // Check if max emails reached
    if (emailsSent >= MAX_EMAILS) {
      setIsLocked(true)
      setError(`Maximum of ${MAX_EMAILS} verification emails sent. Please go back to sign up or contact support.`)
      return
    }

    setIsResending(true)
    setError('')

    try {
      await sendMagicLink(email)
      setEmailsSent(prev => prev + 1)
      start() // Start the 30-second countdown timer
      
      if (emailsSent + 1 >= MAX_EMAILS) {
        setIsLocked(true)
      }
    } catch (error: any) {
      setError(error.message || 'Failed to resend email')
    } finally {
      setIsResending(false)
    }
  }

  // Show loading state if completing sign-in
  if (isCompleting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Completing Sign-In
          </h2>
          <p className="text-muted">
            Please wait while we verify your account...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-prestigious flex items-center justify-center p-4 relative overflow-hidden prestigious-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="berkeley-card rounded-3xl p-10 berkeley-glow relative z-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-2xl mb-3">
                <span className="text-white font-bold text-2xl">D</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-600 to-secondary bg-clip-text text-transparent tracking-tight text-center">
                dulif™
              </h1>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <EnvelopeIcon className="w-10 h-10 text-secondary-600" />
            </motion.div>
                
            <h2 className="text-2xl font-semibold text-foreground mb-4 tracking-tight">
              Check Your Email
            </h2>
            <p className="text-muted text-center mb-4">
              We've sent a secure sign-in link to
            </p>
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mb-6">
              <p className="font-semibold text-primary text-center break-all">{email}</p>
            </div>
            <div className="bg-secondary-50 border border-secondary-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-secondary-700 font-medium text-center">
                📧 Click "Sign in to dulif-a3324" button in your email
              </p>
              <p className="text-xs text-secondary-600 text-center mt-1">
                ⚠️ Check your spam folder if you don't see the email
              </p>
            </div>
          </div>

          {/* Email Instructions */}
          <div className="border-t border-border pt-6 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📧 How to sign in:</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Check your email (including spam folder)</li>
                <li>2. Look for "Sign in to dulif-a3324" button</li>
                <li>3. Click the button to sign in instantly</li>
                <li>4. You'll be redirected back here automatically</li>
              </ol>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6"
            >
              <p className="text-sm text-red-600 font-medium text-center">{error}</p>
            </motion.div>
          )}

          {/* Resend section */}
          <div className="border-t border-border pt-6">
            <div className="text-center">
              <p className="text-sm text-foreground font-medium mb-2">
                Haven't received the email?
              </p>
              <p className="text-sm text-muted mb-4">
                Check your spam/junk folder or wait to request a new link
              </p>
              
              {/* Email Count Warning */}
              {emailsSent > 1 && !isLocked && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-amber-700">
                    ⚠️ {emailsSent}/{MAX_EMAILS} verification emails sent
                  </p>
                </div>
              )}
              
              {/* Locked Warning */}
              {isLocked && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center space-x-2">
                    <LockClosedIcon className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-700 font-medium">
                      Maximum emails reached. Please go back to sign up.
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleResendEmail}
                disabled={isActive || isResending || isLocked}
                loading={isResending}
                variant="outline"
                className="min-w-[160px] relative mb-4"
              >
                {isLocked ? (
                  <div className="flex items-center space-x-2">
                    <LockClosedIcon className="w-4 h-4" />
                    <span>Locked</span>
                  </div>
                ) : isActive ? (
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>Wait {timeLeft}s</span>
                  </div>
                ) : (
                  'Send New Link'
                )}
              </Button>

              {/* Back to signup */}
              <div>
                <button
                  onClick={() => router.push('/signup')}
                  className="text-sm text-muted hover:text-primary transition-colors duration-200"
                >
                  ← Back to sign up
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}