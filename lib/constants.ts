// App constants
export const APP_NAME = 'DULIF Marketplace'
export const BERKELEY_EMAIL_DOMAIN = 'berkeley.edu'

// Categories
export const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Books',
  'Clothing',
  'Sports',
  'Home & Garden',
  'Automotive',
  'Art & Crafts',
  'Health & Beauty',
  'Other'
] as const

export const SUBCATEGORIES: Record<string, string[]> = {
  Electronics: ['Laptops', 'Phones', 'Tablets', 'Gaming', 'Audio', 'Accessories'],
  Furniture: ['Chairs', 'Tables', 'Storage', 'Bedroom', 'Lighting', 'Decor'],
  Books: ['Textbooks', 'Fiction', 'Non-fiction', 'Academic', 'Reference'],
  Clothing: ['Tops', 'Bottoms', 'Shoes', 'Accessories', 'Outerwear'],
  Sports: ['Equipment', 'Apparel', 'Fitness', 'Outdoor', 'Bikes'],
  'Home & Garden': ['Kitchen', 'Bathroom', 'Garden', 'Tools', 'Appliances'],
  Automotive: ['Parts', 'Accessories', 'Tools', 'Care Products'],
  'Art & Crafts': ['Supplies', 'Finished Works', 'Tools', 'Materials'],
  'Health & Beauty': ['Skincare', 'Makeup', 'Hair Care', 'Supplements'],
  Other: ['Miscellaneous']
}

// Safe spots coordinates (Berkeley campus)
export const SAFE_SPOTS = [
  { name: 'Sproul Plaza', lat: 37.8697, lng: -122.2584 },
  { name: 'Golden Bear Café', lat: 37.8704, lng: -122.2595 },
  { name: 'Moffitt Library Steps', lat: 37.8723, lng: -122.2598 },
  { name: 'MLK Student Union Lobby', lat: 37.8697, lng: -122.2607 }
]

// Premium features pricing (for future implementation)
export const PRICING = {
  BOOST_LISTING: 4.99, // 48-hour boost
  COURIER_BASE: 9.99,
  COURIER_PER_MILE: 1.50,
  PLATFORM_FEE_PERCENTAGE: 0.03 // 3%
} as const

// Animation placeholders for email input
export const EMAIL_PLACEHOLDERS = [
  'arodgers12',
  'mlynch24',
  'jkidd4',
  'amorgan76',
  'barbaralee17'
] as const

// File upload limits
export const MAX_IMAGES_PER_LISTING = 6
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Chat limits
export const MAX_MESSAGE_LENGTH = 500
export const MESSAGES_PER_PAGE = 50

// Rating system
export const MIN_RATING = 1
export const MAX_RATING = 5

export type Category = typeof CATEGORIES[number]
export type ListingStatus = 'active' | 'sold'
export type UserRole = 'buyer' | 'seller'