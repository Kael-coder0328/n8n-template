'use client'

// Feature list for the landing page
const features = [
  {
    name: 'Save Time',
    description: 'Stop building workflows from scratch. Our templates get you up and running in minutes, not hours.',
    icon: function ClockIcon(props: any) {
      return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  },
  {
    name: 'Proven Solutions',
    description: 'Each template is battle-tested and optimized for the specific needs of solopreneurs.',
    icon: function CheckCircleIcon(props: any) {
      return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  },
  {
    name: 'Premium Quality',
    description: 'Expertly crafted workflows with detailed documentation and regular updates.',
    icon: function StarIcon(props: any) {
      return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      )
    },
  },
]

export function Features() {
  return (
    <div id="features" className="mx-auto max-w-7xl px-6 lg:px-8 py-8 sm:py-20">
      <div className="mx-auto max-w-2xl lg:text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-light-foreground dark:text-dark-foreground">
          Built for Solopreneurs
        </h2>
        <p className="mt-6 text-lg leading-8 text-light-muted dark:text-dark-muted">
          Our templates are designed to solve the specific challenges solopreneurs face every day.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.name} className="flex flex-col items-center text-center">
              <dt className="flex flex-col items-center gap-y-4">
                <div className="rounded-lg bg-light-accent/10 dark:bg-dark-accent/10 p-4">
                  <feature.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                </div>
                <span className="text-xl font-semibold text-light-foreground dark:text-dark-foreground">{feature.name}</span>
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