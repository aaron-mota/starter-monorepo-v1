import { adapterFnIdFEToDbServer } from '../helpers';
import { ensureDbConnection } from './db-connection';
import { TRPCError } from '@trpc/server';
import type { z, ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgsWithLogging, TDocDbUpdate } from './types';

interface UpdateArgs<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> extends BaseFunctionArgsWithLogging<T, C, U, TDb, CDb, UDb> {
  input: { id: string } & Partial<z.infer<U>>;
}

export const updateFn = async function updateFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({ db: dbArg, config, adapterFns, input }: UpdateArgs<T, C, U, TDb, CDb, UDb>): Promise<z.infer<T>> {
  const db = await ensureDbConnection(dbArg);
  const { routerName, collectionName } = config;
  const { adapterFnDbToFE, adapterFnToDbUpdate } = adapterFns;

  const { id, ...updateData } = input;

  const payloadDb: TDocDbUpdate<UDb> = adapterFnToDbUpdate(updateData);

  const docDb = await db.collection(collectionName).findOneAndUpdate(
    { _id: adapterFnIdFEToDbServer(id) },
    {
      $set: {
        ...payloadDb,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  );

  if (!docDb) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `${routerName} not found or unable to be updated`,
    });
  }

  return adapterFnDbToFE(docDb);
};
