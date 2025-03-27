'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

import { LoginForm } from '@/components/auth/login-form'
import { SignUpForm } from '@/components/auth/signup-form'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { SocialAuth } from '@/components/auth/social-auth'
import { GoogleAuth } from '@/components/auth/google-auth'
import { GithubAuth } from '@/components/auth/github-auth'

type AuthView = 'login' | 'signup' | 'forgot-password'

/**
 * Animation variants for the sliding effect between authentication views
 */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
}

/**
 * Client component for the Auth page that handles interactive elements and authentication logic
 * Includes views for login, signup, and password reset with animations between states
 */
export default function AuthPageClient() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  
  // Redirect authenticated users to profile page
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/profile')
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, router])

  // Set the initial view based on URL params
  const [view, setView] = useState<AuthView>(
    (searchParams.get('view') as AuthView) || 'login'
  )
  const [[page, direction], setPage] = useState([0, 0])

  /**
   * Handles switching between authentication views with direction-aware animations
   */
  const paginate = (newView: AuthView) => {
    const views: AuthView[] = ['login', 'signup', 'forgot-password']
    const currentIndex = views.indexOf(view)
    const newIndex = views.indexOf(newView)
    const direction = newIndex > currentIndex ? 1 : -1
    
    setPage([page + direction, direction])
    setView(newView)
  }

  if (isLoading || isAuthenticated) {
    return null
  }

  // Don't show social auth on forgot password view
  const showSocialAuth = view !== 'forgot-password'

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground">
            {view === 'login' && 'Sign in to your account'}
            {view === 'signup' && 'Create your account'}
            {view === 'forgot-password' && 'Reset your password'}
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-light-card dark:bg-dark-card px-4 py-8 shadow sm:rounded-lg sm:px-10">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={view}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
              >
                {view === 'login' && (
                  <LoginForm
                    onSignUpClick={() => paginate('signup')}
                    onForgotPasswordClick={() => paginate('forgot-password')}
                  />
                )}
                {view === 'signup' && (
                  <SignUpForm
                    onSignInClick={() => paginate('login')}
                  />
                )}
                {view === 'forgot-password' && (
                  <ForgotPasswordForm
                    onBackToSignInClick={() => paginate('login')}
                  />
                )}
              </motion.div>
            </AnimatePresence>
            
            {showSocialAuth && (
              <div className="mt-6">
                <SocialAuth dividerText={view === 'login' ? 'Or sign in with' : 'Or sign up with'}>
                  <GoogleAuth />
                  <GithubAuth />
                </SocialAuth>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 