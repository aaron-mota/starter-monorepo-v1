import { ensureDbConnection } from './db-connection';
import type { ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgs } from './types';

interface DeleteMongoArgs<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> extends BaseFunctionArgs<T, C, U, TDb, CDb, UDb> {
  input: { where: Record<string, unknown> };
}

export const deleteMongoFn = async function deleteMongoFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({ db: dbArg, config, input }: DeleteMongoArgs<T, C, U, TDb, CDb, UDb>): Promise<number> {
  const db = await ensureDbConnection(dbArg);
  const { collectionName } = config;
  const { where } = input;

  const result = await db.collection(collectionName).deleteMany(where);
  return result.deletedCount;
};
