/**
 * This file contains pricing-related constants and types used throughout the application
 * Following the DRY principle by centralizing pricing data
 */

// Define variant IDs from environment variables
export const VARIANT_IDS = {
  BASIC: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID_1 || '',
  PRO: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID_2 || '',
  ENTERPRISE: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID_3 || '',
}

// Define the type for a pricing plan
export interface PricingPlan {
  name: string
  description: string
  price: number
  features: string[]
  popular?: boolean
  productId: string
  variantId: string
}

// Define pricing plans
export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Basic',
    description: 'All the basics for personal projects and simple websites.',
    price: 9,
    features: ['Up to 5 projects', 'Basic analytics', 'Email support'],
    productId: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID || '',
    variantId: VARIANT_IDS.BASIC,
  },
  {
    name: 'Pro',
    description: 'Perfect for professional developers and small teams.',
    price: 29,
    features: ['Up to 25 projects', 'Advanced analytics', 'Priority support', 'API access'],
    popular: true,
    productId: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID || '',
    variantId: VARIANT_IDS.PRO,
  },
  {
    name: 'Enterprise',
    description: 'Ultimate resources for larger teams and complex projects.',
    price: 99,
    features: ['Unlimited projects', 'Custom analytics', 'Dedicated support', 'Advanced API access', 'Custom integrations'],
    productId: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID || '',
    variantId: VARIANT_IDS.ENTERPRISE,
  },
]

/**
 * Gets the plan name based on the variant ID
 * @param variantId The variant ID to look up
 * @returns The plan name as a string
 */
export const getPlanName = (variantId: string | number | null): string => {
  if (!variantId) return 'No Plan'
  
  const variantStr = variantId.toString()
  switch (variantStr) {
    case VARIANT_IDS.BASIC:
      return 'Basic Plan'
    case VARIANT_IDS.PRO:
      return 'Pro Plan'
    case VARIANT_IDS.ENTERPRISE:
      return 'Enterprise Plan'
    default:
      return 'Unknown Plan'
  }
}

/**
 * Gets the CSS class for the status color
 * @param status The subscription status
 * @returns The CSS class for the text color
 */
export const getStatusColor = (status: string | null | undefined): string => {
  if (!status) return 'text-gray-500'
  
  switch (status.toLowerCase()) {
    case 'active':
      return 'text-green-500'
    case 'cancelled':
      return 'text-yellow-500'
    case 'expired':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

/**
 * Checks if the user has an active subscription
 * @param userData The user data object
 * @returns Boolean indicating if the user has an active subscription
 */
export const hasActiveSubscription = (userData: { subscription?: { status?: string; variantId?: string | number } }): boolean => {
  // Check for required properties with explicit null handling
  const status = userData?.subscription?.status;
  const variantId = userData?.subscription?.variantId;
  
  // Explicit check for 'none' status which means no subscription
  if (status === 'none') {
    return false;
  }
  
  // More robust check for active status
  const isActive = status?.toLowerCase() === 'active';
  const hasVariant = variantId !== undefined && variantId !== null;
  
  return isActive && hasVariant;
} 