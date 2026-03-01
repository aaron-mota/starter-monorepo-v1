import { adapterFnIdFEToDbServer } from '../helpers';
import { ensureDbConnection } from './db-connection';
import { TRPCError } from '@trpc/server';
import type { z, ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgs } from './types';

interface GetManyMongoArgs<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> extends BaseFunctionArgs<T, C, U, TDb, CDb, UDb> {
  input?: {
    where?: Record<string, unknown>;
    limit?: number;
    skip?: number;
    sort?: Record<string, 1 | -1 | undefined>;
    projection?: Record<string, 0 | 1 | undefined>;
  };
}

export const getManyMongoFn = async function getManyMongoFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({ db: dbArg, config, adapterFns, input }: GetManyMongoArgs<T, C, U, TDb, CDb, UDb>): Promise<z.infer<T>[]> {
  const db = await ensureDbConnection(dbArg);
  const { routerName, collectionName } = config;
  const { adapterFnDbToFE } = adapterFns;

  const { where, limit = Infinity, skip = 0, sort = { _id: -1 }, projection = {} } = input ?? {};

  // Handle xId fields (convert string IDs to ObjectIds)
  if (where) {
    const xIdFields = Object.entries(where).filter(
      ([key, value]) =>
        (key.endsWith('Id') && (typeof value === 'string' || typeof value === 'object')) ||
        (key === '_id' && (typeof value === 'string' || typeof value === 'object'))
    );
    if (xIdFields.length > 0) {
      xIdFields.forEach(([key, value]) => {
        if (typeof value === 'string') {
          where[key] = adapterFnIdFEToDbServer(value);
        } else if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            where[key] = value.map((id: unknown) => (typeof id === 'string' ? adapterFnIdFEToDbServer(id) : id));
          } else {
            const convertedValue: Record<string, unknown> = {};
            for (const [operator, operatorValue] of Object.entries(value)) {
              if (Array.isArray(operatorValue)) {
                convertedValue[operator] = operatorValue.map((id: unknown) =>
                  typeof id === 'string' ? adapterFnIdFEToDbServer(id) : id
                );
              } else if (typeof operatorValue === 'string') {
                convertedValue[operator] = adapterFnIdFEToDbServer(operatorValue);
              } else {
                convertedValue[operator] = operatorValue;
              }
            }
            where[key] = convertedValue;
          }
        }
      });
    }
  }

  const query = db.collection(collectionName).find(where || {});

  if (limit) query.limit(limit);
  if (skip) query.skip(skip);
  if (sort) {
    const sortArray = Object.entries(sort) as [string, 1 | -1][];
    query.sort(sortArray);
  }
  if (projection && Object.keys(projection).length > 0) query.project(projection);

  const docsDb = await query.toArray();

  if (!docsDb) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No ${routerName} found`,
    });
  }

  return docsDb.map(adapterFnDbToFE);
};
