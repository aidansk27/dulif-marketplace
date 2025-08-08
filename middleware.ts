import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Always exclude these paths from auth protection to avoid blocking loops
  const excludedPaths = [
    '/verify',     // Email verification must always run client code
    '/signup',     // Signup page
    '/terms',      // Terms page
    '/api',        // API routes
    '/_next',      // Next.js internals
    '/favicon.ico', // Favicon
    '/manifest.json', // PWA manifest
  ]
  
  // Check if current path should be excluded
  const isExcludedPath = excludedPaths.some(path => pathname.startsWith(path))
  
  if (isExcludedPath) {
    return NextResponse.next()
  }
  
  // Get auth and profile completion status from cookies
  const isAuthenticated = request.cookies.get('firebase-auth')?.value === 'true'
  const isProfileComplete = request.cookies.get('profile_complete')?.value === 'true'
  const emailDomain = request.cookies.get('email_domain')?.value
  
  // If not authenticated or not Berkeley domain, redirect to login
  if (!isAuthenticated || emailDomain !== 'berkeley.edu') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If authenticated but profile not complete and not on profile-setup
  if (isAuthenticated && !isProfileComplete && !pathname.startsWith('/profile-setup')) {
    return NextResponse.redirect(new URL('/profile-setup', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)',
  ],
}