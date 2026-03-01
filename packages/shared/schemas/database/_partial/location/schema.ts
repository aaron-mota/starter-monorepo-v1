import { z } from 'zod';

const schemaLocationLocation = z.object({
  type: z.string(),
  coordinates: z.array(z.number()),
});

const schemaLocationLocationForm = z.object({
  type: z.string(),
  coordinates: z.array(z.string()),
});

export const schemaLocation = z.object({
  lat: z.number().nullable().optional(),
  long: z.number().nullable().optional(),
  location: schemaLocationLocation.nullable().optional(),
});

export const schemaLocationForm = z.object({
  lat: z.string().nullable().optional().default(null),
  long: z.string().nullable().optional().default(null),
  location: schemaLocationLocationForm.nullable().optional().default(null),
});
