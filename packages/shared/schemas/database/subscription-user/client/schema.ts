import { schemaDatabaseObject } from '../../_partial';
import { schemaSubscriptionTier } from '../../_partial/subscription-tier';
import { schemaStripeId } from '../../../services/stripe/stripe-id';
import { z } from 'zod';

export const schemaRelationshipFields = z.object({
  userId: schemaDatabaseObject.shape.id,
});

export const schema = z.object({
  ...schemaDatabaseObject.shape,
  tier: schemaSubscriptionTier.default('free'),
  stripeCustomerId: schemaStripeId.nullable().optional(),
  stripeSubscriptionId: schemaStripeId.nullable().optional(),
  ...schemaRelationshipFields.shape,
});

export const schemaCreate = schema.pick({
  userId: true,
  tier: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

export const schemaUpdate = schemaCreate.omit({ userId: true }).extend({}).partial();
