'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import MockHomeBackground from '@/components/MockHomeBackground'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { TermsModal } from '@/components/TermsModal'
import { auth, db } from '@/lib/firebase'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { actionCodeSettings } from '@/lib/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { ChevronLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'

export default function SignupPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showUnblur, _setShowUnblur] = useState(false) // Start blurred since coming from first page
  const [showPopup, _setShowPopup] = useState(true) // Start visible since transitioning from first page
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsModalTab, setTermsModalTab] = useState<'terms' | 'privacy'>('terms')
  const [passwordIssues, setPasswordIssues] = useState<string[]>([])
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const MotionDiv = motion.div as React.ElementType

  const email = (typeof window !== 'undefined') ? (sessionStorage.getItem('pendingSignupEmail') || '') : ''
  const remember = (typeof window !== 'undefined') ? (sessionStorage.getItem('pendingRememberMe') === 'true') : true

  useEffect(() => {
    if (!email) {
      router.replace('/signup')
    }
  }, [email, router])

  // No animation needed since we're transitioning from the first page

  const validatePassword = () => {
    const issues: string[] = []
    if (password.length < 8) issues.push('at least 8 characters')
    if (!/[A-Z]/.test(password)) issues.push('at least one uppercase letter')
    if (!/\d/.test(password)) issues.push('at least one digit')
    setPasswordIssues(issues)
    return issues
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const issues = validatePassword()
    if (issues.length) return
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await sendEmailVerification(user, actionCodeSettings)
      await setDoc(doc(db, 'users', user.uid), {
        email,
        firstName: '',
        lastName: '',
        photoURL: '',
        rating: 0,
        ratingCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profileComplete: false,
      })
      localStorage.setItem('emailForSignIn', email)
      router.push('/verify')
    } catch (err: unknown) {
      const error = err as { code?: string }
      if (error?.code === 'auth/email-already-in-use') setError('Email already registered. Please log in instead.')
      else if (error?.code === 'auth/weak-password') setError('Password is too weak. Use at least 6 characters.')
      else setError('Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <MockHomeBackground isBlurred={!showUnblur} showTitles={true} showCursor={true} disableAnimations={true} />

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
              <h2 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">Create a Password</h2>
              <p className="text-muted text-base">for {email}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
                    <div className="relative">
                      <button
                        type="button"
                        onMouseEnter={() => setShowPasswordTooltip(true)}
                        onMouseLeave={() => setShowPasswordTooltip(false)}
                        className="ml-2 text-xs text-muted border border-border px-2 py-0.5 rounded hover:bg-gray-50 transition-colors"
                      >
                        ?
                      </button>
                      {showPasswordTooltip && (
                        <div className="absolute right-0 top-8 w-64 p-3 bg-gray-100 border border-gray-300 rounded-lg shadow-lg z-50">
                          <p className="font-semibold text-sm text-gray-800 mb-2">Password Requirements:</p>
                          <ul className="text-xs text-gray-700 space-y-1">
                            <li>• At least 8 characters</li>
                            <li>• At least one uppercase letter</li>
                            <li>• At least one digit</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full px-4 py-3 pr-12 text-base focus:outline-none bg-card text-foreground placeholder:text-muted border-2 border-border rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-4 py-3 pr-12 text-base focus:outline-none bg-card text-foreground placeholder:text-muted border-2 border-border rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                {passwordIssues.length > 0 && (
                  <div className="text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg p-3">
                    <p className="font-semibold mb-1">Your password must include:</p>
                    <ul className="list-disc ml-5">
                      {passwordIssues.map((p, i) => (<li key={i}>{p}</li>))}
                    </ul>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading} 
                loading={isLoading} 
                variant="primary" 
                className="w-full text-lg py-4 font-semibold !bg-gradient-to-r !from-[#003262] !to-[#002148] !text-white hover:!from-[#002A54] hover:!to-[#001A3A]"
                size="lg"
              >
                Create Account
              </Button>

              {/* Go Back Link */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-sm text-muted hover:text-foreground transition-colors flex items-center justify-center"
                >
                  <ChevronLeftIcon className="w-4 h-4 mr-1" />
                  Go Back
                </button>
              </div>
            </form>

            <div className="mt-8 space-y-4 text-center">
              <p className="text-sm text-muted">
                By continuing, you agree to our{' '}
                <button onClick={() => { setTermsModalTab('terms'); setShowTermsModal(true) }} className="text-primary hover:underline font-semibold">Terms of Service</button>
                {' '}and{' '}
                <button onClick={() => { setTermsModalTab('privacy'); setShowTermsModal(true) }} className="text-primary hover:underline font-semibold">Privacy Policy</button>
              </p>
            </div>
          </div>
        </MotionDiv>
      </div>

      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} defaultTab={termsModalTab} />
    </div>
  )
}


