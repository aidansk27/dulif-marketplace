import { Timestamp } from 'firebase/firestore'
import type { Category, ListingStatus } from './constants'

// User types
export interface User {
  uid: string
  email: string
  firstName: string
  lastName: string
  photoURL?: string
  rating: number
  ratingCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface UserProfile extends Omit<User, 'uid'> {
  profileComplete: boolean
}

// Listing types
export interface Listing {
  id: string
  title: string
  description: string
  category: Category
  subcategory: string
  price: number
  firm: boolean
  imgURLs: string[]
  sellerId: string
  status: ListingStatus
  createdAt: Timestamp
  updatedAt: Timestamp
  // Optional fields for premium features
  boosted?: boolean
  boostExpiresAt?: Timestamp
}

export interface CreateListingData {
  title: string
  description: string
  category: Category
  subcategory: string
  price: number
  firm: boolean
  images: File[]
  size: 'carry' | 'large'
  weight?: string
}

// Chat types
export interface Chat {
  id: string
  listingId: string
  members: string[]
  lastMessage: string
  lastTime: Timestamp
  sellerId: string
  buyerId: string
}

export interface Message {
  id: string
  senderId: string
  body: string
  createdAt: Timestamp
  read?: boolean
}

// Rating types
export interface Rating {
  id: string
  sellerId: string
  buyerId: string
  listingId: string
  stars: number
  comment?: string
  createdAt: Timestamp
}

// Safe spot types (simplified)
export type SafeSpot = string

// Premium feature types
export interface Boost {
  id: string
  listingId: string
  userId: string
  expiresAt: Timestamp
  createdAt: Timestamp
}

export interface CourierRequest {
  id: string
  listingId: string
  fromAddress: string
  toAddress: string
  status: 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled'
  fee: number
  createdAt: Timestamp
}

// Form types
export interface SignupFormData {
  email: string
}

export interface ProfileSetupFormData {
  firstName: string
  lastName: string
  avatar?: File
  agreeToTerms: boolean
  rememberMe: boolean
}

export interface FiltersData {
  minPrice?: number
  maxPrice?: number
  categories: Category[]
  onlyBoosted: boolean
  searchQuery: string
}

// Auth context types
export interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

// Component prop types
export interface ListingCardProps {
  listing: Listing
  seller?: User
  onClick?: () => void
}

export interface StarsProps {
  rating: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCount?: boolean
  count?: number
  interactive?: boolean
  onRatingChange?: (rating: number) => void
}

export interface NavbarProps {
  user: User | null
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Utility types
export type WithId<T> = T & { id: string }
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>