import { z } from 'zod';

export const schemaSubscriptionTier = z.enum(['free', 'pro']);

export const schemaSubscriptionTierForm = schemaSubscriptionTier;
