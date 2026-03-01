import { type TypeConfigClient } from '../_lib/types';
import { schema, schemaCreate, schemaRelationshipFields, schemaUpdate } from './client/schema';
import { UserCheckIcon } from 'lucide-react';

export * from './client/constants';
export * from './client/schema';
export * from './client/types';
export * from './api/types';
export * from './api/schema';
export * from './api/adapterFns';

export const TYPE = {
  router: 'companyUser',
  collection: 'CompanyUser',
  path: 'company-users',
  pathInternal: '/company-users',
  icon: UserCheckIcon,
  display: {
    singular: 'Company User',
    plural: 'Company Users',
  },
  dataTestId: 'company-user',
} as const satisfies TypeConfigClient;

export const SCHEMA = schema;
export const SCHEMA_CREATE = schemaCreate;
export const SCHEMA_UPDATE = schemaUpdate;
export const SCHEMA_RELATIONSHIPS = schemaRelationshipFields;
