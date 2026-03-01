import { type TypeConfigClient } from '../_lib/types';
import { schema, schemaCreate, schemaRelationshipFields, schemaUpdate } from './client/schema';
import { Users2 } from 'lucide-react';

export * from './client/constants';
export * from './client/schema';
export * from './client/types';
export * from './api/types';
export * from './api/schema';
export * from './api/adapterFns';

export const TYPE = {
  router: 'user',
  collection: 'User',
  path: 'users',
  pathInternal: '/users',
  icon: Users2,
  display: {
    singular: 'User',
    plural: 'Users',
  },
  dataTestId: 'user',
} as const satisfies TypeConfigClient;

export const SCHEMA = schema;
export const SCHEMA_CREATE = schemaCreate;
export const SCHEMA_UPDATE = schemaUpdate;
export const SCHEMA_RELATIONSHIPS = schemaRelationshipFields;
