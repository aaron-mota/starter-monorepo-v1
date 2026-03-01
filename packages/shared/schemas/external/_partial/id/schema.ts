import { z } from 'zod';

export const schemaObjectId = z
  .string()
  .min(12, { message: 'Must not be empty' })
  .refine((value) => /^[0-9a-fA-F]{24}$/.test(value), {
    message: 'Invalid Object ID',
  })
  .default('');

export const schemaIdStr = z.string();

export const schemaIdNum = z.number();

export const schemaTimestamps = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const schemaTimestampsApi = z.object({
  createdAt: z.string(),
  updatedAt: z.string(),
});
