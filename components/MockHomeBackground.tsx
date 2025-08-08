'use client'

import { motion } from 'framer-motion'
import { useMemo, useEffect, useState } from 'react'

interface MockHomeBackgroundProps {
  isBlurred?: boolean
  showTitles?: boolean
  showRatings?: boolean
  className?: string
  disableAnimations?: boolean
  showCursor?: boolean
}

// Images to show in order across the 12 boxes
const imageSources = [
  { src: '/macbookpro.jpg', title: 'MacBook Pro M2 16"', price: 2400, category: 'Electronics' },
  { src: '/thekid.webp', title: 'Cal Hoodie "The Kid"', price: 60, category: 'Apparel' },
  { src: '/jbl.jpg', title: 'JBL Bluetooth Speaker', price: 80, category: 'Electronics' },
  { src: '/airheadphones.webp', title: 'Apple AirPods', price: 120, category: 'Electronics' },
  { src: '/minifr.jpg', title: 'Mini Fridge (Dorm)', price: 130, category: 'Appliances' },
  { src: '/cal.jpg', title: 'Tickets to Cal Baseball Game This Thursday (x12)', price: 45, category: 'Events' },
  { src: '/calpants.jpg', title: 'Cal Sweats (L)', price: 35, category: 'Apparel' },
  { src: '/calhat.webp', title: 'Cal Hat', price: 22, category: 'Apparel' },
  { src: '/ipad.jpg', title: 'iPad Pro 11"', price: 800, category: 'Electronics' },
  { src: '/port.webp', title: 'Portable Charger', price: 25, category: 'Electronics' },
  { src: '/calss.jpg', title: 'Cal Sweatshirt', price: 55, category: 'Apparel' },
  { src: '/lampp.jpg', title: 'Study Desk Lamp', price: 30, category: 'Furniture' },
]

export function MockHomeBackground({ isBlurred = true, showTitles = true, showRatings = true, className = '', disableAnimations = false, showCursor = false }: MockHomeBackgroundProps) {
  const MotionDiv = motion.div as React.ElementType
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })

  const ratings = useMemo(() => {
    // Fixed ratings to prevent hydration mismatch
    return [4.8, 4.6, 4.9, 4.7, 4.5, 4.8, 4.6, 4.9, 4.7, 4.8, 4.6, 4.5]
  }, [])

  // Random cursor movement animation (within middle 80% of viewport)
  useEffect(() => {
    if (!showCursor || disableAnimations) return

    const moveToRandomItem = () => {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const marginX = viewportWidth * 0.1
      const marginY = viewportHeight * 0.1
      const cursorSize = 24
      const minX = marginX
      const maxX = viewportWidth * 0.9 - cursorSize
      const minY = marginY
      const maxY = viewportHeight * 0.9 - cursorSize

      const x = Math.random() * (maxX - minX) + minX
      const y = Math.random() * (maxY - minY) + minY

      setCursorPosition({ x, y })
    }

    // Initial position
    moveToRandomItem()

    // Move every 2-4 seconds
    const interval = setInterval(moveToRandomItem, 2000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [showCursor, disableAnimations])

  return (
    <div className={`absolute inset-0 pointer-events-none select-none ${className}`} aria-hidden>
      {/* Berkeley Blue Background */}
      <div className="absolute inset-0 bg-[#003262]">
        <div className="absolute inset-0 prestigious-bg opacity-30"></div>

        {/* Enhanced Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-[#1a4b7a] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-60 right-20 w-80 h-80 bg-[#003262] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-[#1a4b7a] rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Mock Homepage Layer */}
        <div className={`absolute inset-0 ${isBlurred ? 'blur-sm opacity-40' : 'opacity-100'} overflow-hidden transition-all duration-500 pointer-events-none`}>
          {/* Mock Navigation Bar */}
          <div className="bg-white/95 shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              {/* Logo - explicit SVG as requested */}
              <div className="flex items-center">
                <img src="/DULIFLOGOFAVICON.ico" alt="dulif logo" className="w-12 h-12 object-contain" />
              </div>

              {/* Mock Profile */}
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img src="/prof.jpg" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Mock Category Tabs */}
          <div className="bg-white/95 border-b border-gray-200 px-4">
            <div className="max-w-7xl mx-auto flex space-x-6 py-3">
              {['All', 'Electronics', 'Textbooks', 'Furniture', 'Academic'].map((cat, i) => (
                <div key={cat} className={`px-3 py-1 rounded-full text-sm ${i === 0 ? 'bg-[#FDB515] text-black font-semibold' : 'bg-gray-100 text-gray-600'}`}>
                  {cat}
                </div>
              ))}
            </div>
          </div>

          {/* Listings Grid with images */}
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {imageSources.map((item, index) => {
                const Component = disableAnimations ? 'div' : MotionDiv
                const animationProps = disableAnimations ? {} : {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: index * 0.05 }
                }
                
                return (
                  <Component
                    key={item.src}
                    {...animationProps}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden pointer-events-none"
                  >
                  <div className="relative h-40 w-full">
                    <img src={item.src} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                    {(showTitles || showRatings) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white p-2 text-xs">
                        <div className="flex items-center justify-between">
                          {showTitles && <span className="font-semibold truncate mr-2">{item.title}</span>}
                          {showRatings && (
                            <span className="bg-yellow-500 text-black font-semibold px-1.5 py-0.5 rounded">
                              {ratings[index].toFixed(1)}★
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary">${item.price}</span>
                      <span className="text-gray-500">{item.category}</span>
                    </div>
                  </div>
                  </Component>
                )
              })}
            </div>
          </div>
        </div>

        {/* Animated Cursor (blurred, above background, below overlays) */}
        {showCursor && !disableAnimations && (
          <MotionDiv
            className="absolute w-6 h-6 pointer-events-none z-0 blur-sm"
            animate={{ x: cursorPosition.x, y: cursorPosition.y }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          >
            <div className="w-full h-full bg-white rounded-full shadow-lg border-2 border-[#003262] opacity-90">
              <div className="absolute inset-1 bg-[#003262] rounded-full animate-pulse"></div>
            </div>
          </MotionDiv>
        )}
      </div>
    </div>
  )
}

export default MockHomeBackground

