'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useUserData } from '@/contexts/UserDataContext'

export function withUserAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithUserAuthWrapper(props: P) {
    const {isAuthenticated } = useAuth()
    const { clearUserData } = useUserData()
    const router = useRouter()
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
      const checkAuth = () => {
        const authCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth='))

        if (!authCookie && !isAuthenticated) {
          clearUserData()
          router.push('/auth')
        }
        setIsInitialized(true)
      }

      checkAuth()
    }, [isAuthenticated, router, clearUserData])

    if (!isInitialized || !isAuthenticated) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const { clearUserData } = useUserData()
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const authCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth='))

      if (!authCookie && !isAuthenticated) {
        clearUserData()
        router.push('/auth')
      }
      setIsInitialized(true)
    }

    // Small delay to allow auth state to initialize
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [isAuthenticated, router, clearUserData])

  if (!isInitialized) {
    return null
  }

  if (!isAuthenticated) {
    const authCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth='))
    
    if (!authCookie) {
      return null
    }
    
    return <div>Loading...</div>
  }

  return <>{children}</>
} 