'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authService } from '@/services/auth'
import { AuthError } from '@/components/auth/error'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

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

    if (!token) {
      setError('Invalid or expired reset token')
      setIsLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    const passwordErrors = validatePassword(password)
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(' '))
      passwordErrors.forEach(error => toast.error(error))
      setIsLoading(false)
      return
    }

    try {
      await authService.resetPassword(token, password)
      toast.success('Password reset successfully')
      router.push('/auth?view=login')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to reset password'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground">
            Reset your password
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-light-card dark:bg-dark-card px-4 py-8 shadow sm:rounded-lg sm:px-10">
            <AuthError message={error} />

            <form className="space-y-6" onSubmit={onSubmit}>
              <Input
                id="password"
                name="password"
                type="password"
                label="New password"
                autoComplete="new-password"
                required
              />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm new password"
                autoComplete="new-password"
                required
              />

              <Button type="submit" fullWidth isLoading={isLoading}>
                {isLoading ? 'Resetting password...' : 'Reset password'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}