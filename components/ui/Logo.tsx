'use client'

import Image from 'next/image'
import { useState } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
  variant?: 'full' | 'icon-only' | 'text-only' | 'horizontal'
}

const sizeClasses = {
  sm: { container: 'w-10 h-10', image: 'w-8 h-8', text: 'text-lg' },
  md: { container: 'w-16 h-16', image: 'w-14 h-14', text: 'text-2xl' },
  lg: { container: 'w-24 h-24', image: 'w-20 h-20', text: 'text-3xl' },
  xl: { container: 'w-32 h-32', image: 'w-28 h-28', text: 'text-4xl' }
}

export const Logo = ({ 
  size = 'md', 
  className = '', 
  showText = true,
  variant = 'full'
}: LogoProps) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const sizes = sizeClasses[size]

  // Fallback icon component
  const FallbackIcon = () => (
    <div className={`${sizes.container} bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200`}>
      <span className={`text-white font-bold ${sizes.text.replace('text-', 'text-').replace('xl', 'lg')}`}>
        D
      </span>
    </div>
  )

  // Text component
  const LogoText = () => (
    <span className={`font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ${sizes.text}`}>
      dulif
    </span>
  )

  if (variant === 'text-only') {
    return <LogoText />
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {/* Logo Image/Icon */}
        <div className="flex-shrink-0 flex items-center justify-center">
          {!imageError ? (
            <div className="relative flex items-center justify-center">
              <Image
                src="/transdulif.svg"
                alt="dulif logo"
                width={parseInt(sizes.container.split('w-')[1].split(' ')[0]) * 4}
                height={parseInt(sizes.container.split('h-')[1]) * 4}
                className={`${sizes.container} object-contain ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                priority
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FallbackIcon />
                </div>
              )}
            </div>
          ) : (
            <FallbackIcon />
          )}
        </div>
        
        {/* Logo Text */}
        {showText && <LogoText />}
      </div>
    )
  }

  if (variant === 'icon-only') {
    return (
      <div className={className}>
        {!imageError ? (
          <div className="relative">
            <Image
              src="/DULIFLOGOFAVICON.ico"
              alt="dulif logo"
              width={parseInt(sizes.container.split('w-')[1].split(' ')[0]) * 4}
              height={parseInt(sizes.container.split('h-')[1]) * 4}
              className={`${sizes.container} object-contain ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              priority
            />
            {!imageLoaded && <FallbackIcon />}
          </div>
        ) : (
          <FallbackIcon />
        )}
      </div>
    )
  }

  // Full logo (default)
  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      {/* Logo Image/Icon */}
      <div className="flex-shrink-0 flex items-center justify-center">
        {!imageError ? (
          <div className="relative flex items-center justify-center">
            <Image
              src="/DULIFLOGOFAVICON.ico"
              alt="dulif logo"
              width={parseInt(sizes.container.split('w-')[1].split(' ')[0]) * 4}
              height={parseInt(sizes.container.split('h-')[1]) * 4}
              className={`${sizes.container} object-contain ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              priority
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <FallbackIcon />
              </div>
            )}
          </div>
        ) : (
          <FallbackIcon />
        )}
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="text-center">
          <LogoText />
        </div>
      )}
    </div>
  )
}