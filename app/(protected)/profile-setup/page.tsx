'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { CameraIcon, CheckIcon } from '@heroicons/react/24/outline'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { updateUserProfile } from '@/lib/auth'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { ProfileSetupFormData } from '@/lib/types'

export default function ProfileSetupPage() {
  const [formData, setFormData] = useState<ProfileSetupFormData>({
    firstName: '',
    lastName: '',
    avatar: undefined,
    agreeToTerms: false,
    rememberMe: true,
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, refreshUser } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: keyof ProfileSetupFormData, value: any) => {
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

      // Set profile complete cookie
      document.cookie = 'profile_complete=true; Path=/; Max-Age=31536000'

      // Refresh user data to update context
      await refreshUser()

      // Redirect to home
      router.push('/')
    } catch (error: any) {
      console.error('Profile setup error:', error)
      setError(error.message || 'Failed to set up profile')
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
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <Image
              src="/dulif-logo.png"
              alt="dulif™"
              width={120}
              height={40}
              className="mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
              Complete Your Profile
            </h1>
            <p className="text-muted text-base">
              Let's get you set up on dulif™
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="text-center">
              <div className="inline-block relative">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {avatarPreview ? (
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
              <CheckIcon className="w-5 h-5 mr-2" />
              Complete Setup
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}