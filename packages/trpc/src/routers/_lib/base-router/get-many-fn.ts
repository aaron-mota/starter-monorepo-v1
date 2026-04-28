import { ensureDbConnection } from './db-connection';
import { TRPCError } from '@trpc/server';
import type { z, ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgs } from './types';

interface GetManyArgs<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> extends BaseFunctionArgs<T, C, U, TDb, CDb, UDb> {
  input?: Partial<z.infer<T>>;
}

export const getManyFn = async function getManyFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({ db: dbArg, config, adapterFns, input }: GetManyArgs<T, C, U, TDb, CDb, UDb>): Promise<z.infer<T>[]> {
  const db = await ensureDbConnection(dbArg);
  const { routerName, collectionName } = config;
  const { adapterFnDbToFE, adapterFnToDbPartial } = adapterFns;

  const inputDb = adapterFnToDbPartial(input);

  const docsDb = await db
    .collection(collectionName)
    .find(inputDb || {})
    .sort({ _id: -1 })
    .toArray();
  if (!docsDb) {
    throw new TRPCError({ code: 'NOT_FOUND', message: `No ${routerName} found` });
  }

  return docsDb.map((doc) => adapterFnDbToFE(doc as z.infer<TDb>));
};
