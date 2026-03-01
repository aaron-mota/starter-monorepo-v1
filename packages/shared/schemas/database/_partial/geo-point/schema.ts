import { z } from 'zod';

export const schemaGeoPoint = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]),
});

export type GeoPoint = z.infer<typeof schemaGeoPoint>;

export const schemaGeoPointForm = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z.tuple([z.string(), z.string()]).default(['0', '0']),
});
