import { schemaDatabaseObject } from '../../_partial';
import { z } from 'zod';

export const schemaRelationshipFields = z.object({
  ownerId: schemaDatabaseObject.shape.id,
});

export const schema = z.object({
  ...schemaDatabaseObject.shape,
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['active', 'archived']).default('active'),
  ...schemaRelationshipFields.shape,
});

export const schemaCreate = schema.pick({
  name: true,
  description: true,
  status: true,
  ownerId: true,
});

export const schemaUpdate = schemaCreate.extend({}).partial();
