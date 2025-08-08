'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { Button } from './ui/Button'
import { submitRating } from '@/lib/ratings'
import type { Listing, User } from '@/lib/types'

interface RatingPromptModalProps {
  isOpen: boolean
  onClose: () => void
  listing: Listing
  seller: User
  buyerId: string
  onRatingSubmitted?: () => void
}

export const RatingPromptModal = ({
  isOpen,
  onClose,
  listing,
  seller,
  buyerId,
  onRatingSubmitted
}: RatingPromptModalProps) => {
  const MotionDiv = motion.div as any
  const MotionP = motion.p as any
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleRatingClick = (value: number) => {
    setRating(value)
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await submitRating(
        seller.uid,
        buyerId,
        listing.id,
        rating,
        comment.trim()
      )
      
      onRatingSubmitted?.()
      onClose()
      
      // Reset form
      setRating(0)
      setComment('')
      setHoveredRating(0)
      
    } catch (error: unknown) {
      const err = error as { message?: string }
      setError(err.message || 'Failed to submit rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    // TODO: Track that user skipped rating (maybe remind them later)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <MotionDiv
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Rate Your Experience</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <p className="text-white/80 text-sm mt-2">
              How was your transaction with {seller.firstName}?
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Item Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-1">
                {listing.title}
              </h3>
              <p className="text-sm text-gray-600">
                Sold by {seller.firstName} {seller.lastName}
              </p>
            </div>

            {/* Rating Stars */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Tap a star to rate (1 = Poor, 5 = Excellent)
              </p>
              <div className="flex justify-center space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((value) => {
                  const isFilled = value <= (hoveredRating || rating)
                  const Icon = isFilled ? StarSolidIcon : StarIcon
                  
                  return (
                    <button
                      key={value}
                      onClick={() => handleRatingClick(value)}
                      onMouseEnter={() => setHoveredRating(value)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="group relative p-1 transition-transform hover:scale-110"
                    >
                      <Icon
                        className={`w-10 h-10 transition-colors ${
                          isFilled 
                            ? 'text-[#FDB515] drop-shadow-sm' 
                            : 'text-gray-300 group-hover:text-[#FDB515]/50'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
              
              {rating > 0 && (
                <MotionP
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium text-primary"
                >
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"} 
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </MotionP>
              )}
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave a comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share details about your experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/500 characters
              </p>
            </div>

            {/* Error */}
            {error && (
              <MotionDiv
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-600">{error}</p>
              </MotionDiv>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
                disabled={isSubmitting}
              >
                Skip for Now
              </Button>
              <Button
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={rating === 0}
                className="flex-1 bg-secondary hover:bg-secondary/90"
              >
                Submit Rating
              </Button>
            </div>

            {/* Trust Message */}
            <p className="text-xs text-gray-500 text-center mt-4">
              🔒 Your feedback helps build trust in the Berkeley community
            </p>
          </div>
        </MotionDiv>
      </MotionDiv>
    </AnimatePresence>
  )
}