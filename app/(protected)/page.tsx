'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { collection, query, orderBy, limit, getDocs, where, startAfter, QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { useRatingPrompts } from '@/hooks/useRatingPrompts'
import { ListingCard } from '@/components/ListingCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { RatingPromptModal } from '@/components/RatingPromptModal'
import type { Listing, User, Category } from '@/lib/types'

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [sellers, setSellers] = useState<Record<string, User>>({})
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState<'all' | 'boosted'>('all')
  const { user } = useAuth()
  const { currentPrompt, closeRatingPrompt, removePendingRating } = useRatingPrompts(user?.uid || null)
  const searchParams = useSearchParams()

  const LISTINGS_PER_PAGE = 20

  // Get filter parameters from URL
  const searchQuery = searchParams.get('search') || ''
  const categoryFilter = searchParams.get('category') as Category | null
  const categoriesFilter = searchParams.get('categories')?.split(',') as Category[] | null
  const minPrice = parseFloat(searchParams.get('minPrice') || '0')
  const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')

  const fetchListings = async (isLoadMore = false) => {
    const loadingState = isLoadMore ? setLoadingMore : setLoading
    loadingState(true)

    try {
      // Start with basic query
      const constraints: any[] = [
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(LISTINGS_PER_PAGE)
      ]

      // Add category filter
      if (categoryFilter) {
        constraints.unshift(where('category', '==', categoryFilter))
      } else if (categoriesFilter && categoriesFilter.length > 0) {
        constraints.unshift(where('category', 'in', categoriesFilter.slice(0, 10))) // Firestore 'in' limit is 10
      }

      // Add boosted filter
      if (filter === 'boosted') {
        constraints.unshift(where('boosted', '==', true))
      }

      let listingsQuery = query(collection(db, 'listings'), ...constraints)

      if (isLoadMore && lastDoc) {
        listingsQuery = query(
          listingsQuery,
          startAfter(lastDoc)
        )
      }

      const querySnapshot = await getDocs(listingsQuery)
      let newListings: Listing[] = []
      const sellerIds = new Set<string>()

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const listing: Listing = {
          id: doc.id,
          ...data,
        } as Listing
        newListings.push(listing)
        sellerIds.add(listing.sellerId)
      })

      // Client-side filtering for search and price range
      newListings = newListings.filter(listing => {
        // Search filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase()
          const matchesTitle = listing.title.toLowerCase().includes(searchLower)
          const matchesDescription = listing.description.toLowerCase().includes(searchLower)
          const matchesCategory = listing.category.toLowerCase().includes(searchLower)
          
          if (!matchesTitle && !matchesDescription && !matchesCategory) {
            return false
          }
        }

        // Price range filter
        if (listing.price < minPrice || listing.price > maxPrice) {
          return false
        }

        return true
      })

      // Fetch seller data
      const newSellers: Record<string, User> = { ...sellers }
      for (const sellerId of sellerIds) {
        if (!newSellers[sellerId]) {
          try {
            const sellerDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', sellerId)))
            if (!sellerDoc.empty) {
              const sellerData = sellerDoc.docs[0].data()
              newSellers[sellerId] = {
                uid: sellerId,
                ...sellerData,
              } as User
            }
          } catch (error) {
            console.error('Error fetching seller:', error)
          }
        }
      }

      setSellers(newSellers)

      if (isLoadMore) {
        setListings(prev => [...prev, ...newListings])
      } else {
        setListings(newListings)
      }

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null)
      setHasMore(querySnapshot.docs.length === LISTINGS_PER_PAGE)

    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      loadingState(false)
    }
  }

  useEffect(() => {
    setLastDoc(null) // Reset pagination when filters change
    setHasMore(true)
    fetchListings()
  }, [filter, searchQuery, categoryFilter, categoriesFilter, minPrice, maxPrice])

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchListings(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Berkeley Marketplace
          </h1>
          <p className="text-gray-600">
            Discover great deals from fellow Berkeley students
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Listings
          </button>
          <button
            onClick={() => setFilter('boosted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'boosted'
                ? 'bg-secondary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔥 Boosted
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2m-2 0h-4m-4 0H6m-2 0h2m2 0h4m4 0h2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No listings found
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'boosted' 
              ? 'No boosted listings available right now.'
              : 'Be the first to post a listing!'}
          </p>
          <Button href="/create">
            Create Your First Listing
          </Button>
        </div>
      ) : (
        <>
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <ListingCard
                  listing={listing}
                  seller={sellers[listing.sellerId]}
                  onClick={() => window.location.href = `/listing/${listing.id}`}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-12">
              <Button
                onClick={handleLoadMore}
                loading={loadingMore}
                variant="outline"
                size="lg"
              >
                Load More Listings
              </Button>
            </div>
          )}
        </>
      )}

      {/* Rating Prompt Modal */}
      {currentPrompt && (
        <RatingPromptModal
          isOpen={true}
          onClose={closeRatingPrompt}
          listing={currentPrompt.listing}
          seller={currentPrompt.seller}
          buyerId={user?.uid || ''}
          onRatingSubmitted={() => {
            if (currentPrompt.pendingRating.id) {
              removePendingRating(currentPrompt.pendingRating.id)
            }
          }}
        />
      )}
    </div>
  )
}