// Legal page (Server Component)
import { Metadata } from 'next'
import { createMetadata } from '@/lib/seo/metadata'
import JsonLd from '@/components/seo/JsonLd'
import LegalPageClient from '@/app/legal/LegalPageClient'

// Define metadata for SEO
export const generateMetadata = (): Metadata => {
  return createMetadata({
    title: 'Legal Information | Terms of Service and Privacy Policy',
    description: 'Our terms of service outline the rules for using our platform, while our privacy policy explains how we collect, use, and protect your personal information.',
    keywords: ['legal', 'terms of service', 'privacy policy', 'user agreement', 'data protection'],
    type: 'website',
  })
}

// Define structured data for the legal page
const legalPageData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Legal Information',
  description: 'Terms of Service and Privacy Policy',
  publisher: {
    '@type': 'Organization',
    name: 'SaaS Platform',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  },
  inLanguage: 'en-US',
  dateModified: new Date().toISOString()
}

export default function LegalPage() {
  return (
    <>
      {/* Add structured data */}
      <JsonLd data={legalPageData} />
      
      {/* Client component for interactivity */}
      <LegalPageClient />
    </>
  )
} 