'use client'

import { ReactNode } from 'react'

interface SocialAuthProps {
  children: ReactNode;
  dividerText?: string;
}

export function SocialAuth({ children, dividerText = 'Or continue with' }: SocialAuthProps) {
  return (
    <div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-light-accent dark:border-dark-accent" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-light-card dark:bg-dark-card px-2 text-light-muted dark:text-dark-muted">
            {dividerText}
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {children}
      </div>
    </div>
  )
} 