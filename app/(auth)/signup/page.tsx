'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { sendMagicLink } from '@/lib/auth'
import { useTypingAnimation } from '@/hooks/useTypingAnimation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EMAIL_PLACEHOLDERS, BERKELEY_EMAIL_DOMAIN } from '@/lib/constants'

export default function SignupPage() {
  const [netId, setNetId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const animatedPlaceholder = useTypingAnimation({
    words: EMAIL_PLACEHOLDERS,
    typeSpeed: 100,
    deleteSpeed: 50,
    delayBetweenWords: 1500,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!netId.trim()) {
      setError('Please enter your NetID')
      return
    }

    // Validate NetID format (basic validation)
    if (!/^[a-zA-Z0-9._-]+$/.test(netId)) {
      setError('Invalid NetID format')
      return
    }

    const email = `${netId}@${BERKELEY_EMAIL_DOMAIN}`
    setIsLoading(true)

    try {
      await sendMagicLink(email)
      router.push('/verify')
    } catch (error: any) {
      setError(error.message || 'Failed to send sign-in link')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="berkeley-card rounded-3xl p-10 berkeley-glow relative z-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-600 to-secondary bg-clip-text text-transparent tracking-tight">
                dulif™
              </h1>
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">
              Welcome to Berkeley's Marketplace
            </h2>
            <p className="text-muted text-base">
              The premier student marketplace for UC Berkeley
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Animated Email Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Berkeley Email
              </label>
              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                  <input
                    type="text"
                    value={netId}
                    onChange={(e) => setNetId(e.target.value)}
                    placeholder={animatedPlaceholder}
                    className="flex-1 px-3 py-3 text-base focus:outline-none"
                    disabled={isLoading}
                  />
                  <div className="px-3 py-3 bg-gray-50 text-gray-600 border-l border-gray-300 text-base">
                    @{BERKELEY_EMAIL_DOMAIN}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            <Button
              type="submit"
              loading={isLoading}
              className="w-full py-3 text-base"
              size="lg"
            >
              Continue
            </Button>
          </form>

          {/* Terms */}
          <p className="text-center text-xs text-gray-500 mt-6">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/terms" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Only Berkeley students with @berkeley.edu emails can join
          </p>
        </div>
      </motion.div>
    </div>
  )
}