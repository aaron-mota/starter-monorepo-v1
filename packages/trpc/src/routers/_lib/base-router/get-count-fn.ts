import { ensureDbConnection } from './db-connection';
import type { z, ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgs } from './types';

interface GetCountArgs<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> extends BaseFunctionArgs<T, C, U, TDb, CDb, UDb> {
  input?: Partial<z.infer<T>>;
}

export const getCountFn = async function getCountFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({ db: dbArg, config, adapterFns, input }: GetCountArgs<T, C, U, TDb, CDb, UDb>): Promise<number> {
  const db = await ensureDbConnection(dbArg);
  const { collectionName } = config;
  const { adapterFnToDbPartial } = adapterFns;

  const inputDb = adapterFnToDbPartial(input || {});

  const count = await db.collection(collectionName).countDocuments(inputDb || {});
  return count;
};
