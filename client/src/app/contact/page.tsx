// Contact page (Server Component)
import { Metadata } from 'next'
import { createMetadata } from '@/lib/seo/metadata'
import JsonLd from '@/components/seo/JsonLd'
import ContactPageClient from './ContactPageClient'

// Generate metadata for SEO
export const generateMetadata = (): Metadata => {
  return createMetadata({
    title: 'Contact Us',
    description: 'Get in touch with our team for support, inquiries, or partnership opportunities. We\'re here to help with all your software development needs.',
    keywords: ['contact', 'support', 'help', 'customer service', 'inquiry'],
    type: 'website',
  })
}

// Define structured data for the contact page
const contactPageData = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Us',
  description: 'Get in touch with our team',
  mainEntity: {
    '@type': 'Organization',
    name: 'SaaS Platform',
    telephone: '+1-800-123-4567',
    email: 'contact@example.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Tech Street',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94105',
      addressCountry: 'US'
    },
    openingHours: 'Mo-Fr 09:00-18:00'
  }
}

/**
 * Contact page server component that provides metadata and structured data
 */
export default function ContactPage() {
  return (
    <>
      {/* Add structured data */}
      <JsonLd data={contactPageData} />
      
      {/* Client component for interactivity */}
      <ContactPageClient />
    </>
  )
}