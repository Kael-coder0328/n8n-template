import { Card } from '@/components/ui/card'
import { getPlanName, getStatusColor } from '@/lib/pricing'
import { UserData } from '@/types/user'

interface ActiveSubscriptionViewProps {
  userData: UserData;
}

/**
 * Component for displaying subscription details of an active subscriber
 * @param userData Object containing subscription information including status, variantId
 */
export const ActiveSubscriptionView = ({ userData }: ActiveSubscriptionViewProps) => {
  const planName = getPlanName(userData?.subscription?.variantId || null)
  const statusColor = getStatusColor(userData?.subscription?.status)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-light-foreground dark:text-dark-foreground">
          Overview
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-light-foreground dark:text-dark-foreground">
              Subscription Details
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-light-muted dark:text-dark-muted mb-1">Current Plan</p>
                <p className="text-lg font-medium text-light-foreground dark:text-dark-foreground">
                  {planName}
                </p>
              </div>
              <div>
                <p className="text-sm text-light-muted dark:text-dark-muted mb-1">Status</p>
                <p className={`text-lg font-medium ${statusColor}`}>
                  {userData?.subscription.status || 'No active subscription'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 