import 'server-only';

import type { z } from 'zod';
import type { schemaDb, schemaDbCreate, schemaDbUpdate } from './schema';

export type TDocDb = z.infer<typeof schemaDb>;
export type TDocDbCreate = z.infer<typeof schemaDbCreate>;
export type TDocDbUpdate = z.infer<typeof schemaDbUpdate>;
