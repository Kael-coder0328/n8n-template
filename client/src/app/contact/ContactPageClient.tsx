'use client'

import { useState } from 'react'
import { Footer } from '@/components/Footer'
import { toast } from 'react-hot-toast'

/**
 * Client component for the Contact page that handles form submission
 * and other interactive elements
 */
export default function ContactPageClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Handles the form submission event.
   * Prevents the default form submission behavior,
   * sends the form data to the backend API, and displays
   * appropriate feedback to the user.
   * 
   * @param e - The form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to send message')
      }
      
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
      })
      
      toast.success(
        'Your message has been sent successfully! We will get back to you at ' + 
        formData.email + ' as soon as possible.'
      )
    } catch (error) {
      console.error('Error sending contact form:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground sm:text-6xl">
            Contact Us
          </h1>
          <p className="mt-6 text-lg leading-8 text-light-muted dark:text-dark-muted">
            Have questions? We&apos;re here to help. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-light-foreground dark:text-dark-foreground">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2 block w-full rounded-md border border-light-accent dark:border-dark-accent bg-light-background dark:bg-dark-background px-3 py-2 text-light-foreground dark:text-dark-foreground shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-light-foreground dark:text-dark-foreground">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-2 block w-full rounded-md border border-light-accent dark:border-dark-accent bg-light-background dark:bg-dark-background px-3 py-2 text-light-foreground dark:text-dark-foreground shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-light-foreground dark:text-dark-foreground">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="mt-2 block w-full rounded-md border border-light-accent dark:border-dark-accent bg-light-background dark:bg-dark-background px-3 py-2 text-light-foreground dark:text-dark-foreground shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-sm"
              >
                <option>General Inquiry</option>
                <option>Technical Support</option>
                <option>Sales</option>
                <option>Partnership</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-light-foreground dark:text-dark-foreground">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="mt-2 block w-full rounded-md border border-light-accent dark:border-dark-accent bg-light-background dark:bg-dark-background px-3 py-2 text-light-foreground dark:text-dark-foreground shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-sm"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`rounded-md ${
                  isSubmitting ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'
                } px-4 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 flex items-center`}
              >
                {isSubmitting && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isSubmitting ? 'Sending...' : 'Send message'}
              </button>
            </div>
          </form>

          <div className="mt-16 border-t border-light-accent dark:border-dark-accent pt-8">
            <h2 className="text-2xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground">
              Other Ways to Reach Us
            </h2>
            <dl className="mt-6 space-y-6">
              <div>
                <dt className="text-base font-semibold text-light-foreground dark:text-dark-foreground">Office Location</dt>
                <dd className="mt-2 text-base text-light-muted dark:text-dark-muted">
                  123 Tech Street<br />
                  San Francisco, CA 94105<br />
                  United States
                </dd>
              </div>
              <div>
                <dt className="text-base font-semibold text-light-foreground dark:text-dark-foreground">Support Hours</dt>
                <dd className="mt-2 text-base text-light-muted dark:text-dark-muted">
                  Monday - Friday<br />
                  9:00 AM - 6:00 PM PST
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 