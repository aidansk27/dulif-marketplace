'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { EMAIL_PLACEHOLDERS, BERKELEY_EMAIL_DOMAIN } from '@/lib/constants'
import { useTypingAnimation } from '@/hooks/useTypingAnimation'
import MockHomeBackground from '@/components/MockHomeBackground'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { TermsModal } from '@/components/TermsModal'

export default function LoginPage() {
  const [netId, setNetId] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showUnblur, setShowUnblur] = useState(true)
  const [showPopup, setShowPopup] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsModalTab, setTermsModalTab] = useState<'terms' | 'privacy'>('terms')
  const router = useRouter()
  const MotionDiv = motion.div as any

  const animatedPlaceholder = useTypingAnimation({
    words: EMAIL_PLACEHOLDERS as any,
    typeSpeed: 100,
    deleteSpeed: 50,
    delayBetweenWords: 2000,
  })

  const email = netId ? `${netId}@${BERKELEY_EMAIL_DOMAIN}` : ''

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!netId.trim()) {
      setError('Please enter your Berkeley NetID')
      return
    }
    if (!password) {
      setError('Please enter your password')
      return
    }

    setIsLoading(true)
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
      const userCred = await signInWithEmailAndPassword(auth, email, password)
      if (!userCred.user.emailVerified) {
        alert('Please verify your Berkeley email address via the link sent to you.')
      }
      router.push('/')
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') setError('Incorrect password. Please try again.')
      else if (err.code === 'auth/user-not-found') setError('No account found for that email. Sign up first.')
      else if (err.code === 'auth/too-many-requests') setError('Too many failed attempts. Please wait and try again.')
      else {
        console.error('Login error:', err)
        setError('Failed to log in. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const blurTimer = setTimeout(() => setShowUnblur(false), 1000)
    const popupTimer = setTimeout(() => setShowPopup(true), 1200)
    return () => { clearTimeout(blurTimer); clearTimeout(popupTimer) }
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      <MockHomeBackground isBlurred={!showUnblur} showTitles={true} />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showPopup ? 1 : 0, y: showPopup ? 0 : 20 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="berkeley-card rounded-3xl p-10 berkeley-glow relative z-20">
            <div className="text-center mb-6">
              <Logo size="xl" showText={false} />
              <h2 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">Berkeley Student Marketplace</h2>
              <p className="text-muted text-base">Welcome back</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Berkeley Email</label>
                <div className="relative">
                  <div className="flex items-center border-2 border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-secondary/20 focus-within:border-secondary bg-card transition-all duration-200">
                    <input
                      type="text"
                      value={netId}
                      onChange={(e) => setNetId(e.target.value)}
                      placeholder={animatedPlaceholder}
                      className="flex-1 px-4 py-3 text-base focus:outline-none bg-transparent text-foreground placeholder:text-muted"
                      disabled={isLoading}
                    />
                    <div className="px-4 py-3 bg-primary-50 text-primary font-medium border-l border-border text-base">@{BERKELEY_EMAIL_DOMAIN}</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-4 py-3 text-base focus:outline-none bg-card text-foreground placeholder:text-muted border-2 border-border rounded-xl"
                  required
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary bg-card border-2 border-border rounded focus:ring-primary focus:ring-2"
                />
                <label htmlFor="rememberMe" className="text-sm text-foreground cursor-pointer">Remember me</label>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={!netId || !password || isLoading}
                loading={isLoading}
                variant="primary"
                className="w-full text-lg py-3 font-semibold"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-8 space-y-4 text-center">
              <p className="text-sm text-muted">
                Don&apos;t have an account? <a href="/signup" className="text-primary hover:underline font-semibold">Sign up</a>
              </p>

              <p className="text-sm text-muted">
                By continuing, you agree to our{' '}
                <button
                  onClick={() => { setTermsModalTab('terms'); setShowTermsModal(true) }}
                  className="text-primary hover:underline font-semibold"
                >
                  Terms of Service
                </button>
                {' '}and{' '}
                <button
                  onClick={() => { setTermsModalTab('privacy'); setShowTermsModal(true) }}
                  className="text-primary hover:underline font-semibold"
                >
                  Privacy Policy
                </button>
              </p>
            </div>
          </div>
        </MotionDiv>
      </div>

      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} defaultTab={termsModalTab} />
    </div>
  )
}


