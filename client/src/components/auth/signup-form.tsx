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

interface SignUpFormProps {
  onSignInClick: () => void
}

export function SignUpForm({ onSignInClick }: SignUpFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const { setAuth } = useAuth()

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    if (password.length < 8) errors.push('Password must be at least 8 characters long')
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter')
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter')
    if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number')
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must contain at least one special character')
    return errors
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(undefined)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const passwordErrors = validatePassword(data.password)
    if (passwordErrors.length > 0) {
      setIsLoading(false)
      setError(passwordErrors.join(' '))
      passwordErrors.forEach(error => toast.error(error))
      return
    }

    try {
      // Register the user
      await authService.register(data)

      // Login the user
      const response = await authService.login({
        email: data.email,
        password: data.password
      })
      
      // Store the auth response
      setAuth({
        id: response.id,
        name: response.name,
        email: response.email,
        emailVerified: response.email_verified
      })

      router.push('/profile')
      toast.success('Account created successfully!')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create account'
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
          id="name"
          name="name"
          type="text"
          label="Full name"
          autoComplete="name"
          required
        />

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
          autoComplete="new-password"
          required
        />

        <Button type="submit" fullWidth isLoading={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={onSignInClick}
          className="text-sm font-medium text-primary hover:text-primary/90"
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  )
} 