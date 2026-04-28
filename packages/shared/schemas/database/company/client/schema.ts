import { schemaDatabaseObject } from '../../_partial';
import { z } from 'zod';

export const schemaRelationshipFields = z.object({});

export const schema = z.object({
  ...schemaDatabaseObject.shape,
  name: z.string().max(255),
  ...schemaRelationshipFields.shape,
});

export const schemaCreate = schema.pick({ name: true });

export const schemaUpdate = schemaCreate.partial();
