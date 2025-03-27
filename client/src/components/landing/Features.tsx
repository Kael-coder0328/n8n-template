/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

// Feature list for the landing page
const features = [
    {
      name: 'Authentication & Security',
      description: 'Built-in authentication with multiple providers and enterprise-grade security features.',
      icon: function LockIcon(props: any) {
        return (
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        )
      },
    },
    {
      name: 'Modern Tech Stack',
      description: 'Built with Next.js, Go, and other modern technologies for optimal performance and developer experience.',
      icon: function CodeIcon(props: any) {
        return (
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
        )
      },
    },
    {
      name: 'Scalable Infrastructure',
      description: 'Designed to scale with your business, from startup to enterprise, with robust and reliable infrastructure.',
      icon: function ChartIcon(props: any) {
        return (
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        )
      },
    },
  ]

export function Features() {
  return (
    <div id="features" className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl lg:text-center">
        <h2 className="text-base font-semibold leading-7 text-primary-600">Everything you need</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          All-in-one platform for your business
        </p>
        <p className="mt-6 text-lg leading-8 text-light-muted dark:text-dark-muted">
          Our platform provides everything you need to get started, grow, and succeed.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.name} className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                <feature.icon className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                {feature.name}
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-light-muted dark:text-dark-muted">
                <p className="flex-auto">{feature.description}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}