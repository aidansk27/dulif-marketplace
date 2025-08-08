'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getCurrentUser, signOut as authSignOut } from '@/lib/auth'
import { User, AuthContextType } from '@/lib/types'
import Cookies from 'js-cookie'

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  // During server render/prerender, the provider boundary may not be applied yet.
  // Return a safe fallback instead of throwing to avoid build-time crashes.
  if (!context) {
    return {
      user: null,
      loading: true,
      signOut: async () => {},
      refreshUser: async () => {}
    }
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser()
      setUser(userData)
      
      // Update cookies for middleware
      if (userData) {
        Cookies.set('firebase-auth', 'true', { expires: 30 })
        const isComplete = !!(userData.firstName && userData.lastName)
        Cookies.set('profile_complete', isComplete.toString(), { expires: 30 })
      } else {
        Cookies.remove('firebase-auth')
        Cookies.remove('profile_complete')
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
      Cookies.remove('firebase-auth')
      Cookies.remove('profile_complete')
    }
  }

  const signOut = async () => {
    try {
      await authSignOut()
      setUser(null)
      Cookies.remove('firebase-auth')
      Cookies.remove('profile_complete')
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        await refreshUser()
      } else {
        setUser(null)
        Cookies.remove('firebase-auth')
        Cookies.remove('profile_complete')
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    signOut,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}