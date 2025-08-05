import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Rating } from './types'

// Submit a rating for a seller
export const submitRating = async (
  sellerId: string,
  buyerId: string,
  listingId: string,
  stars: number,
  comment?: string
): Promise<void> => {
  // Check if rating already exists
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

  // Create new rating
  const ratingData: Omit<Rating, 'id'> = {
    sellerId,
    buyerId,
    listingId,
    stars,
    comment: comment?.trim() || '',
    createdAt: serverTimestamp() as any,
  }

  await addDoc(collection(db, 'ratings'), ratingData)
  
  // Update seller's rating statistics
  await updateSellerRating(sellerId)
}

// Recalculate and update seller's overall rating
export const updateSellerRating = async (sellerId: string): Promise<void> => {
  // Get all ratings for this seller
  const ratingsQuery = query(
    collection(db, 'ratings'),
    where('sellerId', '==', sellerId)
  )
  
  const ratingsSnapshot = await getDocs(ratingsQuery)
  
  if (ratingsSnapshot.empty) {
    // No ratings yet
    await updateDoc(doc(db, 'users', sellerId), {
      rating: 0,
      ratingCount: 0,
      updatedAt: serverTimestamp(),
    })
    return
  }

  // Calculate average rating
  let totalStars = 0
  const ratingCount = ratingsSnapshot.size

  ratingsSnapshot.forEach((doc) => {
    const rating = doc.data() as Rating
    totalStars += rating.stars
  })

  const averageRating = Math.round((totalStars / ratingCount) * 10) / 10 // Round to 1 decimal

  // Update seller document
  await updateDoc(doc(db, 'users', sellerId), {
    rating: averageRating,
    ratingCount,
    updatedAt: serverTimestamp(),
  })
}

// Get ratings for a seller
export const getSellerRatings = async (sellerId: string): Promise<Rating[]> => {
  const ratingsQuery = query(
    collection(db, 'ratings'),
    where('sellerId', '==', sellerId)
  )
  
  const ratingsSnapshot = await getDocs(ratingsQuery)
  const ratings: Rating[] = []
  
  ratingsSnapshot.forEach((doc) => {
    ratings.push({
      id: doc.id,
      ...doc.data(),
    } as Rating)
  })
  
  return ratings
}

// Check if user can rate a seller for a specific listing
export const canRateSeller = async (
  sellerId: string,
  buyerId: string,
  listingId: string
): Promise<boolean> => {
  // Check if rating already exists
  const existingRatingQuery = query(
    collection(db, 'ratings'),
    where('sellerId', '==', sellerId),
    where('buyerId', '==', buyerId),
    where('listingId', '==', listingId)
  )
  
  const existingRatings = await getDocs(existingRatingQuery)
  return existingRatings.empty
}