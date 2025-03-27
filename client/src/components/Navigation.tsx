'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/auth'
import { ThemeToggle } from './ThemeToggle'

/**
 * Navigation component that displays the top navigation bar
 * with authentication state and theme toggle
 */
const Navigation = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { auth, logout: contextLogout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    try {
      await authService.logout()
      contextLogout()
      router.push('/')
    } catch (error) {
      console.error('[Navigation] Logout failed:', error)
      // Still clear local state even if API call fails
      contextLogout()
      router.push('/')
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
              {auth && (
                <Link
                  href="/overview"
                  className="text-sm font-medium text-light-foreground dark:text-dark-foreground hover:text-primary-600 transition-colors"
                >
                  Overview
                </Link>
              )}
            </div>
          </div>

          {/* Theme Toggle, Auth, and Mobile Menu Button */}
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
            
            {/* Auth Section */}
            {auth ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 rounded-md p-2 hover:bg-light-accent dark:hover:bg-dark-accent cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    {auth.name?.[0]?.toUpperCase() || auth.email[0].toUpperCase()}
                  </div>
                  <span className="text-light-foreground dark:text-dark-foreground">
                    {auth.name || 'User'}
                  </span>
                </button>

                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-light-background dark:bg-dark-background border border-light-accent dark:border-dark-accent shadow-lg focus:outline-none z-50">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-light-foreground dark:text-dark-foreground hover:bg-light-accent dark:hover:bg-dark-accent transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          handleLogout()
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-light-foreground dark:text-dark-foreground hover:bg-light-accent dark:hover:bg-dark-accent transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth"
                  className="rounded-md bg-primary-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-400"
                >
                  Sign in / up
                </Link>
              </div>
            )}
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
              {auth && (
                <Link
                  href="/overview"
                  className="block py-2 text-base font-medium text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Overview
                </Link>
              )}
            </div>
            {!auth && (
              <div className="border-t border-light-accent dark:border-dark-accent px-4 py-2">
                <Link
                  href="/auth"
                  className="block py-2 text-base font-medium text-light-muted dark:text-dark-muted hover:text-light-foreground dark:hover:text-dark-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in / up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  )
}

export default Navigation