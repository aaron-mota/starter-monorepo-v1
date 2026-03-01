import { schemaTimestampsApi } from '../../../external/_partial/id';
import { z } from 'zod';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const schemaObjectId = z
  .string()
  .min(12, { message: 'Must not be empty' })
  .refine((value) => objectIdPattern.test(value), {
    message: 'Invalid Object ID',
  });

export const schemaTimestamps = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const schemaDatabaseObject = z.object({
  id: schemaObjectId,
  ...schemaTimestamps.shape,
});

export const schemaDatabaseObjectApi = z.object({
  _id: schemaObjectId,
  ...schemaTimestampsApi.shape,
});

export const schemaObjectIdForm = z.string().default('');
