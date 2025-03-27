'use client'

import { testimonials } from '@/data/landing'

// The Testimonials component renders a section displaying user testimonials.
export function Testimonials() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl lg:text-center">
        <h2 className="text-base font-semibold leading-7 text-primary-600">Testimonials</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Trusted by developers worldwide
        </p>
      </div>
      <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-sm leading-6 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <div key={testimonial.author} className="rounded-2xl bg-light-background dark:bg-dark-background p-8 ring-1 ring-light-accent dark:ring-dark-accent">
            <p className="text-light-muted dark:text-dark-muted">&quot;{testimonial.content}&quot;</p>
            <div className="mt-6 flex items-center gap-x-4">
              <div className="h-10 w-10 rounded-full bg-light-accent dark:bg-dark-accent" />
              <div>
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-light-muted dark:text-dark-muted">{testimonial.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}