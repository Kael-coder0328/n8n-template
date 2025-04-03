'use client'

import Link from 'next/link'

/**
 * Hero component for the landing page
 * Contains the main call-to-action buttons that direct users to authentication flows
 */
export function Hero() {
  return (
    <div className="relative isolate pt-14">
      {/* Background gradient */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 to-primary-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      {/* Hero content */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-light-foreground dark:text-dark-foreground">
            n8n Templates for Solopreneurs
          </h1>
          <p className="mt-6 text-lg leading-8 text-light-muted dark:text-dark-muted">
            Save hours of setup time with ready-to-use automation templates designed specifically for solopreneurs.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/template"
              className="rounded-md bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Browse Templates
              <span className="ml-2 inline-block">→</span>
            </Link>
            <Link
              href="/about"
              className="rounded-md bg-light-background dark:bg-dark-background px-6 py-3 text-base font-semibold text-light-foreground dark:text-dark-foreground border border-light-accent dark:border-dark-accent hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}