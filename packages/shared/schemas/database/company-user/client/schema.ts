import { schemaDatabaseObject } from '../../_partial';
import { z } from 'zod';

export const schemaRelationshipFields = z.object({
  userId: schemaDatabaseObject.shape.id,
  companyId: schemaDatabaseObject.shape.id,
});

export const schema = z.object({
  ...schemaDatabaseObject.shape,
  role: z.enum(['owner', 'admin', 'member']).default('member'),
  ...schemaRelationshipFields.shape,
});

export const schemaCreate = schema.pick({ userId: true, companyId: true, role: true });

export const schemaUpdate = z.object({ role: z.enum(['owner', 'admin', 'member']).optional() }).partial();
