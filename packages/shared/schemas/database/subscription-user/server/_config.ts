import 'server-only';

import { TYPE as TYPE_BASE } from '../_config';
import { type TypeConfigServer } from '../../_lib/types-server';
import { schemaDb, schemaDbCreate, schemaDbUpdate, schemaRelationshipFields } from './schema';

export * from './adapterFns';
export * from './schema';
export * from './types';

export const TYPE = {
  ...TYPE_BASE,
} as const satisfies TypeConfigServer;

export const SCHEMA = schemaDb;
export const SCHEMA_CREATE = schemaDbCreate;
export const SCHEMA_UPDATE = schemaDbUpdate;
export const SCHEMA_RELATIONSHIPS = schemaRelationshipFields;
