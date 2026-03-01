import type { z } from 'zod';
import type { schema, schemaCreate, schemaUpdate } from './schema';

export type TDoc = z.infer<typeof schema>;
export type TDocCreate = z.infer<typeof schemaCreate>;
export type TDocUpdate = z.infer<typeof schemaUpdate>;
