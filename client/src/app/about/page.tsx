import { Footer } from '@/components/Footer'
import { Metadata } from 'next'
import { createMetadata } from '@/lib/seo/metadata'
import { JsonLd } from '@/components/seo/JsonLd'

/**
 * Generate metadata for the About page
 */
export const generateMetadata = (): Metadata => {
  return createMetadata({
    title: 'About Us',
    description: 'Learn about our mission, values, and the team behind our software development tools and services that streamline workflow and enhance productivity.',
    keywords: ['about us', 'company values', 'mission', 'team', 'software development'],
    type: 'website',
  })
}

/**
 * About page component that displays company information
 */
export default function About() {
  // Organization data for structured data
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SaaS Platform',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/logo.png`,
    description: 'We\'re building the future of software development with modern tools and infrastructure.',
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      {/* Structured data for the organization */}
      <JsonLd data={organizationData} />

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground sm:text-6xl">
            About Us
          </h1>
          <p className="mt-6 text-lg leading-8 text-light-muted dark:text-dark-muted">
            We&apos;re building the future of software development with modern tools and infrastructure.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl lg:max-w-4xl">
          <h2 className="text-2xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground">
            Our Mission
          </h2>
          <p className="mt-6 text-lg leading-8 text-light-muted dark:text-dark-muted">
            Our mission is to empower developers and businesses with cutting-edge tools and services that streamline their workflow and enhance productivity. We believe in creating solutions that are not just powerful, but also intuitive and accessible.
          </p>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground">
            Our Values
          </h2>
          <dl className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <dt className="text-lg font-semibold text-light-foreground dark:text-dark-foreground">Innovation</dt>
              <dd className="mt-2 text-base text-light-muted dark:text-dark-muted">
                We constantly push boundaries and explore new technologies to provide the best solutions for our users.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-light-foreground dark:text-dark-foreground">Quality</dt>
              <dd className="mt-2 text-base text-light-muted dark:text-dark-muted">
                We maintain the highest standards in our code, design, and user experience.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-light-foreground dark:text-dark-foreground">Community</dt>
              <dd className="mt-2 text-base text-light-muted dark:text-dark-muted">
                We believe in fostering a strong developer community and contributing to open source.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-light-foreground dark:text-dark-foreground">Security</dt>
              <dd className="mt-2 text-base text-light-muted dark:text-dark-muted">
                We prioritize the security and privacy of our users&apos; data above all else.
              </dd>
            </div>
          </dl>

          <h2 className="mt-16 text-2xl font-bold tracking-tight text-light-foreground dark:text-dark-foreground">
            Our Team
          </h2>
          <p className="mt-6 text-lg leading-8 text-light-muted dark:text-dark-muted">
            We&apos;re a diverse team of developers, designers, and technology enthusiasts passionate about creating exceptional developer tools and experiences.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}