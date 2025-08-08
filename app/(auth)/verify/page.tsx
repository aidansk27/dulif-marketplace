'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { EnvelopeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { completeSignIn, sendMagicLink, isMagicLink } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import MockHomeBackground from '@/components/MockHomeBackground'
import { useCountdown } from '@/hooks/useCountdown'

function VerifyPageContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [firebaseErrorCode, setFirebaseErrorCode] = useState('')
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendCount, setResendCount] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { timeLeft, isActive, start, reset: _reset } = useCountdown(30)
  const MotionDiv = motion.div as any

  useEffect(() => {
    const handleSignIn = async () => {
      try {
        const currentUrl = window.location.href
        const currentHost = window.location.host
        
        // Use the correct URL based on environment
        const configuredUrl = process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3001'
          : process.env.NEXT_PUBLIC_APP_URL || 'https://dulif.com'
        const configuredHost = new URL(configuredUrl).host
        
        // Debug info for troubleshooting
        const debugData = {
          currentHost,
          configuredHost,
          currentUrl,
          isMagicLinkResult: isMagicLink(currentUrl),
          emailInLocalStorage: localStorage.getItem('emailForSignIn'),
          emailInSessionStorage: sessionStorage.getItem('emailForSignIn'),
          searchParams: Object.fromEntries(searchParams.entries())
        }
        setDebugInfo(debugData)
        
        console.log('🔍 Verify page debug info:', debugData)
        
        // Only redirect if we're in production and hosts don't match
        if (process.env.NODE_ENV === 'production' && currentHost !== configuredHost) {
          console.log('🔄 Redirecting to canonical host:', configuredHost)
          const canonicalUrl = new URL(currentUrl)
          canonicalUrl.host = configuredHost
          window.location.href = canonicalUrl.toString()
          return
        }
        
        // Check if this is a magic link by looking for Firebase auth parameters
        const urlParams = new URLSearchParams(window.location.search)
        const hasAuthParams = urlParams.has('apiKey') && urlParams.has('oobCode')
        
        if (hasAuthParams && isMagicLink(currentUrl)) {
          console.log('🔗 Processing magic link...')
          
          // Complete the sign-in with Firebase Auth
          const user = await completeSignIn(currentUrl)
          
          console.log('✅ Magic link sign-in successful:', user.email)
          
          // Small delay to ensure auth context and cookies are updated
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Check if user needs to complete profile setup
          if (!user.firstName || !user.lastName || !user.profileComplete) {
            router.push('/profile-setup')
          } else {
            // Redirect to protected homepage (marketplace) with a hard refresh to ensure middleware sees the cookies
            window.location.href = '/'
          }
        } else {
          // Not a magic link, show waiting message
          const storedEmail = localStorage.getItem('emailForSignIn') || sessionStorage.getItem('emailForSignIn')
          if (storedEmail) {
            setEmail(storedEmail)
          } else {
            // No stored email, redirect to signup
            router.push('/signup')
            return
          }
          setIsLoading(false)
        }
      } catch (error: unknown) {
        console.error('Sign-in error:', error)
        const err = error as { message?: string; code?: string }
        setError(err.message || 'Failed to complete sign-in')
        setFirebaseErrorCode(err.code || '')
        setIsLoading(false)
      }
    }

    handleSignIn()
  }, [router, searchParams])

  const handleResendEmail = async () => {
    if (!email || isResending || isLocked) return
    // Enforce 30s gap between first and second
    if (resendCount === 1 && isActive) return
    
    setIsResending(true)
    setError('')
    setFirebaseErrorCode('')
    
    try {
      // Check both storages for remember me preference
      const rememberMe = localStorage.getItem('rememberMe') === 'true' || 
                        sessionStorage.getItem('rememberMe') === 'true'
      await sendMagicLink(email, rememberMe)
      alert(`New magic link sent to ${email}!`)
      if (resendCount === 0) {
        setResendCount(1)
        start(30)
      } else if (resendCount === 1) {
        setResendCount(2)
        setIsLocked(true)
      }
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string }
      setError(err.message || 'Failed to resend magic link')
      setFirebaseErrorCode(err.code || '')
    } finally {
      setIsResending(false)
    }
  }

  // Debug panel component
  const DebugPanel = () => {
    const [isOpen, setIsOpen] = useState(false)
    const showDebug = searchParams.get('debugAuth') === '1'
    
    if (!showDebug || !debugInfo) return null
    
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-red-600 text-white px-3 py-1 rounded text-xs font-mono"
        >
          DEBUG {isOpen ? '▼' : '▲'}
        </button>
        {isOpen && debugInfo && (
          <div className="mt-2 bg-black text-green-400 p-3 rounded text-xs font-mono max-w-md overflow-auto max-h-64">
            <div><strong>Current Host:</strong> {String(debugInfo.currentHost || 'unknown')}</div>
            <div><strong>Configured Host:</strong> {String(debugInfo.configuredHost || 'unknown')}</div>
            <div><strong>Is Magic Link:</strong> {debugInfo.isMagicLinkResult ? 'YES' : 'NO'}</div>
            <div><strong>Email (localStorage):</strong> {String(debugInfo.emailInLocalStorage || 'none')}</div>
            <div><strong>Email (sessionStorage):</strong> {String(debugInfo.emailInSessionStorage || 'none')}</div>
            <div><strong>Firebase Error:</strong> {firebaseErrorCode || 'none'}</div>
            <div><strong>URL Params:</strong></div>
            <pre className="text-xs">{JSON.stringify(debugInfo.searchParams, null, 2)}</pre>
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <MockHomeBackground isBlurred showTitles={false} disableAnimations />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="text-center berkeley-card rounded-xl px-8 py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Completing sign-in...</p>
          </div>
        </div>
        <DebugPanel />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen relative p-4">
        <MockHomeBackground isBlurred showTitles={false} disableAnimations />
        <div className="relative z-10 max-w-md w-full mx-auto">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center berkeley-card"
          >
            {/* Type cast needed for motion.div */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sign-in Failed
            </h1>
            
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            
            {firebaseErrorCode && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">
                  <strong>Error Code:</strong> {firebaseErrorCode}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/signup')}
                variant="primary"
                className="w-full !bg-gradient-to-r !from-[#003262] !to-[#002148] !text-white !border-[#003262] hover:!from-[#002A54] hover:!to-[#001A3A]"
              >
                Try Again
              </Button>
              
              {email && (
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full hover:!bg-[#003262] hover:!text-white hover:!border-[#003262] transition-all duration-200"
                  disabled={isResending || isLocked || (resendCount === 1 && isActive)}
                >
                  {isLocked
                    ? 'Resend limit reached'
                    : isResending
                    ? 'Sending...'
                    : resendCount === 1 && isActive
                    ? `Resend available in ${timeLeft}s`
                    : resendCount === 0
                    ? 'Resend Magic Link'
                    : 'Send One Last Link'}
                </Button>
              )}
            </div>
          </MotionDiv>
        </div>
        <DebugPanel />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative p-4">
      {/* Blurred homepage background */}
      <MockHomeBackground isBlurred showTitles={false} disableAnimations />
      <div className="relative z-10 max-w-md w-full mx-auto flex items-center justify-center min-h-[calc(100vh-2rem)]">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 text-center berkeley-card"
        >
          <div className="mb-6">
            <Logo size="lg" showText={false} />
          </div>
          
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <EnvelopeIcon className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Check Your Email
          </h1>
          
          <p className="text-gray-600 mb-6">
            We&apos;ve sent a magic link to{' '}
            <span className="font-medium text-primary">{email}</span>.
            Click the link in your email to complete sign-in.
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              variant="outline"
              className="w-full hover:!bg-[#003262] hover:!text-white hover:!border-[#003262] transition-all duration-200"
              disabled={isResending || isLocked || (resendCount === 1 && isActive)}
            >
              {isLocked
                ? 'Resend limit reached'
                : isResending
                ? 'Sending...'
                : resendCount === 1 && isActive
                ? `Resend available in ${timeLeft}s`
                : resendCount === 0
                ? 'Resend Magic Link'
                : 'Send One Last Link'}
            </Button>
            
            <Button
              onClick={() => router.push('/signup')}
              variant="ghost"
              className="w-full"
            >
              Use Different Email
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Tip:</strong> Check your spam folder if you don&apos;t see the email within a few minutes.
            </p>
          </div>
        </MotionDiv>
      </div>
      <DebugPanel />
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPageContent />
    </Suspense>
  )
}