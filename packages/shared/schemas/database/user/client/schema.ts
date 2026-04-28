import { schemaDatabaseObject } from '../../_partial';
import { schemaClerkId } from '../../../services/clerk/clerk-id';
import { z } from 'zod';

export const schemaRelationshipFields = z.object({
  subscriptionUserId: schemaDatabaseObject.shape.id.nullable(),
  familyId: schemaDatabaseObject.shape.id.nullable().optional(),
});

const schemaAuthFields = z.object({
  clerkId: schemaClerkId,
});

export const schema = z.object({
  ...schemaDatabaseObject.shape,
  first: z.string().max(255).optional(),
  last: z.string().max(255).optional(),
  email: z.email(),
  name: z.string().optional(),
  plan: z.enum(['free', 'pro']).default('free'),
  isAdmin: z.boolean().default(false),
  planOverride: z.enum(['free', 'pro']).nullable().default(null),
  emailDigestEnabled: z.boolean().default(false),
  onboardingCompletedAt: z.date().nullable().default(null),
  ...schemaAuthFields.shape,
  ...schemaRelationshipFields.shape,
});

export const schemaCreate = schema.pick({
  clerkId: true,
  email: true,
  first: true,
  last: true,
  name: true,
  plan: true,
  emailDigestEnabled: true,
  onboardingCompletedAt: true,
  subscriptionUserId: true,
  familyId: true,
});

export const schemaUpdate = schemaCreate.omit({ clerkId: true }).partial();
