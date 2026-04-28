import { adapterFnIdFEToDbServer } from '../helpers';
import { ensureDbConnection } from './db-connection';
import { TRPCError } from '@trpc/server';
import type { z, ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgs } from './types';

interface GetSingleByIdArgs<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> extends BaseFunctionArgs<T, C, U, TDb, CDb, UDb> {
  input: { id: string };
}

export const getSingleByIdFn = async function getSingleByIdFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({ db: dbArg, config, adapterFns, input }: GetSingleByIdArgs<T, C, U, TDb, CDb, UDb>): Promise<z.infer<T>> {
  const db = await ensureDbConnection(dbArg);
  const { routerName, collectionName } = config;
  const { adapterFnDbToFE } = adapterFns;
  const { id } = input;

  const docDb = await db.collection(collectionName).findOne({ _id: adapterFnIdFEToDbServer(id) });
  if (!docDb) {
    throw new TRPCError({ code: 'NOT_FOUND', message: `${routerName} not found` });
  }

  return adapterFnDbToFE(docDb as z.infer<TDb>);
};
