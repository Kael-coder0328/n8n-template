'use client'

import { XCircle } from 'lucide-react'

interface AuthErrorProps {
  message?: string
}

export function AuthError({ message }: AuthErrorProps) {
  if (!message) return null

  return (
    <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircle className="h-5 w-5 text-red-400 dark:text-red-500" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Authentication Error
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            {message}
          </div>
        </div>
      </div>
    </div>
  )
} 