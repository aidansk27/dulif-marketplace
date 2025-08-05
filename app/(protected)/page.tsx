'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { collection, query, orderBy, limit, getDocs, where, startAfter, QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ListingCard } from '@/components/ListingCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import type { Listing, User } from '@/lib/types'

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [sellers, setSellers] = useState<Record<string, User>>({})
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState<'all' | 'boosted'>('all')

  const LISTINGS_PER_PAGE = 20

  const fetchListings = async (isLoadMore = false) => {
    const loadingState = isLoadMore ? setLoadingMore : setLoading
    loadingState(true)

    try {
      let listingsQuery = query(
        collection(db, 'listings'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(LISTINGS_PER_PAGE)
      )

      if (filter === 'boosted') {
        listingsQuery = query(
          collection(db, 'listings'),
          where('status', '==', 'active'),
          where('boosted', '==', true),
          orderBy('createdAt', 'desc'),
          limit(LISTINGS_PER_PAGE)
        )
      }

      if (isLoadMore && lastDoc) {
        listingsQuery = query(
          listingsQuery,
          startAfter(lastDoc)
        )
      }

      const querySnapshot = await getDocs(listingsQuery)
      const newListings: Listing[] = []
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
    fetchListings()
  }, [filter])

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
    </div>
  )
}