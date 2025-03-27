'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

/**
 * WaitingListPageClient component displays a landing page for users to join 
 * a waiting list for early access to the product.
 * It includes a form to collect emails and tracks referrer information.
 */
export default function WaitingListPageClient() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [referrer, setReferrer] = useState('')

  // Capture referrer information when the component mounts
  useEffect(() => {
    // Get referrer from document.referrer
    const docReferrer = document.referrer || ''
    
    // Check for UTM source in URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const utmSource = urlParams.get('utm_source')
    
    // Set referrer priority: UTM source > document.referrer > 'direct'
    const referrerValue = utmSource || (docReferrer ? new URL(docReferrer).hostname : 'direct')
    
    setReferrer(referrerValue)
    
    // Store referrer in cookie for 30 days
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)
    document.cookie = `referrer=${referrerValue};expires=${expiryDate.toUTCString()};path=/`
  }, [])

  /**
   * Handles the email submission for the waiting list
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
      
      // Get referrer from cookie as a fallback
      const storedReferrer = document.cookie
        .split('; ')
        .find(row => row.startsWith('referrer='))
        ?.split('=')[1] || 'direct'
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/early-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          referrer: referrer || storedReferrer,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to join waiting list')
      }
      
      // Reset form on success
      setEmail('')
      
      toast.success(
        'Thank you for joining our waiting list! We\'ll notify you when we\'re ready.'
      )
    } catch (error) {
      console.error('Error joining waiting list:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to join waiting list. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground sm:text-6xl">
            Something amazing is coming soon
          </h1>
          <p className="mt-6 text-lg leading-8 text-light-muted dark:text-dark-muted">
            We are building a revolutionary SaaS platform that will change the way you work.
            Join our waiting list to get early access and exclusive updates.
          </p>
          
          <div className="mt-10">
            <div className="relative isolate overflow-hidden bg-primary-600/20 py-16 sm:py-24 rounded-xl">
              <div className="mx-auto max-w-xl px-6 lg:px-8">
                <div className="mx-auto max-w-md">
                  <h2 className="text-2xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground">
                    Get Early Access
                  </h2>
                  <p className="mt-4 text-light-muted dark:text-dark-muted">
                    Be the first to experience our platform when we launch the beta.
                  </p>
                  <form className="mt-6" onSubmit={handleSubmit}>
                    <div className="flex gap-x-4">
                      <label htmlFor="email-address" className="sr-only">
                        Email address
                      </label>
                      <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="min-w-0 flex-auto rounded-md border-0 bg-white px-3.5 py-2 text-light-foreground shadow-sm ring-1 ring-inset ring-light-accent focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                        placeholder="Enter your email"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-none rounded-md ${
                          isSubmitting ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'
                        } px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 flex items-center`}
                      >
                        {isSubmitting && (
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {isSubmitting ? 'Joining...' : 'Join waitlist'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="pt-6">
            <div className="flow-root rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary px-6 pb-8">
              <div className="-mt-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary-600 p-3 shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium tracking-tight text-light-foreground dark:text-dark-foreground">Cloud-Based</h3>
                <p className="mt-2 text-base text-light-muted dark:text-dark-muted">
                  Access your work from anywhere, on any device. Our platform is fully cloud-based for maximum flexibility.
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-6">
            <div className="flow-root rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary px-6 pb-8">
              <div className="-mt-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary-600 p-3 shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium tracking-tight text-light-foreground dark:text-dark-foreground">Lightning Fast</h3>
                <p className="mt-2 text-base text-light-muted dark:text-dark-muted">
                  Experience blazing-fast performance that keeps up with your workflow without delays.
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-6">
            <div className="flow-root rounded-lg bg-light-background-secondary dark:bg-dark-background-secondary px-6 pb-8">
              <div className="-mt-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary-600 p-3 shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium tracking-tight text-light-foreground dark:text-dark-foreground">Secure & Private</h3>
                <p className="mt-2 text-base text-light-muted dark:text-dark-muted">
                  Your data is protected with enterprise-grade security and privacy-first design.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-light-background-secondary dark:bg-dark-background-secondary mt-10">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-light-muted hover:text-light-foreground dark:text-dark-muted dark:hover:text-dark-foreground">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-light-muted hover:text-light-foreground dark:text-dark-muted dark:hover:text-dark-foreground">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-light-muted dark:text-dark-muted">
              &copy; 2023 SaaS Company, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 