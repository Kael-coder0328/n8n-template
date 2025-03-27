import { ButtonHTMLAttributes, ReactNode } from 'react'
import { Button } from '@/components/Button'

interface SocialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  provider: string
  children: ReactNode
}

export function SocialButton({ icon, children, ...props }: SocialButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      fullWidth
      className="flex items-center justify-center gap-2"
      {...props}
    >
      {icon}
      <span>Continue with {children}</span>
    </Button>
  )
}