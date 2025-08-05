import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get auth and profile completion status from cookies
  const isAuthenticated = request.cookies.get('firebase-auth')?.value === 'true'
  const isProfileComplete = request.cookies.get('profile_complete')?.value === 'true'
  
  // Public routes that don't require auth
  const publicRoutes = ['/signup', '/verify', '/terms']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // If not authenticated and trying to access protected route
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/signup', request.url))
  }
  
  // If authenticated but profile not complete and not on profile-setup
  if (isAuthenticated && !isProfileComplete && !pathname.startsWith('/profile-setup') && !isPublicRoute) {
    return NextResponse.redirect(new URL('/profile-setup', request.url))
  }
  
  // If authenticated and profile complete but trying to access auth pages
  if (isAuthenticated && isProfileComplete && (pathname === '/signup' || pathname === '/verify')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // If authenticated but profile not complete and trying to access signup/verify
  if (isAuthenticated && !isProfileComplete && (pathname === '/signup' || pathname === '/verify')) {
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