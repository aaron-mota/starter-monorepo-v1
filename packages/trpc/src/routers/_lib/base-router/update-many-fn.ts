import { adapterFnIdFEToDbServer } from '../helpers';
import { ensureDbConnection } from './db-connection';
import { TRPCError } from '@trpc/server';
import type { z, ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgs, TDocDbUpdate } from './types';

interface UpdateManyArgs<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> extends BaseFunctionArgs<T, C, U, TDb, CDb, UDb> {
  input: {
    ids: string[];
    data: Partial<z.infer<U>>;
  };
}

export const updateManyFn = async function updateManyFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({ db: dbArg, config, adapterFns, input }: UpdateManyArgs<T, C, U, TDb, CDb, UDb>): Promise<number> {
  const db = await ensureDbConnection(dbArg);
  const { routerName, collectionName } = config;
  const { adapterFnToDbUpdate } = adapterFns;

  if (!input) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Input is required',
    });
  }

  const objectIds = input.ids.map(adapterFnIdFEToDbServer);
  const payloadDb: TDocDbUpdate<UDb> = adapterFnToDbUpdate(input.data as z.infer<U>);

  const result = await db.collection(collectionName).updateMany(
    { _id: { $in: objectIds } },
    {
      $set: {
        ...payloadDb,
        updatedAt: new Date(),
      },
    }
  );

  if (!result.modifiedCount) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No ${routerName} found or unable to be updated`,
    });
  }

  return result.modifiedCount;
};
