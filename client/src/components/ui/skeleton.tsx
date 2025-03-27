interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-light-hover dark:bg-dark-hover rounded-md ${className}`} />
  )
} 