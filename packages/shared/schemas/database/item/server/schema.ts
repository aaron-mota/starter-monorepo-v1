import 'server-only';

import { schemaDatabaseObjectDb } from '../../_partial/database-object/server';
import { schema, schemaCreate, schemaUpdate } from '../client/schema';
import { z } from 'zod';

export const schemaRelationshipFields = z.object({
  ownerId: schemaDatabaseObjectDb.shape._id,
});

export const schemaDb = schema.omit({ id: true }).extend({
  _id: schemaDatabaseObjectDb.shape._id,
  createdAt: schemaDatabaseObjectDb.shape.createdAt,
  updatedAt: schemaDatabaseObjectDb.shape.updatedAt,
  ...schemaRelationshipFields.shape,
});

export const schemaDbCreate = schemaCreate.omit({}).extend({
  createdAt: schemaDatabaseObjectDb.shape.createdAt,
  updatedAt: schemaDatabaseObjectDb.shape.updatedAt,
  ...schemaRelationshipFields.shape,
});

export const schemaDbUpdate = schemaUpdate
  .omit({})
  .extend({
    updatedAt: schemaDatabaseObjectDb.shape.updatedAt,
    ...schemaRelationshipFields.shape,
  })
  .partial();
