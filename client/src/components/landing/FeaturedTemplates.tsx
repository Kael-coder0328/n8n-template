'use client'

import Image from 'next/image'
import Link from 'next/link'

// Template data
const templates = [
  {
    id: 1,
    name: 'Client Onboarding Automation',
    description: 'Streamline your client intake process with automated forms, document generation...',
    image: '/placeholder-template.svg'
  },
  {
    id: 2,
    name: 'Email Marketing Automation',
    description: 'Automate your email marketing campaigns with personalized sequences...',
    image: '/placeholder-template.svg'
  },
  {
    id: 3,
    name: 'Social Media Scheduler',
    description: 'Schedule and automate your social media posts across multiple platforms...',
    image: '/placeholder-template.svg'
  },
]

export function FeaturedTemplates() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
      <div className="mx-auto max-w-2xl lg:text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-light-foreground dark:text-dark-foreground">
          Featured Templates
        </h2>
        <p className="mt-6 text-lg leading-8 text-light-muted dark:text-dark-muted">
          Explore our most popular automation templates for solopreneurs.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-light-accent dark:border-dark-accent bg-light-background dark:bg-dark-background shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative h-48 overflow-hidden bg-light-accent/10 dark:bg-dark-accent/10">
                <Image
                  src={template.image}
                  alt={template.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  priority={template.id === 1}
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-light-foreground dark:text-dark-foreground group-hover:text-primary-600 transition-colors">
                    {template.name}
                  </h3>
                  <p className="mt-3 text-base text-light-muted dark:text-dark-muted">
                    {template.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Link
            href="/templates"
            className="rounded-md bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            View All Templates
          </Link>
        </div>
      </div>
    </div>
  )
} 