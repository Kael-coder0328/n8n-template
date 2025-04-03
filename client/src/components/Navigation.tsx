'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { ThemeToggle } from './ThemeToggle'

/**
 * Navigation component that displays the top navigation bar
 * with theme toggle functionality
 */
const Navigation = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full mx-auto bg-light-background/80 dark:bg-dark-background/80 backdrop-blur supports-[backdrop-filter]:bg-light-background/60 supports-[backdrop-filter]:dark:bg-dark-background/80">
      <nav className="flex w-full max-w-7xl px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between items-center w-full h-16">
          {/* Logo and Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center font-semibold text-light-foreground dark:text-dark-foreground hover:text-primary-600 transition-colors"
            >
              SaaS Platform
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex space-x-6">
              <button
                onClick={() => {
                  if (pathname === '/') {
                    document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })
                  } else {
                    router.push('/#pricing')
                  }
                }}
                className="text-sm font-medium text-light-foreground dark:text-dark-foreground hover:text-primary-600 transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => {
                  if (pathname === '/') {
                    document.querySelector('#demo')?.scrollIntoView({ behavior: 'smooth' })
                  } else {
                    router.push('/#demo')
                  }
                }}
                className="text-sm font-medium text-light-foreground dark:text-dark-foreground hover:text-primary-600 transition-colors"
              >
                Demo
              </button>
              <Link
                href="/blog"
                className="text-sm font-medium text-light-foreground dark:text-dark-foreground hover:text-primary-600 transition-colors"
              >
                Blog
              </Link>
            </div>
          </div>

          {/* Theme Toggle and Mobile Menu Button */}
          <div className="flex items-center gap-6">
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden rounded-md p-2 text-light-foreground dark:text-dark-foreground hover:bg-light-accent dark:hover:bg-dark-accent"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-light-background dark:bg-dark-background border-b border-light-accent dark:border-dark-accent">
            <div className="space-y-1 px-4 py-2">
              <button
                onClick={() => {
                  if (pathname === '/') {
                    document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' })
                  } else {
                    router.push('/#pricing')
                  }
                  setIsMobileMenuOpen(false)
                }}
                className="block w-full text-left py-2 text-base font-medium text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground"
              >
                Pricing
              </button>
              <button
                onClick={() => {
                  if (pathname === '/') {
                    document.querySelector('#demo')?.scrollIntoView({ behavior: 'smooth' })
                  } else {
                    router.push('/#demo')
                  }
                  setIsMobileMenuOpen(false)
                }}
                className="block w-full text-left py-2 text-base font-medium text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground"
              >
                Demo
              </button>
              <Link
                href="/blog"
                className="block py-2 text-base font-medium text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
            </div>
          </div>
        )}
      </nav>
    </div>
  )
}

export default Navigation