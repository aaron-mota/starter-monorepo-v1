import 'server-only';

import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const schemaTimestampsDb = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const schemaDatabaseObjectDb = z.object({
  _id: z.instanceof(ObjectId),
  ...schemaTimestampsDb.shape,
});
