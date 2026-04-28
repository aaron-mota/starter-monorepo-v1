/**
 * TEMPLATE — Per-entity component config + type re-exports.
 *
 * To use: duplicate the parent `_template/` folder to `<entity-name>/` and replace the
 * placeholder block below with re-exports from your entity's schema config:
 *
 *   import { TYPE } from '@app/shared/schemas/database/<entity-name>';
 *   export { TYPE };
 *   export type { TDoc, TDocCreate, TDocUpdate } from '@app/shared/schemas/database/<entity-name>';
 *
 * The placeholder types below let this template type-check in isolation.
 */

export const TYPE = {
  router: 'resource',
  collection: 'Resource',
  path: 'resources',
  display: { singular: 'Resource', plural: 'Resources' },
} as const;

export type TDoc = { id: string; createdAt: Date; updatedAt: Date };
export type TDocCreate = Omit<TDoc, 'id' | 'createdAt' | 'updatedAt'>;
export type TDocUpdate = Partial<TDocCreate>;
