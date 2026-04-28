import { schemaDatabaseObjectApi } from '../../_partial';
import { schemaTimestampsApi } from '../../../external/_partial/id';
import { schema, schemaCreate, schemaUpdate } from '../client/schema';
import { z } from 'zod';

export const schemaApi = schema.omit({ id: true }).extend({
  _id: schemaDatabaseObjectApi.shape._id,
  createdAt: schemaTimestampsApi.shape.createdAt,
  updatedAt: schemaTimestampsApi.shape.updatedAt,
  onboardingCompletedAt: z.string().nullable(),
});

export const schemaApiCreate = schemaCreate.omit({});

export const schemaApiUpdate = schemaUpdate.partial();
