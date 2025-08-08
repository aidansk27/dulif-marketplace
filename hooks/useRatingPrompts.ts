'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, addDoc, serverTimestamp, FieldValue } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { canRateSeller } from '@/lib/ratings'
import type { Listing, User } from '@/lib/types'

interface PendingRating {
  id?: string
  listingId: string
  sellerId: string
  buyerId: string
  listingTitle: string
  sellerName: string
  createdAt: Date | FieldValue | { toDate(): Date }
  reminded?: boolean
}

interface RatingPrompt {
  listing: Listing
  seller: User
  pendingRating: PendingRating
}

export const useRatingPrompts = (userId: string | null) => {
  const [pendingRatings, setPendingRatings] = useState<PendingRating[]>([])
  const [currentPrompt, setCurrentPrompt] = useState<RatingPrompt | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch pending ratings for the user
  const fetchPendingRatings = async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      const ratingsQuery = query(
        collection(db, 'pendingRatings'),
        where('buyerId', '==', userId)
      )
      
      const snapshot = await getDocs(ratingsQuery)
      const ratings: PendingRating[] = []
      
      for (const doc of snapshot.docs) {
        const data = doc.data()
        const pendingRating: PendingRating = {
          id: doc.id,
          ...data
        } as PendingRating
        
        // Check if user can still rate this seller for this listing
        const canRate = await canRateSeller(
          pendingRating.sellerId,
          pendingRating.buyerId,
          pendingRating.listingId
        )
        
        if (canRate) {
          ratings.push(pendingRating)
        }
      }
      
      setPendingRatings(ratings)
    } catch (error) {
      console.error('Error fetching pending ratings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new pending rating (called when a transaction completes)
  const addPendingRating = async (
    listingId: string,
    listing: Listing,
    seller: User,
    buyerId: string
  ) => {
    try {
      const pendingRating: Omit<PendingRating, 'id'> = {
        listingId,
        sellerId: seller.uid,
        buyerId,
        listingTitle: listing.title,
        sellerName: `${seller.firstName} ${seller.lastName}`,
        createdAt: serverTimestamp(),
        reminded: false
      }
      
      await addDoc(collection(db, 'pendingRatings'), pendingRating)
      
      // Refresh pending ratings
      fetchPendingRatings()
    } catch (error) {
      console.error('Error adding pending rating:', error)
    }
  }

  // Show rating prompt for a specific pending rating
  const showRatingPrompt = async (pendingRating: PendingRating) => {
    try {
      // Fetch listing details
      const listingQuery = query(
        collection(db, 'listings'),
        where('__name__', '==', pendingRating.listingId)
      )
      const listingSnapshot = await getDocs(listingQuery)
      
      if (listingSnapshot.empty) {
        console.error('Listing not found')
        return
      }
      
      const listingDoc = listingSnapshot.docs[0]
      const listing: Listing = {
        id: listingDoc.id,
        ...listingDoc.data()
      } as Listing

      // Fetch seller details
      const sellerQuery = query(
        collection(db, 'users'),
        where('__name__', '==', pendingRating.sellerId)
      )
      const sellerSnapshot = await getDocs(sellerQuery)
      
      if (sellerSnapshot.empty) {
        console.error('Seller not found')
        return
      }
      
      const sellerDoc = sellerSnapshot.docs[0]
      const seller: User = {
        uid: sellerDoc.id,
        ...sellerDoc.data()
      } as User

      setCurrentPrompt({
        listing,
        seller,
        pendingRating
      })
    } catch (error) {
      console.error('Error showing rating prompt:', error)
    }
  }

  // Close current rating prompt
  const closeRatingPrompt = () => {
    setCurrentPrompt(null)
  }

  // Remove a pending rating (after rating is submitted or skipped)
  const removePendingRating = async (ratingId: string) => {
    try {
      // Remove from Firestore
      // Note: In a real app, you'd use deleteDoc here
      // For now, we'll just remove from local state
      setPendingRatings(prev => prev.filter(rating => rating.id !== ratingId))
    } catch (error) {
      console.error('Error removing pending rating:', error)
    }
  }

  // Auto-show rating prompts based on conditions
  const checkForRatingPrompts = () => {
    if (pendingRatings.length === 0) return

    // Show the oldest unreminded rating
    const oldestRating = pendingRatings
      .filter(rating => !rating.reminded)
      .sort((a, b) => {
        const aTime = (a.createdAt as { toDate?: () => Date })?.toDate?.() || new Date(0)
        const bTime = (b.createdAt as { toDate?: () => Date })?.toDate?.() || new Date(0)
        return aTime.getTime() - bTime.getTime()
      })[0]

    if (oldestRating) {
      // Check if enough time has passed (e.g., 24 hours)
      const createdTime = (oldestRating.createdAt as { toDate?: () => Date })?.toDate?.() || new Date()
      const hoursSinceCreated = (Date.now() - createdTime.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceCreated >= 24) {
        showRatingPrompt(oldestRating)
      }
    }
  }

  useEffect(() => {
    fetchPendingRatings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]) // fetchPendingRatings recreated on each render, but we only want to fetch when userId changes

  useEffect(() => {
    // Check for rating prompts when pending ratings change
    const timer = setTimeout(checkForRatingPrompts, 2000) // Delay to avoid interrupting user flow
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRatings]) // checkForRatingPrompts recreated on each render, but we only want to check when pendingRatings changes

  return {
    pendingRatings,
    currentPrompt,
    isLoading,
    addPendingRating,
    showRatingPrompt,
    closeRatingPrompt,
    removePendingRating,
    fetchPendingRatings
  }
}