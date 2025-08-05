import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'
import type { StarsProps } from '@/lib/types'

export const Stars = ({
  rating,
  size = 'md',
  showCount = false,
  count = 0,
}: StarsProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const renderStar = (index: number) => {
    const filled = rating - index
    
    if (filled >= 1) {
      // Fully filled star
      return (
        <StarIcon
          key={index}
          className={`${sizeClasses[size]} text-secondary`}
        />
      )
    } else if (filled > 0) {
      // Partially filled star
      return (
        <div key={index} className="relative">
          <StarOutlineIcon
            className={`${sizeClasses[size]} text-gray-300`}
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${filled * 100}%` }}
          >
            <StarIcon
              className={`${sizeClasses[size]} text-secondary`}
            />
          </div>
        </div>
      )
    } else {
      // Empty star
      return (
        <StarOutlineIcon
          key={index}
          className={`${sizeClasses[size]} text-gray-300`}
        />
      )
    }
  }

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {[0, 1, 2, 3, 4].map(renderStar)}
      </div>
      {showCount && count > 0 && (
        <span className={`text-gray-500 ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}`}>
          ({count})
        </span>
      )}
    </div>
  )
}