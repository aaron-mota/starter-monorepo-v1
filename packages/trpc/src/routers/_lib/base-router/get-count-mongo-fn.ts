import { ensureDbConnection } from './db-connection';
import type { ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgs } from './types';

interface GetCountMongoArgs<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> extends BaseFunctionArgs<T, C, U, TDb, CDb, UDb> {
  input: { where?: Record<string, unknown> };
}

export const getCountMongoFn = async function getCountMongoFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({ db: dbArg, config, input }: GetCountMongoArgs<T, C, U, TDb, CDb, UDb>): Promise<number> {
  const db = await ensureDbConnection(dbArg);
  const { collectionName } = config;
  const { where } = input;

  const count = await db.collection(collectionName).countDocuments(where || {});
  return count;
};
