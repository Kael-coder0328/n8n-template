'use client'

import Link from 'next/link'

export function CTA() {
  return (
    <div className="relative isolate">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-light-foreground dark:text-dark-foreground">
            Ready to Automate Your Business?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-light-muted dark:text-dark-muted">
            Join hundreds of solopreneurs who are saving time and growing their businesses with our templates.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/templates"
              className="rounded-md bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Browse Templates
              <span className="ml-2 inline-block">→</span>
            </Link>
            <Link
              href="/contact"
              className="rounded-md bg-light-background dark:bg-dark-background px-6 py-3 text-base font-semibold text-light-foreground dark:text-dark-foreground border border-light-accent dark:border-dark-accent hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}