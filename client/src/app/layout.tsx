import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import Navigation from '@/components/Navigation'
import PageView from '@/components/PageView'
import JsonLd from '@/components/seo/JsonLd'
import PrismInit from '@/components/PrismInit'

const inter = Inter({ subsets: ['latin'] })

// Base site information for SEO
const siteName = 'SaaS Platform'
const siteDescription = 'A modern SaaS platform with authentication, theme support, and powerful features for businesses'

// Generate default metadata for the site
export const metadata: Metadata = {
  title: siteName,
  description: siteDescription,
  keywords: ['saas', 'platform', 'software', 'business', 'service', 'cloud', 'web application'],
  authors: [{ name: 'SaaS Platform Team' }],
  openGraph: {
    type: 'website',
    siteName,
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SaaS Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@saasplatform'
  },
  robots: {
    index: true,
    follow: true
  }
}

// Organization structured data
const organizationData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteName,
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/images/logo.png`,
  sameAs: [
    'https://twitter.com/saasplatform',
    'https://github.com/saasplatform',
    'https://www.linkedin.com/company/saasplatform'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@saasplatform.com',
    contactType: 'customer service'
  }
}

/**
 * Root layout component that wraps all pages with necessary providers
 * and global styles
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground`}>
        {/* Add organization structured data to all pages */}
        <JsonLd data={organizationData} />
        
        <ThemeProvider>
          <AuthProvider>
            <Navigation />
            <PageView />
            {children}
            <PrismInit />
            <Toaster 
              position="bottom-right"
              toastOptions={{
                className: 'bg-light-background dark:bg-dark-background text-light-foreground dark:text-dark-foreground',
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
