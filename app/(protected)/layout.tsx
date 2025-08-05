'use client'

import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Navbar } from '@/components/Navbar'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null // Middleware will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main>
        {children}
      </main>
    </div>
  )
}