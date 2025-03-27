'use client'

import { UserAuthProvider } from '@/middleware/userAuth'
import { UserDataProvider } from '@/contexts/UserDataContext'
import { useUserData } from '@/contexts/UserDataContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Content component for the user layout that handles authentication logic
 * and data loading states
 */
function UserLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { userData, loading } = useUserData()

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !userData) {
      router.replace('/profile')
    }
  }, [userData, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-light-background dark:bg-dark-background mt-10">
        <main className="flex-1 p-8">
          Loading...
        </main>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-light-background dark:bg-dark-background mt-10">
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}

/**
 * User layout wrapper that provides authentication and user data context
 * Note: This is a client component due to authentication requirements,
 * so SEO metadata must be defined in individual page components.
 */
export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserDataProvider>
      <UserAuthProvider>
        <UserLayoutContent>
          {children}
        </UserLayoutContent>
      </UserAuthProvider>
    </UserDataProvider>
  )
} 