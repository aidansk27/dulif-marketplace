'use client'

import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, addDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
// Rating reminders disabled - requires external email service
import type { User, Listing } from './types'

interface PendingRating {
  id: string
  listingId: string
  sellerId: string
  buyerId: string
  listingTitle: string
  sellerName: string
  buyerEmail: string
  buyerName: string
  createdAt: Date
  lastReminded?: Date
  remindersSent: number
}

// Send rating reminders to users who haven't rated their transactions
export const sendRatingReminders = async (): Promise<void> => {
  console.log('🔄 Starting rating reminder process...')

  try {
    // Get all pending ratings that need reminders
    const pendingRatingsQuery = query(
      collection(db, 'pendingRatings'),
      where('remindersSent', '<', 3) // Max 3 reminders
    )
    
    const pendingRatingsSnapshot = await getDocs(pendingRatingsQuery)
    
    if (pendingRatingsSnapshot.empty) {
      console.log('✅ No pending ratings need reminders')
      return
    }

    console.log(`📧 Found ${pendingRatingsSnapshot.docs.length} pending ratings to check`)

    for (const pendingDoc of pendingRatingsSnapshot.docs) {
      const pendingRating = {
        id: pendingDoc.id,
        ...pendingDoc.data()
      } as PendingRating

      try {
        await processPendingRating(pendingRating)
      } catch (error) {
        console.error(`❌ Error processing pending rating ${pendingRating.id}:`, error)
        // Continue with other ratings even if one fails
      }
    }

    console.log('✅ Rating reminder process completed')
  } catch (error) {
    console.error('❌ Error in rating reminders process:', error)
  }
}

// Process individual pending rating
const processPendingRating = async (pendingRating: PendingRating): Promise<void> => {
  const now = new Date()
  const createdAt = (pendingRating.createdAt as any)?.toDate?.() || new Date(0)
  const lastReminded = (pendingRating.lastReminded as any)?.toDate?.() || new Date(0)
  
  // Calculate days since transaction
  const daysSinceTransaction = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
  
  // Calculate hours since last reminder
  const hoursSinceLastReminder = Math.floor((now.getTime() - lastReminded.getTime()) / (1000 * 60 * 60))

  // Reminder schedule:
  // 1st reminder: 1 day after transaction
  // 2nd reminder: 3 days after transaction (if no reminder in last 48 hours)
  // 3rd reminder: 7 days after transaction (if no reminder in last 72 hours)
  
  let shouldSendReminder = false
  let reminderReason = ''

  if (pendingRating.remindersSent === 0 && daysSinceTransaction >= 1) {
    shouldSendReminder = true
    reminderReason = 'First reminder (1 day after transaction)'
  } else if (pendingRating.remindersSent === 1 && daysSinceTransaction >= 3 && hoursSinceLastReminder >= 48) {
    shouldSendReminder = true
    reminderReason = 'Second reminder (3 days after transaction)'
  } else if (pendingRating.remindersSent === 2 && daysSinceTransaction >= 7 && hoursSinceLastReminder >= 72) {
    shouldSendReminder = true
    reminderReason = 'Final reminder (7 days after transaction)'
  }

  if (!shouldSendReminder) {
    console.log(`⏳ Pending rating ${pendingRating.id} not ready for reminder yet`)
    return
  }

  console.log(`📧 Sending reminder for ${pendingRating.id}: ${reminderReason}`)

  try {
    // Rating reminders disabled - requires external email service
    console.log(`⚠️ Rating reminder skipped for ${pendingRating.id} - email service not configured`)
    return

    // Update the pending rating record
    const pendingRatingRef = doc(db, 'pendingRatings', pendingRating.id)
    await updateDoc(pendingRatingRef, {
      lastReminded: serverTimestamp(),
      remindersSent: pendingRating.remindersSent + 1,
      updatedAt: serverTimestamp()
    })

    console.log(`✅ Reminder sent successfully for pending rating ${pendingRating.id}`)
  } catch (error) {
    console.error(`❌ Failed to send reminder for pending rating ${pendingRating.id}:`, error)
    throw error
  }
}

// Check if a transaction needs a rating reminder (used when transactions complete)
export const scheduleRatingReminder = async (
  listingId: string,
  listing: Listing,
  seller: User,
  buyerId: string,
  buyerEmail: string,
  buyerName: string
): Promise<void> => {
  try {
    const pendingRatingData = {
      listingId,
      sellerId: seller.uid,
      buyerId,
      listingTitle: listing.title,
      sellerName: `${seller.firstName} ${seller.lastName}`,
      buyerEmail,
      buyerName,
      createdAt: serverTimestamp(),
      remindersSent: 0,
      updatedAt: serverTimestamp()
    }

    // Add to pending ratings collection
    const pendingRatingsRef = collection(db, 'pendingRatings')
    await addDoc(pendingRatingsRef, pendingRatingData)

    console.log(`📝 Scheduled rating reminder for transaction: ${listingId}`)
  } catch (error) {
    console.error('Error scheduling rating reminder:', error)
    // Don't throw - this is not critical for the main transaction flow
  }
}

// Clean up old pending ratings (for ratings that were completed or are too old)
export const cleanupOldPendingRatings = async (): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const oldRatingsQuery = query(
      collection(db, 'pendingRatings'),
      where('createdAt', '<', thirtyDaysAgo)
    )

    const oldRatingsSnapshot = await getDocs(oldRatingsQuery)

    if (oldRatingsSnapshot.empty) {
      console.log('✅ No old pending ratings to clean up')
      return
    }

    console.log(`🧹 Cleaning up ${oldRatingsSnapshot.docs.length} old pending ratings`)

    // In a real app, you'd use a batch delete here
    for (const doc of oldRatingsSnapshot.docs) {
      await deleteDoc(doc.ref)
    }

    console.log('✅ Old pending ratings cleaned up')
  } catch (error) {
    console.error('❌ Error cleaning up old pending ratings:', error)
  }
}

// Get pending ratings for a specific user (for dashboard/profile display)
export const getUserPendingRatings = async (userId: string): Promise<PendingRating[]> => {
  try {
    const userRatingsQuery = query(
      collection(db, 'pendingRatings'),
      where('buyerId', '==', userId)
    )

    const snapshot = await getDocs(userRatingsQuery)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PendingRating))
  } catch (error) {
    console.error('Error fetching user pending ratings:', error)
    return []
  }
}

// Manual trigger for testing rating reminders
export const triggerTestRatingReminder = async (pendingRatingId: string): Promise<void> => {
  try {
    const pendingRatingDoc = await getDoc(doc(db, 'pendingRatings', pendingRatingId))
    
    if (!pendingRatingDoc.exists()) {
      throw new Error('Pending rating not found')
    }

    const pendingRating = {
      id: pendingRatingDoc.id,
      ...pendingRatingDoc.data()
    } as PendingRating

    await processPendingRating(pendingRating)
    console.log(`✅ Test reminder sent for ${pendingRatingId}`)
  } catch (error) {
    console.error('❌ Error sending test reminder:', error)
    throw error
  }
}