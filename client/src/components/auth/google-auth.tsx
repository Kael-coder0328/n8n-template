'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { SocialButton } from '@/components/ui/social-button'
import { authService } from '@/services/auth'
import { useAuth } from '@/contexts/AuthContext'

export function GoogleAuth() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { setAuth } = useAuth()

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        scope: 'email profile',
        ux_mode: 'redirect',
        redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/callback/google',
        callback: async (response: { code: string }) => {
          if (response.code) {
            try {
              const authResponse = await authService.googleLogin(response.code)
              setAuth({
                id: authResponse.id,
                name: authResponse.name,
                email: authResponse.email,
                emailVerified: authResponse.email_verified
              })
              router.push('/profile')
              toast.success('Logged in with Google successfully!')
            } catch {
              setIsLoading(false) // Reset loading state on error
              toast.error('Failed to initialize Google Sign-In') // Show error message
            }
          }
          setIsLoading(false)
        }
      })
      client.requestCode()
    } catch {
      setIsLoading(false)
      toast.error('Failed to initialize Google Sign-In')
    }
  }

  return (
    <SocialButton
      provider="google"
      onClick={handleGoogleSignIn}
      disabled={isLoading} // Disable button while loading
      icon={
        <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
          <path
            d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
            fill="#EA4335"
          />
          <path
            d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
            fill="#4285F4"
          />
          <path
            d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.27028 9.7049L1.28027 6.60986C0.47027 8.22986 0 10.0599 0 11.9999C0 13.9399 0.47027 15.7699 1.28027 17.3899L5.26498 14.2949Z"
            fill="#FBBC05"
          />
          <path
            d="M12.0004 24C15.2354 24 17.9504 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.87043 19.245 6.21542 17.135 5.26544 14.29L1.27544 17.385C3.25544 21.31 7.31044 24 12.0004 24Z"
            fill="#34A853"
          />
        </svg>
      }
    >
      Google
    </SocialButton>
  )
} 