/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authService } from '@/services/auth'
import { useAuth } from '@/contexts/AuthContext'
import { AuthError } from '@/components/auth/error'

interface LoginFormProps {
  onSignUpClick: () => void
  onForgotPasswordClick: () => void
}

export function LoginForm({ onSignUpClick, onForgotPasswordClick }: LoginFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const { setAuth } = useAuth()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(undefined)

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    try {
      const response = await authService.login(data)
      setAuth({
        id: response.id,
        name: response.name,
        email: response.email,
        emailVerified: response.email_verified
      })
      router.push('/profile')
      toast.success('Logged in successfully!')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid credentials'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <AuthError message={error} />
      
      <form className="space-y-6" onSubmit={onSubmit}>
        <Input
          id="email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          required
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-sm font-medium text-primary hover:text-primary/90"
          >
            Forgot your password?
          </button>
        </div>

        <Button type="submit" fullWidth isLoading={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={onSignUpClick}
          className="text-sm font-medium text-primary hover:text-primary/90"
        >
          Don&apos;t have an account? Sign up
        </button>
      </div>
    </div>
  )
} 