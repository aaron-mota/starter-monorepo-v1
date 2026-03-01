import { adapterFnIdFEToDbServer } from '../helpers';
import { ensureDbConnection } from './db-connection';
import { TRPCError } from '@trpc/server';
import type { ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgsWithLogging } from './types';

interface DeleteArgs<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> extends BaseFunctionArgsWithLogging<T, C, U, TDb, CDb, UDb> {
  input: { id: string };
}

export const deleteFn = async function deleteFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({ db: dbArg, config, input }: DeleteArgs<T, C, U, TDb, CDb, UDb>): Promise<{ id: string }> {
  const db = await ensureDbConnection(dbArg);
  const { routerName, collectionName } = config;
  const { id } = input;

  const result = await db.collection(collectionName).deleteOne({
    _id: adapterFnIdFEToDbServer(id),
  });

  if (!result.deletedCount) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `${routerName} not found or unable to be deleted`,
    });
  }

  return { id };
};
