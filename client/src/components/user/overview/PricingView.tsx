import { PriceCard } from '@/components/landing/PriceCard'
import { PRICING_PLANS } from '@/lib/pricing'
import { MockBackground } from './MockBackground'
import { UserData } from '@/types/user'

interface PricingViewProps {
  userData?: UserData | null;
}

/**
 * Component for displaying pricing options for non-subscribers or free users
 * @param userData Optional object containing user's subscription information
 */
export const PricingView = ({}: PricingViewProps) => {
  return (
    <div className="relative min-h-screen">

      
      {/* Mock background */}
      <MockBackground />

      {/* Pricing overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 overflow-y-auto">
        <div className="bg-light-background dark:bg-dark-background p-6 rounded-xl shadow-xl max-w-4xl w-full">
          <h2 className="text-2xl font-bold text-center mb-2 text-light-foreground dark:text-dark-foreground">
            Subscribe to Unlock Features
          </h2>
          <p className="text-center mb-8 text-light-muted dark:text-dark-muted">
            Choose a plan that is right for you to access all features and analytics.
          </p>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 justify-items-center">
            {PRICING_PLANS.map((plan) => (
              <PriceCard
                key={plan.variantId}
                name={plan.name}
                description={plan.description}
                price={plan.price}
                features={plan.features}
                popular={plan.popular}
                productId={plan.productId}
                variantId={plan.variantId}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 