'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authService } from '@/services/auth'
import { AuthError } from '@/components/auth/error'

interface ForgotPasswordFormProps {
  onBackToSignInClick: () => void
}

/**
 * ForgotPasswordForm component allows users to request a password reset.
 * It handles form submission, loading state, and error messages.
 */
export function ForgotPasswordForm({ onBackToSignInClick }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false) // State to manage loading status
  const [emailSent, setEmailSent] = useState(false) // State to track if email has been sent
  const [error, setError] = useState<string | undefined>(undefined) // State to manage error messages

  /**
   * Handles the form submission for requesting a password reset.
   * It sends the email to the auth service and manages loading and error states.
   * 
   * @param e - The form event
   */
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // Prevent default form submission
    setIsLoading(true) // Set loading state to true
    setError(undefined) // Reset error state

    const formData = new FormData(e.currentTarget) // Create FormData object from the form
    const email = formData.get('email') as string // Extract email from form data

    try {
      await authService.forgotPassword(email) // Call the auth service to send password reset email
      setEmailSent(true) // Update state to indicate email has been sent
      toast.success('Password reset instructions sent to your email') // Show success message
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send reset instructions' // Extract error message
      setError(message) // Set error state
      toast.error(message) // Show error message
    } finally {
      setIsLoading(false) // Reset loading state
    }
  }

  if (emailSent) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-light-foreground dark:text-dark-foreground">
            Check your email
          </h3>
          <p className="mt-2 text-sm text-light-muted dark:text-dark-muted">
            We have sent password reset instructions to your email address.
          </p>
        </div>

        <Button type="button" fullWidth onClick={onBackToSignInClick}>
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AuthError message={error} /> {/* Display any error messages */}

      <div>
        <p className="text-sm text-light-muted dark:text-dark-muted">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        <Input
          id="email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          required
        />

        <div className="flex flex-col space-y-2">
          <Button type="submit" fullWidth isLoading={isLoading}>
            {isLoading ? 'Sending...' : 'Send reset link'} {/* Button text changes based on loading state */}
          </Button>

          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={onBackToSignInClick}
          >
            Back to sign in
          </Button>
        </div>
      </form>
    </div>
  )
} 