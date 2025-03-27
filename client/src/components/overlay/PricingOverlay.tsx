import { PriceCard } from '@/components/landing/PriceCard'
import { PRICING_PLANS } from '@/lib/pricing'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * PricingOverlay component to show pricing plans with animation
 * @param {Object} props - Component properties
 * @param {boolean} props.isVisible - Whether the pricing overlay should be visible
 * @param {Function} props.onClose - Function to call when the overlay is closed
 */
const PricingOverlay = ({ 
  isVisible, 
  onClose,
  title = "Choose a Plan",
  description = "Choose a plan that's right for you to access all features and analytics."
}: { 
  isVisible: boolean; 
  onClose: () => void;
  title?: string;
  description?: string;
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="bg-light-background dark:bg-dark-background p-6 rounded-xl shadow-xl max-w-4xl w-full"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-light-foreground dark:text-dark-foreground">
                {title}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-light-muted/10 dark:hover:bg-dark-muted/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <p className="text-center mb-8 text-light-muted dark:text-dark-muted">
              {description}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PricingOverlay; 