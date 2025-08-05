'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { sendMagicLink } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useTypingAnimation } from '@/hooks/useTypingAnimation'
import { TermsModal } from '@/components/TermsModal'

const BERKELEY_EMAIL_DOMAIN = 'berkeley.edu'

// Mock listings for background preview
const mockListings = [
  { id: '1', title: 'MacBook Pro 16" M2', price: 2800, image: '/images/mock-macbook.jpg', category: 'Electronics' },
  { id: '2', title: 'Berkeley Dorm Furniture Set', price: 450, image: '/images/mock-furniture.jpg', category: 'Furniture' },
  { id: '3', title: 'Chemistry Textbook Bundle', price: 120, image: '/images/mock-books.jpg', category: 'Books' },
  { id: '4', title: 'Gaming Setup - Monitor & Keyboard', price: 680, image: '/images/mock-gaming.jpg', category: 'Electronics' },
  { id: '5', title: 'Physics Lab Equipment', price: 95, image: '/images/mock-lab.jpg', category: 'Academic' },
  { id: '6', title: 'Study Desk & Chair', price: 200, image: '/images/mock-desk.jpg', category: 'Furniture' },
]

export default function SignupPage() {
  const [netId, setNetId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showTermsModal, setShowTermsModal] = useState(false)
  const router = useRouter()

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Blurred Background with Mock Listings */}
      <div className="absolute inset-0 gradient-prestigious">
        <div className="absolute inset-0 prestigious-bg opacity-60"></div>
        
        {/* Mock Marketplace Background */}
        <div className="absolute inset-0 blur-sm opacity-30 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="berkeley-card rounded-2xl p-4 h-80"
                >
                  <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl h-48 mb-4 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">{listing.category}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 truncate">{listing.title}</h3>
                  <p className="text-2xl font-bold text-primary">${listing.price}</p>
                  <div className="mt-2">
                    <div className="flex items-center">
                      <div className="flex space-x-1">
                        {[1,2,3,4,5].map(star => (
                          <div key={star} className="w-4 h-4 bg-secondary rounded-sm"></div>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-muted">(4.8)</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sign-up Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="berkeley-card rounded-3xl p-10 berkeley-glow relative z-20">
            {/* Logo */}
            <div className="text-center mb-8">
                          <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-2xl mb-4">
                <span className="text-white font-bold text-3xl">D</span>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary-600 to-secondary bg-clip-text text-transparent tracking-tight text-center">
                dulif™
              </h1>
            </div>
              <h2 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">
                Welcome to Berkeley's Marketplace
              </h2>
              <p className="text-muted text-base">
                Secure marketplace exclusively for UC Berkeley students
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Berkeley Email Input */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Berkeley Email Address
                </label>
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
                    <div className="px-4 py-3 bg-primary-50 text-primary font-medium border-l border-border text-base">
                      @{BERKELEY_EMAIL_DOMAIN}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={!netId || isLoading}
                loading={isLoading}
                className="w-full text-lg py-4 font-semibold"
                size="lg"
              >
                {isLoading ? 'Sending Sign-In Link...' : 'Send Sign-In Link'}
              </Button>
            </form>

            <div className="mt-8 space-y-4 text-center">
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                <p className="text-sm text-primary-700 font-semibold">
                  🎓 Exclusively for UC Berkeley students
                </p>
                <p className="text-xs text-primary-600 mt-1">
                  Must have a valid @berkeley.edu email address
                </p>
              </div>
              
              <p className="text-sm text-muted">
                By continuing, you agree to our{' '}
                <button 
                  onClick={() => setShowTermsModal(true)}
                  className="text-primary hover:underline font-semibold"
                >
                  Terms of Service and Privacy Policy
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Terms Modal */}
      <TermsModal 
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </div>
  )
}