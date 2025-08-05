'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CATEGORIES } from '@/lib/constants'
import type { NavbarProps, Category } from '@/lib/types'

export const Navbar = ({ user }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/signup')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleCategoryClick = (category: Category) => {
    router.push(`/?category=${encodeURIComponent(category)}`)
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center justify-start">
              <Image
                src="/dulif-logo.png"
                alt="dulif™"
                width={120}
                height={32}
                className="h-8 w-auto transition-transform duration-200 hover:scale-105"
              />
            </Link>
          </div>

          {/* Desktop Categories (Hidden on mobile/tablet) */}
          <div className="hidden lg:flex items-center space-x-2 flex-1 justify-center max-w-2xl mx-8">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {CATEGORIES.slice(0, 6).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
                >
                  {category}
                </button>
              ))}
              <button
                onClick={() => router.push('/?categories=all')}
                className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
              >
                More...
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search (Desktop) */}
            <div className="hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search listings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-64 pl-10 pr-4 py-2 text-sm"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </form>
            </div>

            {/* Filters Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/?filters=open')}
              className="hidden md:flex items-center"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
              Filters
            </Button>

            {/* Create Listing Button */}
            <Button
              onClick={() => router.push('/create')}
              size="sm"
              className="bg-secondary hover:bg-secondary/90 text-white"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create Listing</span>
              <span className="sm:hidden">Create</span>
            </Button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={`${user.firstName} ${user.lastName}`}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.firstName || 'User'}
                </span>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <UserCircleIcon className="w-4 h-4 mr-3" />
                      View Profile
                    </Link>
                    
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Cog6ToothIcon className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                    
                    <hr className="my-1" />
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-5 h-5 text-gray-700" />
              ) : (
                <Bars3Icon className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200 py-4 overflow-hidden"
            >
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search listings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </form>

              {/* Mobile Categories */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.slice(0, 8).map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        handleCategoryClick(category)
                        setIsMobileMenuOpen(false)
                      }}
                      className="px-3 py-2 text-sm text-left text-gray-700 bg-gray-100 rounded-lg hover:bg-primary hover:text-white transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  router.push('/?filters=open')
                  setIsMobileMenuOpen(false)
                }}
                className="w-full mb-4"
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                Filters & Advanced Search
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close profile menu */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </nav>
  )
}