'use client'

import Link from 'next/link'

export function CTA() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
      <div className="relative isolate overflow-hidden bg-primary-600 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to get started?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
          Join thousands of developers who are already using our platform to build amazing things.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/auth/signup"
            className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Get started
          </Link>
          <Link href="/#demo" className="text-sm font-semibold leading-6 text-white">
            Learn more <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}