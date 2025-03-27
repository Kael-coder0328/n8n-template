interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-light-card dark:bg-dark-card rounded-lg shadow-sm ${className}`}>
      {children}
    </div>
  )
} 