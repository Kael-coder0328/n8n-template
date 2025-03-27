import { Skeleton } from '@/components/ui/skeleton'

/**
 * Component for displaying loading state
 */
export const LoadingView = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32" />
      <div className="grid grid-cols-1 gap-6">
        <Skeleton className="h-48" />
      </div>
    </div>
  )
} 