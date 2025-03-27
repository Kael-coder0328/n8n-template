/**
 * Basic dropdown menu component
 */

import { ReactNode } from 'react'

interface DropdownMenuProps {
  children: ReactNode
  className?: string
}

export function DropdownMenu({ children, className = '' }: DropdownMenuProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  )
}

interface DropdownMenuTriggerProps {
  children: ReactNode
  asChild?: boolean
  className?: string
}

export function DropdownMenuTrigger({ children, className = '' }: DropdownMenuTriggerProps) {
  return (
    <div className={`inline-block ${className}`}>
      {children}
    </div>
  )
}

interface DropdownMenuContentProps {
  children: ReactNode
  align?: 'start' | 'end' | 'center'
  className?: string
}

export function DropdownMenuContent({ 
  children, 
  align = 'center', 
  className = '' 
}: DropdownMenuContentProps) {
  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0'
  }

  return (
    <div className={`absolute z-50 min-w-[8rem] rounded-md bg-white dark:bg-gray-900 p-1 border shadow-md mt-1 ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  )
}

interface DropdownMenuItemProps {
  children: ReactNode
  onClick?: () => void
  className?: string
}

export function DropdownMenuItem({ 
  children, 
  onClick, 
  className = '' 
}: DropdownMenuItemProps) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
    >
      {children}
    </button>
  )
} 