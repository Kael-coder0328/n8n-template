'use client'

import { forwardRef } from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

/**
 * Input component with consistent styling and error handling
 * Supports all standard input attributes plus label and error message
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div>
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-light-foreground dark:text-dark-foreground"
        >
          {label}
        </label>
        <div className="mt-1">
          <input
            ref={ref}
            className={`
              block w-full rounded-md border-light-accent dark:border-dark-accent
              bg-light-background dark:bg-dark-background
              text-light-foreground dark:text-dark-foreground
              shadow-sm
              focus:border-primary-500 focus:ring-primary-500
              sm:text-sm
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input' 