# 🐻 DULIF Marketplace

The trusted marketplace for UC Berkeley students to buy and sell items safely on campus.

## ✨ Features

### 🔐 Authentication & Security
- **Passwordless Authentication**: Magic link sign-in with Berkeley email verification
- **Profile Verification**: Only @berkeley.edu emails allowed
- **Safe Meeting Spots**: Interactive map with recommended campus locations
- **User Ratings**: Community-driven seller reputation system

### 📱 Core Functionality
- **Modern UI**: Berkeley-branded design with Aeonik fonts and smooth animations
- **6-Step Listing Creation**: Intuitive wizard with image upload and compression
- **Real-time Chat**: Instant messaging between buyers and sellers
- **Advanced Search & Filters**: Category-based browsing with price filters
- **Responsive Design**: Mobile-first approach with PWA support

### 🚀 Premium Features (Ready for Implementation)
- **Listing Boosts**: 48-hour featured placement
- **Campus Courier**: Delivery service integration
- **Payment Processing**: Stripe integration prepared

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom Berkeley theme
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **Maps**: Google Maps API
- **PWA**: Next-PWA
- **Testing**: Jest + React Testing Library + Cypress

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (managed via .nvmrc)
- Firebase project with Firestore, Auth, and Storage enabled
- Google Maps API key

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd dulif-marketplace
   nvm use  # Uses Node 20
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   # Fill in your Firebase and Google Maps credentials
   ```

3. **Firebase Configuration**
   - Create a Firebase project
   - Enable Authentication with Email/Link provider
   - Set up Firestore with the following collections:
     - `users` - User profiles
     - `listings` - Marketplace items
     - `chats` - Chat conversations
     - `messages` - Chat messages (subcollection)
     - `ratings` - User ratings
     - `safeSpots` - Meeting locations

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
dulif-marketplace/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── signup/        # Email entry + animated placeholders
│   │   └── verify/        # Magic link verification
│   ├── (protected)/       # Protected routes
│   │   ├── create/        # 6-step listing wizard
│   │   ├── listing/[id]/  # Listing detail with chat
│   │   └── profile-setup/ # First-time user setup
│   ├── terms/             # Static terms page
│   └── layout.tsx         # Root layout with AuthProvider
├── components/            # Reusable UI components
│   ├── ui/               # Base components (Button, Input, etc.)
│   ├── Navbar.tsx        # Main navigation with search
│   ├── ListingCard.tsx   # Listing display component
│   ├── Stars.tsx         # Rating display
│   ├── ChatWindow.tsx    # Real-time messaging
│   └── CreateListingWizard.tsx  # Multi-step form
├── lib/                  # Utilities and services
│   ├── firebase.ts       # Firebase configuration
│   ├── auth.ts          # Authentication helpers
│   ├── chat.ts          # Chat functionality
│   ├── ratings.ts       # Rating system
│   ├── storage.ts       # File upload utilities
│   ├── constants.ts     # App constants
│   └── types.ts         # TypeScript definitions
├── hooks/               # Custom React hooks
├── contexts/            # React contexts
└── middleware.ts        # Route protection logic
```

## 🔥 Key Features Implementation

### Authentication Flow
1. **Email Entry**: Animated NetID input with Berkeley domain
2. **Magic Link**: Passwordless authentication via email
3. **Profile Setup**: Required first-time user information
4. **Route Protection**: Middleware enforces auth + profile completion

### Listing Creation (6 Steps)
1. **Basic Info**: Title and description with validation
2. **Category Selection**: Visual category picker with subcategories
3. **Pricing**: Price input with firm/negotiable toggle
4. **Photo Upload**: Drag-and-drop with compression (max 6 images)
5. **Item Details**: Size category and weight information
6. **Review & Publish**: Final confirmation with confetti celebration

### Real-time Chat System
- **Automatic Chat Creation**: When buyer contacts seller
- **Live Messages**: Real-time updates via Firestore listeners
- **Message Status**: Read receipts and typing indicators
- **Mobile Optimized**: Responsive chat interface

### Safety Features
- **Safe Spot Map**: Google Maps integration with campus locations
- **User Verification**: Berkeley email requirement
- **Rating System**: Community-driven seller reputation
- **Safety Guidelines**: Built-in safety tips and warnings

## 🧪 Testing

```bash
# Unit and integration tests
npm run test
npm run test:watch

# End-to-end tests
npm run test:e2e
npm run test:e2e:headless
```

### Test Coverage
- Authentication flow: Signup → Verify → Profile Setup
- Listing creation and management
- Chat functionality
- Rating system
- Search and filtering

## 🚀 Deployment

### Environment Variables
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
NEXT_PUBLIC_APP_URL=your_production_url
```

### Build and Deploy

#### Deploy on Vercel
1. **Connect to Vercel**:
   ```bash
   npm i -g vercel
   vercel --prod
   ```

2. **Set Environment Variables** in Vercel dashboard:
   - All variables from `.env.local.example`

3. **Configure Custom Domain**:
   - Add `dulif.com` in Vercel project settings
   - Update DNS records as instructed

4. **Firebase Configuration**:
   - Add `dulif.com` to Firebase Authentication → Settings → Authorized domains
   - Ensure Firestore security rules allow your domain

#### Manual Build
```bash
npm run build
npm run start
```

> **Important**: After deployment, add `dulif.com` to Firebase Authentication → Settings → Authorized domains or magic link authentication will fail.

## 📱 PWA Support

The app includes PWA configuration for:
- **Offline Functionality**: Cached resources and offline pages
- **App-like Experience**: Home screen installation
- **Push Notifications**: Ready for implementation
- **Lighthouse Score**: Optimized for 90+ mobile score

## 🎨 Design System

### Colors
- **Primary**: #003262 (Berkeley Blue)
- **Secondary**: #FDB515 (California Gold)
- **Background**: #FFFFFF
- **Text**: #1E1E1E

### Typography
- **Primary Font**: Aeonik (with Inter fallback)
- **Weights**: 400 (normal), 500 (medium), 700 (bold)

### Components
- **Card Radius**: 8px (rounded-lg)
- **Shadows**: Tailwind shadow-lg/medium
- **Animations**: Framer Motion with spring presets
- **Duration**: ≤ 300ms for all transitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Roadmap

### Phase 2 Features
- [ ] Stripe payment integration
- [ ] Campus courier service
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Social media sharing
- [ ] Wishlist functionality
- [ ] Bulk listing management
- [ ] Admin dashboard

### Performance Optimizations
- [ ] Image optimization pipeline
- [ ] CDN integration
- [ ] Database query optimization
- [ ] Caching strategies
- [ ] Bundle size optimization

---

**Built with ❤️ for the UC Berkeley community**