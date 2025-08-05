'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline'
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
  const router = useRouter()
  
  const { timeLeft, isActive, start } = useCountdown(60)

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem('emailForSignIn')
    if (storedEmail) {
      setEmail(storedEmail)
    }

    // Check if this is a magic link callback
    const handleMagicLinkSignIn = async () => {
      if (window.location.href.includes('apiKey=') && !isCompleting) {
        setIsCompleting(true)
        try {
          await completeSignIn()
          router.push('/')
        } catch (error: any) {
          setError(error.message || 'Failed to complete sign-in')
          setIsCompleting(false)
        }
      }
    }

    handleMagicLinkSignIn()
  }, [router, isCompleting])

  const handleResendLink = async () => {
    if (!email) {
      setError('Email not found. Please go back and try again.')
      return
    }

    setIsResending(true)
    setError('')

    try {
      await sendMagicLink(email)
      start(60) // Start 60-second countdown
    } catch (error: any) {
      setError(error.message || 'Failed to resend link')
    } finally {
      setIsResending(false)
    }
  }

  const handleManualVerification = (e: React.FormEvent) => {
    e.preventDefault()
    setError('Manual verification codes are not supported. Please use the link sent to your email.')
  }

  const goBack = () => {
    localStorage.removeItem('emailForSignIn')
    router.push('/signup')
  }

  if (isCompleting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Completing Sign-In
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your account...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 backdrop-blur-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/dulif-logo.png"
              alt="dulif™"
              width={120}
              height={40}
              className="mx-auto mb-4"
            />
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <EnvelopeIcon className="w-8 h-8 text-green-600" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Check Your Email
            </h1>
            
            <p className="text-gray-600 mb-2">
              We sent a magic link to
            </p>
            
            <p className="text-primary font-medium break-all">
              {email || 'your Berkeley email'}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Click the link in your email</strong> to sign in instantly. 
              The link will bring you back here to complete the process.
            </p>
          </div>

          {/* Manual Code Entry (Optional) */}
          <form onSubmit={handleManualVerification} className="space-y-4 mb-6">
            <Input
              type="text"
              placeholder="Enter 6-digit code (if provided)"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
            
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={verificationCode.length !== 6}
            >
              Verify Code
            </Button>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {/* Resend Link */}
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Didn't receive the email?
            </p>
            
            <Button
              onClick={handleResendLink}
              variant="ghost"
              loading={isResending}
              disabled={isActive}
              className="text-sm"
            >
              {isActive ? (
                <span className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Resend in {timeLeft}s
                </span>
              ) : (
                'Resend Link'
              )}
            </Button>
          </div>

          {/* Back Button */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={goBack}
              className="text-sm text-gray-500 hover:text-primary transition-colors"
            >
              ← Back to sign up
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}