import Image from 'next/image'
import { motion } from 'framer-motion'
import { Stars } from './Stars'
import type { ListingCardProps } from '@/lib/types'

export const ListingCard = ({ listing, seller, onClick }: ListingCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  const MotionDiv = motion.div as any

  return (
    <MotionDiv
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer group"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-200 overflow-hidden">
        {listing.imgURLs.length > 0 ? (
          <Image
            src={listing.imgURLs[0]}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-400">No Image</div>
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-2 right-2">
          <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md">
            <span className="text-primary font-bold text-sm">
              {formatPrice(listing.price)}
            </span>
          </div>
        </div>

        {/* Firm Badge */}
        {listing.firm && (
          <div className="absolute top-2 left-2">
            <div className="bg-secondary text-white px-2 py-1 rounded text-xs font-medium">
              FIRM
            </div>
          </div>
        )}

        {/* Boosted Badge */}
        {listing.boosted && (
          <div className="absolute bottom-2 left-2">
            <div className="bg-gradient-to-r from-primary to-secondary text-white px-2 py-1 rounded text-xs font-medium flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              BOOST
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2 text-base leading-tight">
          {listing.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 leading-relaxed">
          {truncateText(listing.description)}
        </p>

        {/* Seller Info */}
        {seller && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {seller.photoURL ? (
                <Image
                  src={seller.photoURL}
                  alt={`${seller.firstName} ${seller.lastName}`}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-600">
                    {seller.firstName?.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-700">
                {seller.firstName} {seller.lastName.charAt(0)}.
              </span>
            </div>
            
            {seller.ratingCount > 0 && (
              <Stars
                rating={seller.rating}
                size="sm"
                showCount
                count={seller.ratingCount}
              />
            )}
          </div>
        )}
      </div>
    </MotionDiv>
  )
}