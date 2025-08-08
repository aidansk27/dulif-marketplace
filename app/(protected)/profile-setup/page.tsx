'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
// TODO: Switch to next/image for optimization
// import Image from 'next/image'
import { motion } from 'framer-motion'
import { CameraIcon, CheckIcon } from '@heroicons/react/24/outline'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { updateUserProfile } from '@/lib/auth'
import { updatePassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Logo } from '@/components/ui/Logo'
import type { ProfileSetupFormData } from '@/lib/types'

export default function ProfileSetupPage() {
  // Work around framer-motion TS hiccup in this environment
  const MotionDiv = motion.div as React.ElementType
  const [step, setStep] = useState<'intro' | 'form'>('intro')
  const [formData, setFormData] = useState<ProfileSetupFormData>({
    firstName: '',
    lastName: '',
    avatar: undefined,
    agreeToTerms: false,
    rememberMe: true,
  })
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, refreshUser } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: keyof ProfileSetupFormData, value: string | boolean | File | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Avatar image must be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }

      setFormData(prev => ({ ...prev, avatar: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!formData.avatar || !user) return null

    const avatarRef = ref(storage, `avatars/${user.uid}.jpg`)
    await uploadBytes(avatarRef, formData.avatar)
    return await getDownloadURL(avatarRef)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter your first and last name')
      return
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms of Service')
      return
    }

    if (!user) {
      setError('User not found. Please try signing in again.')
      return
    }

    setIsLoading(true)

    try {
      // Upload avatar if provided
      let photoURL = user.photoURL || ''
      if (formData.avatar) {
        photoURL = await uploadAvatar() || ''
      }

      // Update user profile
      await updateUserProfile(user.uid, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        photoURL,
      })

      // Set a password (convert passwordless to password-based account)
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, password)
      }

      // Set profile complete cookie
      document.cookie = 'profile_complete=true; Path=/; Max-Age=31536000'

      // Refresh user data to update context
      await refreshUser()

      // Redirect to home
      router.push('/')
    } catch (error: unknown) {
      console.error('Profile setup error:', error)
      const err = error as { message?: string }
      setError(err.message || 'Failed to set up profile')
    } finally {
      setIsLoading(false)
    }
  }

  // Mock listings for homepage preview
  const mockListings = [
    { id: '1', title: 'MacBook Pro M2 16"', price: 2400, seller: 'Sarah M.', rating: 4.9, category: 'Electronics' },
    { id: '2', title: 'Organic Chemistry Textbook', price: 85, seller: 'Mike K.', rating: 4.8, category: 'Textbooks' },
    { id: '3', title: 'IKEA Desk + Chair Set', price: 180, seller: 'Jessica L.', rating: 5.0, category: 'Furniture' },
    { id: '4', title: 'iPad Air + Apple Pencil', price: 450, seller: 'David R.', rating: 4.7, category: 'Electronics' },
  ]

  const categories = ['Electronics', 'Textbooks', 'Furniture', 'Clothing', 'Academic', 'Other']

  // Step 1: Intro with blurred homepage
  if (step === 'intro') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Blurred Homepage Background */}
        <div className="absolute inset-0 bg-background">
          <div className="absolute inset-0 prestigious-bg opacity-30"></div>
          
          {/* Mock Homepage */}
          <div className="absolute inset-0 blur-sm opacity-60">
            {/* Mock Navigation */}
            <div className="bg-white shadow-sm border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Logo size="md" variant="horizontal" />
                
                <div className="flex-1 max-w-md mx-8">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search marketplace..."
                      className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg"
                      disabled
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                </div>
              </div>
              
              {/* Mock Categories */}
              <div className="border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-3">
                  <div className="flex space-x-4 overflow-x-auto">
                    {categories.map((category, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm whitespace-nowrap"
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mock Listings */}
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-40 flex items-center justify-center">
                      <span className="text-gray-500 font-medium text-sm">{listing.category}</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-2">{listing.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">${listing.price}</span>
                        <div className="text-xs text-gray-600">
                          {listing.seller} ⭐ {listing.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Intro Message */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="w-full max-w-lg"
          >
            <div className="berkeley-card rounded-3xl p-10 berkeley-glow text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-white font-bold text-4xl">D</span>
              </div>
              
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-600 to-secondary bg-clip-text text-transparent tracking-tight mb-6">
                dulif
              </h1>
              
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Welcome to Berkeley&apos;s Marketplace!
              </h2>
              
              <p className="text-muted text-lg mb-8 leading-relaxed">
                Before you can begin using the app, we have some required steps to quickly complete.
              </p>
              
              <Button
                onClick={() => setStep('form')}
                variant="primary"
                size="lg"
                className="px-8 py-4 text-lg font-semibold"
              >
                Next
              </Button>
            </div>
          </MotionDiv>
        </div>
      </div>
    )
  }

  // Step 2: Profile Setup Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="berkeley-card rounded-3xl p-10 berkeley-glow relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <Logo size="lg" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">
              Create Your Public Profile
            </h2>
            <p className="text-muted text-base">
              Set up your profile to start buying and selling
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="text-center">
              <div className="inline-block relative">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {avatarPreview ? (
                    // TODO: Replace with next/image for better performance
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CameraIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">
                Optional profile photo
              </p>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="John"
                required
              />
              <Input
                label="Last Name/Initial"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Doe"
                required
              />
            </div>

            {/* Password */}
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
              placeholder="Create a password"
              required
            />
            {passwordError && (
              <p className="text-sm text-red-600">{passwordError}</p>
            )}

            {/* Checkboxes */}
            <div className="space-y-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                  required
                />
                <span className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/terms" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                />
                <span className="text-sm text-gray-700">
                  Remember me on this device
                </span>
              </label>
            </div>

            {error && (
              <MotionDiv
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-600">{error}</p>
              </MotionDiv>
            )}

            <Button
              type="submit"
              loading={isLoading}
              variant="primary"
              className="w-full py-3 text-base"
              size="lg"
            >
              <CheckIcon className="w-5 h-5 mr-2" />
              Complete Setup
            </Button>
          </form>
        </div>
      </MotionDiv>
    </div>
  )
}