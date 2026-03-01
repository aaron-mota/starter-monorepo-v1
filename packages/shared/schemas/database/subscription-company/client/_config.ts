import { TYPE as TYPE_BASE } from '../_config';
import { type TypeConfigClient } from '../../_lib/types';
import { schema, schemaCreate, schemaRelationshipFields, schemaUpdate } from './schema';

export * from './constants';
export * from './schema';
export * from './types';

export const TYPE = {
  ...TYPE_BASE,
} as const satisfies TypeConfigClient;

export const SCHEMA = schema;
export const SCHEMA_CREATE = schemaCreate;
export const SCHEMA_UPDATE = schemaUpdate;
export const SCHEMA_RELATIONSHIPS = schemaRelationshipFields;
