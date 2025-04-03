'use client'

import { Footer } from '@/components/Footer'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { CTA } from '@/components/landing/CTA'
import NewsletterSubscription from '@/components/landing/NewsletterSubscription'
import { Demo } from '@/components/landing/Demo'
import { FeaturedTemplates } from '@/components/landing/FeaturedTemplates'

/**
 * Client component for the landing page that displays the main marketing content
 * with hero section, features, templates, and CTAs
 */
export default function HomePageClient() {
  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <Hero />
      <Features />
      <FeaturedTemplates />
      <Demo />
      <CTA />
      <NewsletterSubscription />
      <Footer />
    </div>
  )
} 