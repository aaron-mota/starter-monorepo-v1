import { schemaDatabaseObject } from '../../_partial';
import { z } from 'zod';

export const schemaRelationshipFields = z.object({
  userId: schemaDatabaseObject.shape.id,
});

export const schema = z.object({
  ...schemaDatabaseObject.shape,
  value: z.string(),
  ...schemaRelationshipFields.shape,
});

export const schemaCreate = schema.pick({
  value: true,
  userId: true,
});

export const schemaUpdate = schemaCreate.extend({}).partial();
