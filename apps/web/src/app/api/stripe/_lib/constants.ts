export interface SubscriptionTierConfig {
  name: string;
  price: number;
  tier: 'free' | 'pro';
  interval?: 'month' | 'year';
  stripeProductId: string;
}

const SUBSCRIPTION_TIERS_PROD: SubscriptionTierConfig[] = [
  { name: 'Free', price: 0, tier: 'free', stripeProductId: '' },
  {
    name: 'Pro (Monthly)',
    price: 4.99,
    tier: 'pro',
    interval: 'month',
    stripeProductId: process.env.STRIPE_PRO_MONTHLY_PRODUCT_ID ?? '',
  },
  {
    name: 'Pro (Annual)',
    price: 49,
    tier: 'pro',
    interval: 'year',
    stripeProductId: process.env.STRIPE_PRO_ANNUAL_PRODUCT_ID ?? '',
  },
];

export const SUBSCRIPTION_TIERS = SUBSCRIPTION_TIERS_PROD;

export function getSubscriptionTier(priceInDollars: number | null): 'free' | 'pro' {
  if (!priceInDollars || priceInDollars === 0) return 'free';
  return 'pro';
}
