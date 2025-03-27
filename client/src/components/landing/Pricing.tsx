'use client';

import { PriceCard } from './PriceCard';
import { PRICING_PLANS } from '@/lib/pricing';

/**
 * Pricing component that displays the subscription plans in a grid layout
 * Consumes the centralized pricing data from lib/pricing.ts
 */
export function Pricing() {
  return (
    <div id="pricing" className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl lg:text-center">
        <h2 className="text-base font-semibold leading-7 text-primary-600">Pricing</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Simple, transparent pricing
        </p>
        <p className="mt-6 text-lg leading-8 text-light-muted dark:text-dark-muted">
          Choose the plan that best fits your needs. All plans include our core features.
        </p>
      </div>
      <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 md:max-w-none md:grid-cols-3">
        {PRICING_PLANS.map((plan) => (
          <PriceCard
            key={plan.name}
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
  );
}