'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { sendVerificationCode } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useTypingAnimation } from '@/hooks/useTypingAnimation'
import { TermsModal } from '@/components/TermsModal'

const BERKELEY_EMAIL_DOMAIN = 'berkeley.edu'

// Mock listings for background preview
const mockListings = [
  { id: '1', title: 'MacBook Pro M2 16" (Excellent)', price: 2400, seller: 'Sarah M.', rating: 4.9, category: 'Electronics', urgent: true },
  { id: '2', title: 'Organic Chemistry Textbook', price: 85, seller: 'Mike K.', rating: 4.8, category: 'Textbooks', urgent: false },
  { id: '3', title: 'IKEA Desk + Chair Set', price: 180, seller: 'Jessica L.', rating: 5.0, category: 'Furniture', urgent: false },
  { id: '4', title: 'iPad Air + Apple Pencil', price: 450, seller: 'David R.', rating: 4.7, category: 'Electronics', urgent: true },
  { id: '5', title: 'Physics 7A Lab Kit', price: 65, seller: 'Amy Z.', rating: 4.9, category: 'Academic', urgent: false },
  { id: '6', title: 'Mini Fridge (Dorm Size)', price: 120, seller: 'Tom B.', rating: 4.6, category: 'Appliances', urgent: false },
  { id: '7', title: 'Calculus Early Transcendentals', price: 75, seller: 'Lisa P.', rating: 4.8, category: 'Textbooks', urgent: false },
  { id: '8', title: 'Gaming Monitor 27" 144Hz', price: 220, seller: 'Alex M.', rating: 4.9, category: 'Electronics', urgent: true },
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
      await sendVerificationCode(email)
      router.push('/verify')
    } catch (error: any) {
      setError(error.message || 'Failed to send verification code')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Blurred Background with Mock Homepage */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 prestigious-bg opacity-40"></div>
        
        {/* Mock Homepage Background */}
        <div className="absolute inset-0 blur-sm opacity-40 overflow-hidden">
          {/* Mock Navigation Bar */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              {/* Mock Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg"></div>
                <span className="text-xl font-bold text-primary">dulif™</span>
              </div>
              
              {/* Mock Search Bar */}
              <div className="flex-1 max-w-lg mx-8">
                <div className="bg-gray-100 rounded-lg h-10 flex items-center px-4">
                  <div className="w-4 h-4 bg-gray-400 rounded mr-3"></div>
                  <div className="bg-gray-300 h-4 w-48 rounded"></div>
                </div>
              </div>
              
              {/* Mock Profile */}
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
          </div>

          {/* Mock Category Tabs */}
          <div className="bg-white border-b border-gray-200 px-4">
            <div className="max-w-7xl mx-auto flex space-x-6 py-3">
              {['All', 'Electronics', 'Textbooks', 'Furniture', 'Academic'].map((cat, i) => (
                <div key={cat} className={`px-3 py-1 rounded-full text-sm ${i === 0 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {cat}
                </div>
              ))}
            </div>
          </div>
          
          {/* Mock Listings Grid */}
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Mock Image */}
                  <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-40 flex items-center justify-center relative">
                    <span className="text-gray-500 font-medium text-sm">{listing.category}</span>
                    {listing.urgent && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        URGENT
                      </div>
                    )}
                  </div>
                  
                  {/* Mock Content */}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{listing.title}</h3>
                    <p className="text-lg font-bold text-primary mb-2">${listing.price}</p>
                    
                    {/* Mock Seller Info */}
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{listing.seller}</span>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-400 rounded mr-1"></div>
                        <span>{listing.rating}</span>
                      </div>
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
                {isLoading ? 'Sending Code...' : 'Send Verification Code'}
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