import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorViewProps {
  errorMessage: string;
  resetUserData: () => void;
}

/**
 * Component for displaying error state when user data fails to load
 * Provides error message and retry option
 */
export const ErrorView = ({ errorMessage, resetUserData }: ErrorViewProps) => {
  return (
    <Card className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
      <AlertCircle className="h-10 w-10 text-red-500" />
      <div>
        <h3 className="text-lg font-medium">Failed to load user data</h3>
        <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
      </div>
      <Button variant="outline" onClick={resetUserData}>
        Try Again
      </Button>
    </Card>
  )
} 