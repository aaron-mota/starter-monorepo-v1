import type { z } from 'zod';
import type { schemaApi, schemaApiCreate, schemaApiUpdate } from './schema';

export type TDocApi = z.infer<typeof schemaApi>;
export type TDocApiCreate = z.infer<typeof schemaApiCreate>;
export type TDocApiUpdate = z.infer<typeof schemaApiUpdate>;
