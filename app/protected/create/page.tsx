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
import type { CreateListingData } from '@/lib/types'

export default function CreateListingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [listingId, setListingId] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const MotionDiv = motion.div as React.ElementType
  const MotionSpan = motion.span as React.ElementType
  const MotionH1 = motion.h1 as React.ElementType
  const MotionP = motion.p as React.ElementType

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

      // Set listing ID and show success modal
      setListingId(docRef.id)
      setIsSubmitting(false)
      setShowSuccess(true)

      // Trigger confetti after a brief delay
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#003262', '#FDB515']
        })
        
        // Additional confetti bursts for celebration
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          })
        }, 300)
        
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          })
        }, 600)
      }, 500)

    } catch (error) {
      console.error('Error creating listing:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {!showSuccess ? (
            <MotionDiv
              key="wizard"
              initial={{ opacity: 1, y: 0 }}
              exit={{ 
                opacity: 0, 
                y: -50,
                transition: { 
                  duration: 0.6, 
                  ease: [0.4, 0.0, 0.2, 1] 
                }
              }}
            >
              <CreateListingWizard
                currentStep={currentStep}
                onStepChange={setCurrentStep}
                onComplete={handleComplete}
                isSubmitting={isSubmitting}
              />
            </MotionDiv>
          ) : (
            <MotionDiv
              key="success"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: { 
                  duration: 0.8, 
                  ease: [0.4, 0.0, 0.2, 1],
                  type: "spring",
                  bounce: 0.4
                }
              }}
              className="flex items-center justify-center min-h-[60vh]"
            >
              <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg w-full berkeley-glow">
                <MotionDiv
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5, type: "spring", bounce: 0.6 }}
                  className="w-24 h-24 bg-gradient-to-br from-secondary to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl"
                >
                  <MotionSpan
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-white font-bold text-4xl"
                  >
                    🎉
                  </MotionSpan>
                </MotionDiv>

                <MotionH1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4"
                >
                  It&apos;s Live!
                </MotionH1>

                <MotionP
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-lg text-muted mb-8 leading-relaxed"
                >
                  Your listing is now public and visible to all Berkeley students.
                </MotionP>

                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="space-y-4"
                >
                  <button
                    onClick={() => listingId && router.push(`/listing/${listingId}`)}
                    className="w-full bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg"
                  >
                    View Your Listing
                  </button>
                  
                  <button
                    onClick={() => router.push('/')}
                    className="w-full bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all"
                  >
                    Back to Homepage
                  </button>
                </MotionDiv>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}