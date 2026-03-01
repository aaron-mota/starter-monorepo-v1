import { ensureDbConnection } from './db-connection';
import { TRPCError } from '@trpc/server';
import type { z, ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgs } from './types';

export const getAllFn = async function getAllFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({ db: dbArg, config, adapterFns }: BaseFunctionArgs<T, C, U, TDb, CDb, UDb>): Promise<z.infer<T>[]> {
  const db = await ensureDbConnection(dbArg);
  const { routerName, collectionName } = config;
  const { adapterFnDbToFE } = adapterFns;

  const docsDb = await db.collection(collectionName).find({}).sort({ _id: -1 }).toArray();
  if (!docsDb) {
    throw new TRPCError({ code: 'NOT_FOUND', message: `No ${routerName} found` });
  }

  return docsDb.map(adapterFnDbToFE);
};
