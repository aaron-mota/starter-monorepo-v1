import { ensureDbConnection } from './db-connection';
import { TRPCError } from '@trpc/server';
import type { z, ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgs } from './types';

interface GetSingleWhereArgs<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> extends BaseFunctionArgs<T, C, U, TDb, CDb, UDb> {
  input: Partial<z.infer<T>>;
}

export const getSingleWhereFn = async function getSingleWhereFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({ db: dbArg, config, adapterFns, input }: GetSingleWhereArgs<T, C, U, TDb, CDb, UDb>): Promise<z.infer<T>> {
  const db = await ensureDbConnection(dbArg);
  const { routerName, collectionName } = config;
  const { adapterFnDbToFE, adapterFnToDbPartial } = adapterFns;

  const inputDb = adapterFnToDbPartial(input || {});
  if (!inputDb) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Input is required' });
  }

  const docDb = await db.collection(collectionName).findOne(inputDb);
  if (!docDb) {
    throw new TRPCError({ code: 'NOT_FOUND', message: `${routerName} not found` });
  }

  return adapterFnDbToFE(docDb as z.infer<TDb>);
};
