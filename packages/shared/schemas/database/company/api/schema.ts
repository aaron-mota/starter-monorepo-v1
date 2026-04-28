import { schemaDatabaseObjectApi } from '../../_partial';
import { schemaTimestampsApi } from '../../../external/_partial/id';
import { schema, schemaCreate, schemaUpdate } from '../client/schema';

export const schemaApi = schema.omit({ id: true }).extend({
  _id: schemaDatabaseObjectApi.shape._id,
  createdAt: schemaTimestampsApi.shape.createdAt,
  updatedAt: schemaTimestampsApi.shape.updatedAt,
});

export const schemaApiCreate = schemaCreate.omit({});

export const schemaApiUpdate = schemaUpdate.partial();
