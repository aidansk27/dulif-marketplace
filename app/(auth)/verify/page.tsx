'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { EnvelopeIcon, ClockIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { verifyEmailCode, createAccount, sendVerificationCode } from '@/lib/auth'
import { useCountdown } from '@/hooks/useCountdown'
import { Button } from '@/components/ui/Button'
import { VerificationInput } from '@/components/VerificationInput'

export default function VerifyPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [emailsSent, setEmailsSent] = useState(1)
  const [isLocked, setIsLocked] = useState(false)
  const router = useRouter()
  
  const { timeLeft, isActive, start } = useCountdown(30)
  const MAX_EMAILS = 3

  useEffect(() => {
    const storedEmail = localStorage.getItem('emailForVerification')
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      router.push('/signup')
    }
  }, [router])

  const handleCodeComplete = async (code: string) => {
    if (!email) return
    
    setIsLoading(true)
    setError('')

    try {
      // Verify the code
      await verifyEmailCode(email, code)
      
      // Create account
      await createAccount(email)
      
      // Clear stored email
      localStorage.removeItem('emailForVerification')
      
      // Redirect to profile setup
      router.push('/profile-setup')
    } catch (error: any) {
      setError(error.message || 'Invalid verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email || isResending || isActive || isLocked) return

    if (emailsSent >= MAX_EMAILS) {
      setIsLocked(true)
      setError(`Maximum of ${MAX_EMAILS} verification codes sent. Please go back to sign up.`)
      return
    }

    setIsResending(true)
    setError('')

    try {
      await sendVerificationCode(email)
      setEmailsSent(prev => prev + 1)
      start()
      
      if (emailsSent + 1 >= MAX_EMAILS) {
        setIsLocked(true)
      }
    } catch (error: any) {
      setError(error.message || 'Failed to resend verification code')
    } finally {
      setIsResending(false)
    }
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

          {/* Header */}
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
              Enter Verification Code
            </h2>
            <p className="text-muted text-center mb-4">
              We've sent a 6-digit code to
            </p>
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mb-6">
              <p className="font-semibold text-primary text-center break-all">{email}</p>
            </div>
          </div>

          {/* Verification Input */}
          <div className="mb-8">
            <VerificationInput
              length={6}
              onComplete={handleCodeComplete}
              isLoading={isLoading}
              error={error}
            />
          </div>

          {/* Development Mode Alert */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-700 font-medium text-center">
                🛠️ Development Mode: Code will appear in browser alert
              </p>
            </div>
          )}

          {/* Resend section */}
          <div className="border-t border-border pt-6">
            <div className="text-center">
              <p className="text-sm text-foreground font-medium mb-2">
                Didn't receive the code?
              </p>
              
              {/* Email Count Warning */}
              {emailsSent > 1 && !isLocked && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-amber-700">
                    ⚠️ {emailsSent}/{MAX_EMAILS} verification codes sent
                  </p>
                </div>
              )}
              
              {/* Locked Warning */}
              {isLocked && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center space-x-2">
                    <LockClosedIcon className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-700 font-medium">
                      Maximum codes reached. Please go back to sign up.
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleResendCode}
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
                  'Send New Code'
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