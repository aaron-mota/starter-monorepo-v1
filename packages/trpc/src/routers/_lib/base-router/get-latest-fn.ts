import { ensureDbConnection } from './db-connection';
import { TRPCError } from '@trpc/server';
import type { z, ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgs } from './types';

export const getLatestFn = async function getLatestFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({ db: dbArg, config, adapterFns }: BaseFunctionArgs<T, C, U, TDb, CDb, UDb>): Promise<z.infer<T>> {
  const db = await ensureDbConnection(dbArg);
  const { routerName, collectionName } = config;
  const { adapterFnDbToFE } = adapterFns;

  const docDb = await db.collection(collectionName).findOne({}, { sort: { createdAt: -1 } });
  if (!docDb) {
    throw new TRPCError({ code: 'NOT_FOUND', message: `${routerName} not found` });
  }

  return adapterFnDbToFE(docDb);
};
