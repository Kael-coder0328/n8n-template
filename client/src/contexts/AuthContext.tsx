'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface AuthState {
  id: string
  name: string
  email: string
  emailVerified: boolean
}

interface AuthContextType {
  auth: AuthState | null
  setAuth: (auth: AuthState | null) => void
  isAuthenticated: boolean
  user: AuthState | null
  logout: () => Promise<void>
  updateAuth: (auth: AuthState) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null)

  // Initialize auth state from cookie
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift()
        return cookieValue ? decodeURIComponent(cookieValue) : null
      }
      return null
    }

    const authCookie = getCookie('auth')
    if (authCookie) {
      try {
        const parsedAuth = JSON.parse(authCookie)
        setAuth(parsedAuth)
      } catch (error) {
        console.error('Error parsing auth cookie:', error)
        document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
      }
    }
  }, [])

  // Update cookie when auth state changes
  useEffect(() => {
    if (auth) {
      const authValue = encodeURIComponent(JSON.stringify(auth))
      document.cookie = `auth=${authValue}; path=/; secure; samesite=strict; max-age=604800`
    } else {
      document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    }
  }, [auth])

  const logout = async () => {
    setAuth(null)
    document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  }

  const updateAuth = (newAuth: AuthState) => {
    setAuth(newAuth)
  }

  return (
    <AuthContext.Provider value={{
      auth,
      setAuth,
      isAuthenticated: !!auth,
      user: auth,
      logout,
      updateAuth
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}