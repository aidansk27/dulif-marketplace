'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRightIcon } from '@heroicons/react/24/solid'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { useRouter } from 'next/navigation'
import { useTypingAnimation } from '@/hooks/useTypingAnimation'
import { TermsModal } from '@/components/TermsModal'
import MockHomeBackground from '@/components/MockHomeBackground'

const BERKELEY_EMAIL_DOMAIN = 'berkeley.edu'

// Background is provided by MockHomeBackground

export default function SignupPage() {
  const [netId, setNetId] = useState('')
  const [isLoading, _setIsLoading] = useState(false)
  const [error, setError] = useState('')
  // Two-step signup: this page collects only email (NetID)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsModalTab, setTermsModalTab] = useState<'terms' | 'privacy'>('terms')
  const [showUnblur, setShowUnblur] = useState(true)
  const [showPopup, setShowPopup] = useState(false)
  // Password is handled on the next page
  
  const router = useRouter()
  // Work around framer-motion TS inference hiccup in this environment
  const MotionDiv = motion.div as React.ElementType

  const email = netId ? `${netId}@${BERKELEY_EMAIL_DOMAIN}` : ''

  // Animated placeholder for email input
  const animatedPlaceholder = useTypingAnimation({
    words: ['arodgers12', 'mlynch24', 'jkidd4', 'amorgan76', 'barbaralee17'],
    typeSpeed: 100,
    deleteSpeed: 50,
    delayBetweenWords: 2000,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!netId.trim()) {
      setError('Please enter your Berkeley NetID')
      return
    }

    // Save email for next step and navigate to password page
    try { sessionStorage.setItem('pendingSignupEmail', email) } catch {}
    router.push('/signup/password')
  }

  // 1-second glimpse of homepage, then blur for session, then show popup
  useEffect(() => {
    const blurTimer = setTimeout(() => setShowUnblur(false), 1000)
    const popupTimer = setTimeout(() => setShowPopup(true), 1200) // 200ms after blur starts
    return () => {
      clearTimeout(blurTimer)
      clearTimeout(popupTimer)
    }
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      <MockHomeBackground isBlurred={!showUnblur} showTitles={true} showCursor={true} />

      {/* Sign-up Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showPopup ? 1 : 0, y: showPopup ? 0 : 20 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-200 relative z-20">
            {/* Logo */}
            <div className="text-center mb-6">
              <Logo size="xl" showText={false} />
              <h2 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">Berkeley Student Marketplace</h2>
              <p className="text-muted text-base">Secure marketplace exclusively for Berkeley students</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Berkeley Email Input */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Enter your Berkeley email address:
                </label>
                <div className="relative">
                  <div className="flex items-center border-2 border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#FDB515]/30 focus-within:border-[#FDB515] focus-within:shadow-lg focus-within:shadow-[#FDB515]/40 bg-card transition-all duration-200">
                    <input
                      type="text"
                      value={netId}
                      onChange={(e) => setNetId(e.target.value)}
                      placeholder={animatedPlaceholder}
                      className="flex-1 px-4 py-3 text-base focus:outline-none bg-transparent text-foreground placeholder:text-muted"
                      disabled={isLoading}
                    />
                    <div className="px-4 py-3 bg-primary-50 text-primary font-medium border-l border-border text-base">
                      @{BERKELEY_EMAIL_DOMAIN}
                    </div>
                  </div>
                </div>

              </div>

              {/* Next Step Only */}

              {error && (
                <MotionDiv
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </MotionDiv>
              )}

              <Button
                type="submit"
                disabled={!netId || isLoading}
                loading={isLoading}
                variant="primary"
                className="w-full text-lg py-4 font-semibold flex items-center justify-center"
                size="lg"
              >
                {isLoading ? 'Loading...' : (<><span>Next</span><ChevronRightIcon className="w-5 h-5 ml-2" /></>)}
              </Button>
            </form>

            <div className="mt-8 space-y-4 text-center">
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                <p className="text-sm text-primary-700 font-semibold">
                  🎓 Exclusively for Berkeley students
                </p>
                <p className="text-xs text-primary-600 mt-1">
                  Must have a valid @berkeley.edu email address
                </p>
              </div>
              
              <p className="text-sm text-muted">
                By continuing, you agree to our{' '}
                <button 
                  onClick={() => {
                    setTermsModalTab('terms')
                    setShowTermsModal(true)
                  }}
                  className="text-primary hover:underline font-semibold"
                >
                  Terms of Service
                </button>
                {' '}and{' '}
                <button 
                  onClick={() => {
                    setTermsModalTab('privacy')
                    setShowTermsModal(true)
                  }}
                  className="text-primary hover:underline font-semibold"
                >
                  Privacy Policy
                </button>
              </p>
            </div>
          </div>
        </MotionDiv>
      </div>

      {/* Terms Modal */}
            <TermsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)}
        defaultTab={termsModalTab}
      />
    </div>
  )
}