import { ensureDbConnection } from './db-connection';
import { TRPCError } from '@trpc/server';
import type { z, ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgs, TDocCreate, TDocDbCreate } from './types';

interface CreateManyArgs<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> extends BaseFunctionArgs<T, C, U, TDb, CDb, UDb> {
  input: z.infer<C>[];
}

export const createManyFn = async function createManyFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({ db: dbArg, config, adapterFns, input }: CreateManyArgs<T, C, U, TDb, CDb, UDb>): Promise<number> {
  const db = await ensureDbConnection(dbArg);
  const { routerName, collectionName } = config;
  const { adapterFnToDbCreate } = adapterFns;

  const now = new Date();
  const docsToInsertDb: TDocDbCreate<CDb>[] = input.map((doc) => {
    const docCreate: TDocCreate<C> = {
      ...doc,
      createdAt: now,
      updatedAt: now,
    };
    return adapterFnToDbCreate(docCreate);
  });

  const result = await db.collection(collectionName).insertMany(docsToInsertDb);

  if (!result.insertedCount) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to create ${routerName}`,
    });
  }

  return result.insertedCount;
};
