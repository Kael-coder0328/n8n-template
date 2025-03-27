'use client'

import { Footer } from '@/components/Footer'
import { Hero } from '@/components/landing/Hero'
import { Demo } from '@/components/landing/Demo'
import { Features } from '@/components/landing/Features'
import { Pricing } from '@/components/landing/Pricing'
import { Testimonials } from '@/components/landing/Testimonials'
import { CTA } from '@/components/landing/CTA'
import NewsletterSubscription from '@/components/landing/NewsletterSubscription'

/**
 * Client component for the landing page that displays the main marketing content
 * with hero section, features, pricing, and CTAs
 */
export default function HomePageClient() {
  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      <Hero />
      <Demo />
      <Features />
      <Pricing />
      <Testimonials />
      <CTA />
      <NewsletterSubscription />
      <Footer />
    </div>
  )
} 