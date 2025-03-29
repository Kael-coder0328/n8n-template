'use client'

import { authService } from '@/services/auth'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function Settings() {
  const { auth } = useAuth()
  const router = useRouter()
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenStatus, setTokenStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if not authenticated
  if (!auth) {
    router.push('/auth')
    return null
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    try {
      await authService.AccountPasswordReset(currentPassword, newPassword)
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch{
      setError('Failed to reset password. Please try again.')
    }
  }

  const handleSendVerificationEmail = async () => {
    try {
      setIsLoading(true)
      await authService.sendVerificationEmail()
      toast.success('Verification email sent! Please check your inbox.')
    } catch {
      toast.error('Failed to send verification email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const checkRefreshToken = async () => {
    try {
      const status = await authService.checkRefreshToken()
      setTokenStatus(`Token Status: ${JSON.stringify(status, null, 2)}`)
    } catch{
      setTokenStatus('Error checking refresh token status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-background border border-accent shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-foreground">Profile</h3>
            <p className="mt-1 text-sm text-foreground">
              Manage your account settings and verification.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="space-y-6">
              {/* Email Verification Button */}
              <div>
                {!auth.emailVerified ? (
                  <button
                    onClick={handleSendVerificationEmail}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-400 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending...' : 'Send Verification Email'}
                  </button>
                ) : (
                  <div className="text-sm text-primary-400">
                    ✓ Email verified
                  </div>
                )}
              </div>

              {/* Password Reset Form */}
              <div className="mt-6">
                <h4 className="text-lg font-medium text-foreground mb-4">Reset Password</h4>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1 block w-full border border-accent rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-400 focus:border-primary-400 sm:text-sm bg-background text-foreground"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-foreground">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 block w-full border border-accent rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-400 focus:border-primary-400 sm:text-sm bg-background text-foreground"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 block w-full border border-accent rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-400 focus:border-primary-400 sm:text-sm bg-background text-foreground"
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}

                  {success && (
                    <p className="text-sm text-primary-400">
                      Password updated successfully!
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-400 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Temporary Debug Button */}
      <div className="mt-8 border-t border-accent pt-6">
        <button
          onClick={checkRefreshToken}
          className="px-4 py-2 text-white bg-primary-400 hover:bg-primary-500 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 transition-colors"
        >
          Check Refresh Token Status
        </button>
        {tokenStatus && (
          <pre className="mt-4 p-4 bg-accent rounded-md overflow-auto text-sm text-foreground">
            {tokenStatus}
          </pre>
        )}
      </div>
    </div>
  )
}