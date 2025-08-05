'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  ChatBubbleLeftIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { createOrGetChat } from '@/lib/chat'
import { Stars } from '@/components/Stars'
import { Button } from '@/components/ui/Button'
import { ChatWindow } from '@/components/ChatWindow'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Listing, User } from '@/lib/types'

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [listing, setListing] = useState<Listing | null>(null)
  const [seller, setSeller] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isContacting, setIsContacting] = useState(false)

  const listingId = params.id as string

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const listingDoc = await getDoc(doc(db, 'listings', listingId))
        
        if (!listingDoc.exists()) {
          router.push('/404')
          return
        }

        const listingData = {
          id: listingDoc.id,
          ...listingDoc.data(),
        } as Listing

        setListing(listingData)

        // Fetch seller data
        const sellerDoc = await getDoc(doc(db, 'users', listingData.sellerId))
        if (sellerDoc.exists()) {
          setSeller({
            uid: sellerDoc.id,
            ...sellerDoc.data(),
          } as User)
        }

      } catch (error) {
        console.error('Error fetching listing:', error)
      } finally {
        setLoading(false)
      }
    }

    if (listingId) {
      fetchListing()
    }
  }, [listingId, router])

  const handleContactSeller = async () => {
    if (!user || !listing || !seller) return

    setIsContacting(true)
    
    try {
      const newChatId = await createOrGetChat(
        listing.id,
        seller.uid,
        user.uid
      )
      setChatId(newChatId)
      setShowChat(true)
    } catch (error) {
      console.error('Error creating chat:', error)
    } finally {
      setIsContacting(false)
    }
  }

  const handleMarkAsSold = async () => {
    if (!listing || !user || listing.sellerId !== user.uid) return

    try {
      await updateDoc(doc(db, 'listings', listing.id), {
        status: 'sold',
        updatedAt: new Date(),
      })
      
      setListing(prev => prev ? { ...prev, status: 'sold' } : null)
    } catch (error) {
      console.error('Error marking as sold:', error)
    }
  }

  const nextImage = () => {
    if (listing?.imgURLs.length) {
      setCurrentImageIndex((prev) =>
        prev === listing.imgURLs.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (listing?.imgURLs.length) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? listing.imgURLs.length - 1 : prev - 1
      )
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date)
    } catch {
      return 'Unknown date'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h1>
          <p className="text-gray-600 mb-4">This listing may have been removed or doesn't exist.</p>
          <Button onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const isOwner = user?.uid === listing.sellerId

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          {listing.imgURLs.length > 0 ? (
            <div className="relative">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={listing.imgURLs[currentImageIndex]}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                
                {listing.imgURLs.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Image Thumbnails */}
              {listing.imgURLs.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {listing.imgURLs.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <Image
                        src={url}
                        alt={`${listing.title} ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">No images available</p>
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Status Badge */}
          {listing.status === 'sold' && (
            <div className="bg-red-100 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 font-medium">🔴 This item has been sold</p>
            </div>
          )}

          {/* Title and Price */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-foreground">{listing.title}</h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {isLiked ? (
                    <HeartSolidIcon className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <ShareIcon className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-4xl font-bold text-primary">
                {formatPrice(listing.price)}
              </span>
              {listing.firm && (
                <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">
                  FIRM
                </span>
              )}
              {listing.boosted && (
                <span className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-1 rounded-full text-sm font-medium">
                  🔥 BOOSTED
                </span>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{listing.category}</span>
            <span>•</span>
            <span>{listing.subcategory}</span>
            <span>•</span>
            <span>Posted {formatDate(listing.createdAt)}</span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Seller Info */}
          {seller && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Seller</h3>
              <div className="flex items-center space-x-3">
                {seller.photoURL ? (
                  <Image
                    src={seller.photoURL}
                    alt={`${seller.firstName} ${seller.lastName}`}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium">
                      {seller.firstName?.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-medium">
                    {seller.firstName} {seller.lastName}
                  </h4>
                  {seller.ratingCount > 0 && (
                    <Stars
                      rating={seller.rating}
                      size="sm"
                      showCount
                      count={seller.ratingCount}
                    />
                  )}
                </div>
                <div className="flex items-center text-green-600 text-sm">
                  <ShieldCheckIcon className="w-4 h-4 mr-1" />
                  Berkeley Verified
                </div>
              </div>
            </div>
          )}

          {/* Safety Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <MapPinIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Meet Safely</h4>
                <p className="text-sm text-blue-800">
                  Always meet in public spaces like Sproul Plaza, MLK Student Union, 
                  or other well-lit areas on campus.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isOwner ? (
              <div className="space-y-3">
                {listing.status === 'active' && (
                  <Button
                    onClick={handleMarkAsSold}
                    variant="secondary"
                    className="w-full"
                  >
                    Mark as Sold
                  </Button>
                )}
                <Button
                  onClick={() => router.push(`/listing/${listing.id}/edit`)}
                  variant="outline"
                  className="w-full"
                >
                  Edit Listing
                </Button>
              </div>
            ) : (
              listing.status === 'active' && (
                <Button
                  onClick={handleContactSeller}
                  loading={isContacting}
                  className="w-full bg-secondary hover:bg-secondary/90 flex items-center justify-center"
                  size="lg"
                >
                  <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
                  Contact Seller
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <AnimatePresence>
        {showChat && chatId && seller && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowChat(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md h-[600px]"
              onClick={(e) => e.stopPropagation()}
            >
              <ChatWindow
                chatId={chatId}
                otherUser={seller}
                listingTitle={listing.title}
                onClose={() => setShowChat(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}