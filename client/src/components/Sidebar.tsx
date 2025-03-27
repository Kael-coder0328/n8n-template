'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  HomeIcon,
  DocumentDuplicateIcon,
  CogIcon,
} from '@heroicons/react/24/outline'

const navigationItems = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/dashboard/projects', icon: DocumentDuplicateIcon },
  { name: 'Orders', href: '/dashboard/orders', icon: DocumentDuplicateIcon },
  { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: DocumentDuplicateIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
]

/**
 * Sidebar component that provides navigation for dashboard pages
 */
export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col fixed left-0 top-16 bottom-0 bg-light-background dark:bg-dark-background border-r border-light-accent dark:border-dark-accent">
      <div className="flex flex-grow flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-5 flex-1 space-y-1 px-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md
                  ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-light-foreground dark:text-dark-foreground hover:bg-light-accent dark:hover:bg-dark-accent'
                  }
                `}
              >
                <item.icon
                  className={`
                    mr-3 h-6 w-6 flex-shrink-0
                    ${
                      isActive
                        ? 'text-white'
                        : 'text-light-foreground dark:text-dark-foreground'
                    }
                  `}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}