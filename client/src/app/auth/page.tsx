// Auth page (Server Component)
import { Metadata } from 'next'
import { createMetadata } from '@/lib/seo/metadata'
import JsonLd from '@/components/seo/JsonLd'
import AuthPageClient from '@/app/auth/AuthPageClient'

// Define metadata for SEO
export const generateMetadata = (): Metadata => {
  return createMetadata({
    title: 'Sign In or Create an Account',
    description: 'Sign in to your account or create a new one to access our platform features and services.',
    keywords: ['login', 'sign up', 'authentication', 'user account', 'password reset'],
    type: 'website',
    noIndex: true, // We don't want search engines to index authentication pages
  })
}

// Define structured data for the auth page
const authPageData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Authentication',
  description: 'Sign in or create an account',
  publisher: {
    '@type': 'Organization',
    name: 'SaaS Platform',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  }
}

export default function AuthPage() {
  return (
    <>
      {/* Add structured data */}
      <JsonLd data={authPageData} />
      
      {/* Client component for interactivity */}
      <AuthPageClient />
    </>
  )
} 