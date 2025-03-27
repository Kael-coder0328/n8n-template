//  This component is for one time buy, if we are offering any one time buy
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/auth'
import { useRouter } from 'next/navigation'
import PricingOverlay from '@/components/overlay/PricingOverlay'

interface OrderData {
  id: number
  order_id: string
  user_id: string
  customer_id: number
  store_id: number
  identifier: string
  status: string
  total: number
  currency: string
  created_at: string
  updated_at: string
}

export default function Orders() {
  const { auth } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPricing, setShowPricing] = useState(false)

  useEffect(() => {
    // If not authenticated, redirect to auth page
    if (!auth) {
      router.push('/auth')
      return
    }

    const fetchOrders = async () => {
      try {
        const response = await authService.get<OrderData[]>('/api/user/orders')
        setOrders(response || [])
      } catch (err) {
        console.error('[Orders] Failed to fetch order data:', err)
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Failed to fetch order data. Please try again later.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [auth, router])

  // Show nothing during redirect
  if (!auth) {
    return null
  }

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <h3 className="text-2xl font-semibold text-light-foreground dark:text-dark-foreground">
          Lifetime Deals
        </h3>
        <div className="rounded-lg bg-light-card dark:bg-dark-card p-6 shadow-sm">
          <p className="text-light-muted dark:text-dark-muted">Loading order history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-4">
        <h3 className="text-2xl font-semibold text-light-foreground dark:text-dark-foreground">
        Lifetime Deals
        </h3>
        <div className="rounded-lg bg-light-card dark:bg-dark-card p-6 shadow-sm">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="space-y-6 p-4">
        <h3 className="text-2xl font-semibold text-light-foreground dark:text-dark-foreground">
        Lifetime Deals
        </h3>
        <div className="rounded-lg bg-light-card dark:bg-dark-card p-6 shadow-sm">
          <p className="text-light-muted dark:text-dark-muted">No orders found</p>
          <button
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => setShowPricing(true)}
          >
            View Plans
          </button>
          
          {/* Pricing overlay with animation */}
          <PricingOverlay 
            isVisible={showPricing} 
            onClose={() => setShowPricing(false)} 
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <h3 className="text-2xl font-semibold text-light-foreground dark:text-dark-foreground">
      Lifetime Deals
      </h3>

      <div className="rounded-lg bg-light-card dark:bg-dark-card p-6 shadow-sm">
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.order_id} className="border-b border-light-border dark:border-dark-border last:border-0 pb-6 last:pb-0">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-foreground dark:text-dark-foreground">
                    Order ID
                  </label>
                  <div className="mt-1">
                    <p className="text-light-muted dark:text-dark-muted">{order.order_id}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-foreground dark:text-dark-foreground">
                    Status
                  </label>
                  <div className="mt-1">
                    <p className="text-light-muted dark:text-dark-muted capitalize">{order.status}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-foreground dark:text-dark-foreground">
                    Amount
                  </label>
                  <div className="mt-1">
                    <p className="text-light-muted dark:text-dark-muted">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: order.currency || 'USD'
                      }).format((order.total || 0) / 100)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-foreground dark:text-dark-foreground">
                    Purchase Date
                  </label>
                  <div className="mt-1">
                    <p className="text-light-muted dark:text-dark-muted">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Button to view more plans even when there are orders */}
      <div className="flex justify-end">
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          onClick={() => setShowPricing(true)}
        >
          View More Plans
        </button>
      </div>
      
      {/* Pricing overlay with animation */}
      <PricingOverlay 
        isVisible={showPricing} 
        onClose={() => setShowPricing(false)}
        title="Explore More Plans"
        description="Looking for more options? Check out our subscription plans below."
      />
    </div>
  )
}