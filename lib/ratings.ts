'use client'

import { doc, updateDoc, collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export interface Rating {
  id?: string
  sellerId: string
  buyerId: string
  listingId: string
  rating: number // 1-5 stars
  comment?: string
  createdAt: Date
}

// Calculate precise seller rating based on all ratings
export const calculateSellerRating = (ratings: Rating[]): { rating: number; count: number } => {
  if (ratings.length === 0) {
    return { rating: 0, count: 0 }
  }

  // Sum all ratings
  const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0)
  
  // Calculate average and round to nearest tenth (as specified in user vision)
  const averageRating = totalRating / ratings.length
  const roundedRating = Math.round(averageRating * 10) / 10

  return {
    rating: roundedRating,
    count: ratings.length
  }
}

// Submit a new rating for a seller
export const submitRating = async (
  sellerId: string,
  buyerId: string,
  listingId: string,
  rating: number,
  comment?: string
): Promise<void> => {
  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5 stars')
    }

    // Check if rating already exists for this transaction
    const existingRatingQuery = query(
      collection(db, 'ratings'),
      where('sellerId', '==', sellerId),
      where('buyerId', '==', buyerId),
      where('listingId', '==', listingId)
    )
    
    const existingRatings = await getDocs(existingRatingQuery)
    if (!existingRatings.empty) {
      throw new Error('You have already rated this seller for this transaction')
    }

    // Add new rating
    const newRating: Omit<Rating, 'id'> = {
      sellerId,
      buyerId,
      listingId,
      rating,
      comment: comment || '',
      createdAt: serverTimestamp() as any
    }

    await addDoc(collection(db, 'ratings'), newRating)

    // Update seller's overall rating
    await updateSellerRating(sellerId)
    
  } catch (error) {
    console.error('Error submitting rating:', error)
    throw error
  }
}

// Update seller's overall rating in their user document
export const updateSellerRating = async (sellerId: string): Promise<void> => {
  try {
    // Get all ratings for this seller
    const ratingsQuery = query(
      collection(db, 'ratings'),
      where('sellerId', '==', sellerId)
    )
    
    const ratingsSnapshot = await getDocs(ratingsQuery)
    const ratings: Rating[] = ratingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Rating))

    // Calculate new rating
    const { rating, count } = calculateSellerRating(ratings)

    // Update user document
    const userRef = doc(db, 'users', sellerId)
    await updateDoc(userRef, {
      rating,
      ratingCount: count,
      updatedAt: serverTimestamp()
    })

  } catch (error) {
    console.error('Error updating seller rating:', error)
    throw error
  }
}

// Get all ratings for a seller
export const getSellerRatings = async (sellerId: string): Promise<Rating[]> => {
  try {
    const ratingsQuery = query(
      collection(db, 'ratings'),
      where('sellerId', '==', sellerId)
    )
    
    const ratingsSnapshot = await getDocs(ratingsQuery)
    return ratingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Rating))
    
  } catch (error) {
    console.error('Error getting seller ratings:', error)
    return []
  }
}

// Check if buyer can rate seller for a specific listing
export const canRateSeller = async (
  sellerId: string,
  buyerId: string,
  listingId: string
): Promise<boolean> => {
  try {
    // Check if rating already exists
    const existingRatingQuery = query(
      collection(db, 'ratings'),
      where('sellerId', '==', sellerId),
      where('buyerId', '==', buyerId),
      where('listingId', '==', listingId)
    )
    
    const existingRatings = await getDocs(existingRatingQuery)
    
    // Can rate if no existing rating found
    return existingRatings.empty
  } catch (error) {
    console.error('Error checking rating eligibility:', error)
    return false
  }
}

// Get rating statistics for display
export const getRatingStats = (ratings: Rating[]): {
  average: number
  total: number
  breakdown: { [key: number]: number }
} => {
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  
  ratings.forEach(rating => {
    if (rating.rating >= 1 && rating.rating <= 5) {
      breakdown[rating.rating as keyof typeof breakdown]++
    }
  })

  const { rating: average, count: total } = calculateSellerRating(ratings)

  return {
    average,
    total,
    breakdown
  }
}