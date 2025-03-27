'use client'

import { useUserData } from '@/contexts/UserDataContext'
import { useState, useEffect } from 'react'
import { hasActiveSubscription } from '@/lib/pricing'
import { ActiveSubscriptionView } from '@/components/user/overview/ActiveSubscriptionView'
import { PricingView } from '@/components/user/overview/PricingView'
import { LoadingView } from '@/components/user/overview/LoadingView'
import { ErrorView } from '@/components/user/overview/ErrorView'
/**
 * Main UserOverview component that conditionally renders the appropriate view
 * based on the user's subscription status
 */
export default function UserOverview() {
  const { userData, loading, error, forceRefreshUserData } = useUserData()
  const [mounted, setMounted] = useState(false)

  // Used to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (loading) {
    return <LoadingView />
  }

  if (error) {
    return <ErrorView errorMessage={error} resetUserData={forceRefreshUserData} />
  }
  
  // Check for the 'none' status that represents no subscription
  if (userData?.subscription?.status === 'none') {
    return <PricingView userData={userData} />
  }
  
  // Create a safe version of userData for hasActiveSubscription function
  // The function expects { subscription?: { status?: string; variantId?: string | number } }
  const subscriptionData = {
    subscription: userData ? {
      status: userData.subscription.status === null ? undefined : userData.subscription.status,
      variantId: userData.subscription.variantId === null ? undefined : userData.subscription.variantId
    } : undefined
  };
  
  const isSubscribed = hasActiveSubscription(subscriptionData);
  
  // Force override for active subscriptions if server data indicates an active subscription
  // but our logic is not detecting it correctly
  if (userData?.subscription?.status?.toLowerCase() === 'active' && !isSubscribed) {
    // Make sure userData is not null before passing to ActiveSubscriptionView
    if (userData) {
      return <ActiveSubscriptionView userData={userData} />
    }
  }

  // When the user doesn't have an active subscription, show pricing
  if (!isSubscribed) {
    return <PricingView userData={userData} />
  }

  // Make sure userData is not null before passing to ActiveSubscriptionView
  if (userData) {
    return <ActiveSubscriptionView userData={userData} />
  }
  
  // Fallback if userData is null but somehow we got here
  return <PricingView userData={null} />
} 