import { type TypeConfigClient } from '../_lib/types';
import { schema, schemaCreate, schemaRelationshipFields, schemaUpdate } from './client/schema';
import { ReceiptIcon } from 'lucide-react';

export * from './client/constants';
export * from './client/schema';
export * from './client/types';
export * from './api/types';
export * from './api/schema';
export * from './api/adapterFns';

export const TYPE = {
  router: 'subscriptionCompany',
  collection: 'SubscriptionCompany',
  path: 'subscription-companies',
  pathInternal: '/subscription-companies',
  icon: ReceiptIcon,
  display: {
    singular: 'Company Subscription',
    plural: 'Company Subscriptions',
  },
  dataTestId: 'subscription-company',
} as const satisfies TypeConfigClient;

export const SCHEMA = schema;
export const SCHEMA_CREATE = schemaCreate;
export const SCHEMA_UPDATE = schemaUpdate;
export const SCHEMA_RELATIONSHIPS = schemaRelationshipFields;
