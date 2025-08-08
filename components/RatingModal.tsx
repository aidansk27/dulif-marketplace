'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { submitRating } from '@/lib/ratings'
import { Button } from './ui/Button'
import type { User } from '@/lib/types'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  seller: User
  listingId: string
  listingTitle: string
  buyerId: string
}

export const RatingModal = ({
  isOpen,
  onClose,
  seller,
  listingId,
  listingTitle,
  buyerId
}: RatingModalProps) => {
  const MotionDiv = motion.div as any
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await submitRating(seller.uid, buyerId, listingId, rating, comment)
      onClose()
      // Show success message
      alert('Thank you for your rating!')
    } catch (error: unknown) {
      const err = error as { message?: string }
      setError(err.message || 'Failed to submit rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStar = (index: number) => {
    const starValue = index + 1
    const isFilled = starValue <= (hoveredRating || rating)
    
    return (
      <button
        key={index}
        type="button"
        onClick={() => setRating(starValue)}
        onMouseEnter={() => setHoveredRating(starValue)}
        onMouseLeave={() => setHoveredRating(0)}
        className="focus:outline-none focus:ring-2 focus:ring-secondary rounded"
      >
        {isFilled ? (
          <StarIcon className="w-8 h-8 text-secondary" />
        ) : (
          <StarOutlineIcon className="w-8 h-8 text-gray-300" />
        )}
      </button>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <MotionDiv
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Rate Your Experience</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/80 text-sm mt-1">
            Help others by rating your transaction
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Seller Info */}
          <div className="text-center">
            <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3">
              {seller.photoURL ? (
                <img
                  src={seller.photoURL}
                  alt={`${seller.firstName} ${seller.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-medium">
                  {seller.firstName?.charAt(0)}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-lg">
              {seller.firstName} {seller.lastName}
            </h3>
            <p className="text-gray-600 text-sm truncate">
              {listingTitle}
            </p>
          </div>

          {/* Rating Stars */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-3">
              How was your experience?
            </p>
            <div className="flex justify-center space-x-1 mb-2">
              {[0, 1, 2, 3, 4].map(renderStar)}
            </div>
            <p className="text-xs text-gray-500">
              {rating === 0 && 'Click to rate'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave a comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about your experience..."
              rows={3}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/200 characters
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={rating === 0}
              className="flex-1 bg-secondary hover:bg-secondary/90"
            >
              Submit Rating
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 text-center">
            Ratings help build trust in our community. Please be honest and respectful.
          </p>
        </form>
      </MotionDiv>
    </div>
  )
}