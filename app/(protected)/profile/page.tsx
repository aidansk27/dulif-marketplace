'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  PencilIcon, 
  CameraIcon, 
  CheckIcon, 
  XMarkIcon,
  StarIcon as _StarIcon,
  EyeIcon,
  CalendarDaysIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline'
import { StarIcon as _StarSolidIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import { updateUserProfile } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Stars } from '@/components/Stars'
import { getSellerRatings } from '@/lib/ratings'
import type { Rating } from '@/lib/ratings'
import type { User as _User } from '@/lib/types'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [error, setError] = useState('')
  const MotionDiv = motion.div as any
  
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  })

  useEffect(() => {
    if (user) {
      setEditData({
        firstName: user.firstName,
        lastName: user.lastName,
      })
      
      // Fetch user ratings
      fetchUserRatings()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]) // fetchUserRatings dependency intentionally omitted to prevent infinite re-renders

  const fetchUserRatings = async () => {
    if (!user) return
    
    try {
      const userRatings = await getSellerRatings(user.uid)
      setRatings(userRatings)
    } catch (error) {
      console.error('Error fetching ratings:', error)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError('')

    try {
      await updateUserProfile(user.uid, {
        firstName: editData.firstName.trim(),
        lastName: editData.lastName.trim(),
      })
      
      await refreshUser()
      setIsEditing(false)
    } catch (error: unknown) {
      const err = error as { message?: string }
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    })
    setIsEditing(false)
    setError('')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">Please sign in to view your profile</p>
          <Button onClick={() => router.push('/signup')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  const memberSince = user.createdAt?.toDate ? 
    user.createdAt.toDate().toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }) : 'Recently'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden berkeley-glow"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/30">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={`${user.firstName} ${user.lastName}`}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-3xl">
                        {user.firstName?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-secondary/90 transition-colors">
                    <CameraIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Basic Info */}
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="flex items-center space-x-4 text-white/80">
                    <div className="flex items-center space-x-2">
                      <IdentificationIcon className="w-4 h-4" />
                      <span className="text-sm">Account ID: {user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span className="text-sm">Member since {memberSince}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              {!isEditing ? (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={cancelEdit}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    loading={isLoading}
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Edit Form */}
                {isEditing && (
                  <MotionDiv
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/5 rounded-xl p-6 border border-primary/10"
                  >
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Edit Profile Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="First Name"
                          value={editData.firstName}
                          onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="Enter your first name"
                        />
                        <Input
                          label="Last Name"
                          value={editData.lastName}
                          onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Enter your last name"
                        />
                      </div>
                      
                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}
                    </div>
                  </MotionDiv>
                )}

                {/* Seller Rating Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-foreground">
                      Seller Rating
                    </h3>
                    <div className="flex items-center space-x-2">
                      <EyeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Public</span>
                    </div>
                  </div>

                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <div className="text-6xl font-bold text-primary">
                        {user.rating > 0 ? user.rating.toFixed(1) : '0.0'}
                      </div>
                      <div className="text-left">
                        <Stars 
                          rating={user.rating} 
                          size="xl" 
                          showCount={true} 
                          count={user.ratingCount} 
                        />
                        <p className="text-sm text-gray-600 mt-1">
                          {user.ratingCount === 0 ? 'No ratings yet' : 
                           user.ratingCount === 1 ? '1 review' : 
                           `${user.ratingCount} reviews`}
                        </p>
                      </div>
                    </div>
                    
                    {user.ratingCount === 0 && (
                      <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                        <p className="text-sm text-secondary-700">
                          🌟 Start selling to receive your first ratings from buyers!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Recent Reviews */}
                  {ratings.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">Recent Reviews</h4>
                      <div className="space-y-4">
                        {ratings.slice(0, 3).map((rating, index) => (
                          <div key={rating.id || index} className="border-l-4 border-secondary pl-4 py-2">
                            <div className="flex items-center space-x-2 mb-2">
                              <Stars rating={rating.rating} size="sm" />
                              <span className="text-sm text-gray-500">
                                {(rating.createdAt as any)?.toDate?.()?.toLocaleDateString() || 'Recently'}
                              </span>
                            </div>
                            {rating.comment && (
                              <p className="text-sm text-gray-700">&quot;{rating.comment}&quot;</p>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {ratings.length > 3 && (
                        <button className="text-sm text-primary hover:underline mt-4">
                          View all {ratings.length} reviews
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Quick Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Seller Rating</span>
                      <div className="flex items-center space-x-2">
                        <Stars rating={user.rating} size="sm" />
                        <span className="text-sm font-medium">
                          {user.rating > 0 ? user.rating.toFixed(1) : '0.0'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Reviews</span>
                      <span className="text-sm font-medium">{user.ratingCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Member Since</span>
                      <span className="text-sm font-medium">{memberSince}</span>
                    </div>
                  </div>
                </div>

                {/* Account Security */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Account Security
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Berkeley Email Verified</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Profile Complete</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MotionDiv>
      </div>
    </div>
  )
}