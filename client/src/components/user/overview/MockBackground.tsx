import { Card } from '@/components/ui/card'

/**
 * MockBackground component that creates a visual placeholder instead of using the actual content.
 * This prevents users from accessing real data through inspect element.
 */
export const MockBackground = () => {
  return (
    <div className="opacity-50">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-light-foreground dark:text-dark-foreground">
          Overview
        </h1>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-light-foreground dark:text-dark-foreground">
                Subscription Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-light-muted dark:text-dark-muted mb-1">Current Plan</p>
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div>
                  <p className="text-sm text-light-muted dark:text-dark-muted mb-1">Status</p>
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 