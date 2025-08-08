'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { Button } from './ui/Button'
import { CATEGORIES } from '@/lib/constants'
import type { Category } from '@/lib/types'

interface FilterState {
  categories: Category[]
  minPrice: number
  maxPrice: number
  priceRange: [number, number]
}

interface FiltersModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
}

export const FiltersModal = ({ 
  isOpen, 
  onClose, 
  onApplyFilters,
  initialFilters = {}
}: FiltersModalProps) => {
  const MotionDiv = motion.div as any
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    minPrice: 0,
    maxPrice: 50,
    priceRange: [0, 50],
    ...initialFilters
  })

  const [customMin, setCustomMin] = useState<string>('')
  const [customMax, setCustomMax] = useState<string>('')

  // Price range presets
  const pricePresets = [
    { label: '$0 - $25', range: [0, 25] as [number, number] },
    { label: '$25 - $50', range: [25, 50] as [number, number] },
    { label: '$50 - $100', range: [50, 100] as [number, number] },
    { label: '$100 - $200', range: [100, 200] as [number, number] },
    { label: '$200+', range: [200, 1000] as [number, number] },
  ]

  const handleCategoryToggle = (category: Category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const handlePriceRangeSelect = (range: [number, number]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: range,
      minPrice: range[0],
      maxPrice: range[1]
    }))
    setCustomMin('')
    setCustomMax('')
  }

  const handleCustomPriceChange = () => {
    const min = parseFloat(customMin) || 0
    const max = parseFloat(customMax) || 1000
    
    if (min >= 0 && max > min) {
      setFilters(prev => ({
        ...prev,
        priceRange: [min, max],
        minPrice: min,
        maxPrice: max
      }))
    }
  }

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      minPrice: 0,
      maxPrice: 50,
      priceRange: [0, 50]
    })
    setCustomMin('')
    setCustomMax('')
  }

  const applyFilters = () => {
    onApplyFilters(filters)
    onClose()
  }

  const activeFilterCount = filters.categories.length + 
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 50 ? 1 : 0)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <MotionDiv
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AdjustmentsHorizontalIcon className="w-6 h-6" />
                <h2 className="text-xl font-bold">Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-8">
              {/* Price Range */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Price Range</h3>
                
                {/* Quick Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {pricePresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => handlePriceRangeSelect(preset.range)}
                      className={`p-3 text-sm font-medium rounded-lg border-2 transition-all ${
                        filters.priceRange[0] === preset.range[0] && 
                        filters.priceRange[1] === preset.range[1]
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom Range */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Custom Range</h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Min Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={customMin}
                          onChange={(e) => setCustomMin(e.target.value)}
                          onBlur={handleCustomPriceChange}
                          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div className="text-gray-400 text-sm">to</div>
                    
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Max Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input
                          type="number"
                          placeholder="50+"
                          value={customMax}
                          onChange={(e) => setCustomMax(e.target.value)}
                          onBlur={handleCustomPriceChange}
                          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          min={customMin || "0"}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    Current: ${filters.priceRange[0]} - ${filters.priceRange[1] >= 1000 ? '∞' : filters.priceRange[1]}
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Categories</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORIES.map((category) => (
                    <label
                      key={category}
                      className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        filters.categories.includes(category)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                      />
                      <span className="text-sm font-medium">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex items-center justify-between space-x-4">
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Clear All
              </button>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={applyFilters}
                  className="px-6 bg-primary hover:bg-primary/90"
                >
                  Apply Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-2 bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </MotionDiv>
      </MotionDiv>
    </AnimatePresence>
  )
}