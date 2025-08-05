'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import confetti from 'canvas-confetti'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { uploadListingImages, compressImage } from '@/lib/storage'
import { CreateListingWizard } from '@/components/CreateListingWizard'
import type { CreateListingData, Listing } from '@/lib/types'

export default function CreateListingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleComplete = async (data: CreateListingData) => {
    if (!user) return

    setIsSubmitting(true)

    try {
      // Create listing document first to get ID
      const listingData = {
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        price: data.price,
        firm: data.firm,
        imgURLs: [], // Will be updated after image upload
        sellerId: user.uid,
        status: 'active' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'listings'), listingData)

      // Upload images if any
      let imageURLs: string[] = []
      if (data.images.length > 0) {
        // Compress images before upload
        const compressedImages = await Promise.all(
          data.images.map(image => compressImage(image))
        )
        
        imageURLs = await uploadListingImages(compressedImages, docRef.id)
        
        // Update listing with image URLs
        await addDoc(collection(db, 'listings'), {
          ...listingData,
          id: docRef.id,
          imgURLs: imageURLs,
        })
      }

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#003262', '#FDB515']
      })

      // Redirect to the new listing
      setTimeout(() => {
        router.push(`/listing/${docRef.id}`)
      }, 2000)

    } catch (error) {
      console.error('Error creating listing:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <CreateListingWizard
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onComplete={handleComplete}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}