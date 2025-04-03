'use client'

import Link from 'next/link'
import Image from 'next/image'

const navigation = {
  main: [
    { name: 'About', href: '/about' },
    { name: 'Templates', href: '/template' },
    { name: 'Contact', href: '/contact' },
  ],
  resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'Demo', href: '/#demo' },
  ],
  legal: [
    { name: 'Terms', href: '/terms' },
    { name: 'Privacy', href: '/privacy' },
  ],
}

/**
 * Footer component that displays site-wide footer with links and information
 */
export function Footer() {
  return (
    <footer className="bg-light-background dark:bg-dark-background" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-light-accent/10 dark:bg-dark-accent/10">
                <Image
                  src="/placeholder-template.svg"
                  alt="n8n Templates"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <span className="text-xl font-semibold text-light-foreground dark:text-dark-foreground">
                n8n Templates
              </span>
            </Link>
            <p className="text-sm leading-6 text-light-muted dark:text-dark-muted">
              Automation templates for solopreneurs. Save time, grow your business.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 xl:col-span-2 xl:mt-0">
            <div>
              <h3 className="text-sm font-semibold text-light-foreground dark:text-dark-foreground">Main</h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-light-muted dark:text-dark-muted hover:text-primary-600"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-light-foreground dark:text-dark-foreground">Resources</h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.resources.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-light-muted dark:text-dark-muted hover:text-primary-600"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-light-foreground dark:text-dark-foreground">Legal</h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-light-muted dark:text-dark-muted hover:text-primary-600"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-light-accent dark:border-dark-accent pt-8 sm:mt-20 lg:mt-24">
          <p className="text-sm text-light-muted dark:text-dark-muted text-center">
            &copy; {new Date().getFullYear()} n8n Templates. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}