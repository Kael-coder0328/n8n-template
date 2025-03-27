'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

/**
 * NewsletterSubscription component renders a newsletter subscription form
 * that allows users to sign up for the newsletter with their email address.
 * The component includes state management for form submission and validation.
 */
export default function NewsletterSubscription() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Handles the form submission to subscribe to the newsletter
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to subscribe to newsletter')
      }
      
      // Reset form on success
      setEmail('')
      
      toast.success(
        'Thank you for subscribing to our newsletter!'
      )
    } catch (error) {
      console.error('Error subscribing to newsletter:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to subscribe to newsletter. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-light-background-secondary dark:bg-dark-background-secondary py-8 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-md w-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-light-foreground dark:text-dark-foreground">
            Subscribe to our newsletter
          </h2>
          <p className="mt-2 text-sm text-light-muted dark:text-dark-muted">
            Get the latest updates, news, and special offers delivered directly to your inbox.
          </p>
        </div>
        
        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md border-0 text-base text-light-foreground dark:text-dark-foreground shadow-sm ring-1 ring-inset ring-light-accent dark:ring-dark-accent placeholder:text-light-muted dark:placeholder:text-dark-muted focus:ring-2 focus:ring-inset focus:ring-primary-600"
              placeholder="Enter your email"
            />
            <div className="mt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-md shadow-sm text-white ${
                  isSubmitting ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'
                } font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600`}
              >
                {isSubmitting && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-light-muted dark:text-dark-muted text-center">
            We care about your data in our <a href="/privacy" className="font-medium text-primary-600 hover:text-primary-500">privacy policy</a>.
          </p>
        </form>
      </div>
    </div>
  )
} 