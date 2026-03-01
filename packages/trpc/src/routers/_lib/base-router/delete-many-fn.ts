import { adapterFnIdFEToDbServer } from '../helpers';
import { ensureDbConnection } from './db-connection';
import { TRPCError } from '@trpc/server';
import type { ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgs } from './types';

interface DeleteManyArgs<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> extends BaseFunctionArgs<T, C, U, TDb, CDb, UDb> {
  input: { ids: string[] };
}

export const deleteManyFn = async function deleteManyFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({ db: dbArg, config, input }: DeleteManyArgs<T, C, U, TDb, CDb, UDb>): Promise<number> {
  const db = await ensureDbConnection(dbArg);
  const { routerName, collectionName } = config;
  const { ids } = input;

  const objectIds = ids.map(adapterFnIdFEToDbServer);

  const result = await db.collection(collectionName).deleteMany({
    _id: { $in: objectIds },
  });

  if (!result.deletedCount) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No ${routerName} found or unable to be deleted`,
    });
  }

  return result.deletedCount;
};
