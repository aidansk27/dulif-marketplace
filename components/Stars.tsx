import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import type { StarsProps } from '@/lib/types'

export const Stars = ({
  rating,
  size = 'md',
  showCount = false,
  count = 0,
  interactive = false,
  onRatingChange,
}: StarsProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  }

  // Ensure rating is between 0 and 5 and round to nearest tenth
  const clampedRating = Math.max(0, Math.min(5, Math.round(rating * 10) / 10))

  const renderStar = (index: number) => {
    const filled = clampedRating - index
    const starKey = `star-${index}`
    
    if (filled >= 1) {
      // Fully filled star - mustard color
      return (
        <StarIcon
          key={starKey}
          className={`${sizeClasses[size]} text-[#FDB515] drop-shadow-sm ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={interactive && onRatingChange ? () => onRatingChange(index + 1) : undefined}
        />
      )
    } else if (filled > 0) {
      // Partially filled star - precise fractional display
      const fillPercentage = Math.round(filled * 100)
      return (
        <div key={starKey} className="relative inline-block">
          {/* Background outline star */}
          <StarOutlineIcon
            className={`${sizeClasses[size]} text-gray-300 ${interactive ? 'cursor-pointer' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(index + 1) : undefined}
          />
          {/* Filled portion */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${fillPercentage}%` }}
          >
            <StarIcon
              className={`${sizeClasses[size]} text-[#FDB515] drop-shadow-sm ${interactive ? 'hover:scale-110 transition-transform' : ''}`}
            />
          </div>
          {/* Hover effect for interactive stars */}
          {interactive && (
            <div className="absolute inset-0 opacity-0 hover:opacity-20 bg-[#FDB515] rounded-sm transition-opacity" />
          )}
        </div>
      )
    } else {
      // Empty star
      return (
        <StarOutlineIcon
          key={starKey}
          className={`${sizeClasses[size]} text-gray-300 ${interactive ? 'cursor-pointer hover:text-[#FDB515] hover:scale-110 transition-all' : ''}`}
          onClick={interactive && onRatingChange ? () => onRatingChange(index + 1) : undefined}
        />
      )
    }
  }

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center space-x-0.5">
        {[0, 1, 2, 3, 4].map(renderStar)}
      </div>
      {showCount && count > 0 && (
        <span className={`text-gray-500 font-medium ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : size === 'xl' ? 'text-lg' : 'text-sm'}`}>
          ({count})
        </span>
      )}
      {/* Display precise rating number for debugging/admin */}
      {process.env.NODE_ENV === 'development' && (
        <span className="text-xs text-gray-400 ml-2">
          {clampedRating.toFixed(1)}
        </span>
      )}
    </div>
  )
}