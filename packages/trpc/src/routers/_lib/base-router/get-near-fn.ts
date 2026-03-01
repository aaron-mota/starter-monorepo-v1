import { ensureDbConnection } from './db-connection';
import { TRPCError } from '@trpc/server';
import type { z, ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgs } from './types';

interface GetNearArgs<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> extends BaseFunctionArgs<T, C, U, TDb, CDb, UDb> {
  input: {
    lat: number;
    lng: number;
    maxDistanceMeters?: number;
    locationField?: string;
  };
}

export const getNearFn = async function getNearFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({ db: dbArg, config, adapterFns, input }: GetNearArgs<T, C, U, TDb, CDb, UDb>): Promise<z.infer<T>[]> {
  const db = await ensureDbConnection(dbArg);
  const { routerName, collectionName } = config;
  const { adapterFnDbToFE } = adapterFns;
  const { lat, lng, maxDistanceMeters = 50000, locationField = 'location' } = input;

  const docsDb = await db
    .collection(collectionName)
    .find({
      [locationField]: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistanceMeters,
        },
      },
    })
    .toArray();

  if (!docsDb) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No ${routerName} found`,
    });
  }

  return docsDb.map(adapterFnDbToFE);
};
