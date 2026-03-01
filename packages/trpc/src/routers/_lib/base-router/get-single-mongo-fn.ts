import { ensureDbConnection } from './db-connection';
import { TRPCError } from '@trpc/server';
import type { z, ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgs } from './types';

interface GetSingleMongoArgs<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> extends BaseFunctionArgs<T, C, U, TDb, CDb, UDb> {
  input: { where: Record<string, unknown> };
}

export const getSingleMongoFn = async function getSingleMongoFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({ db: dbArg, config, adapterFns, input }: GetSingleMongoArgs<T, C, U, TDb, CDb, UDb>): Promise<z.infer<T>> {
  const db = await ensureDbConnection(dbArg);
  const { routerName, collectionName } = config;
  const { adapterFnDbToFE } = adapterFns;
  const { where } = input;

  const docDb = await db.collection(collectionName).findOne(where);

  if (!docDb) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `${routerName} not found`,
    });
  }

  return adapterFnDbToFE(docDb);
};
