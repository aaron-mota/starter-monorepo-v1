import { adapterFnIdDbToFEServer } from '../helpers';
import { ensureDbConnection } from './db-connection';
import { TRPCError } from '@trpc/server';
import type { z, ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgsWithLogging, TDoc } from './types';

interface CreateArgs<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> extends BaseFunctionArgsWithLogging<T, C, U, TDb, CDb, UDb> {
  input: z.infer<C>;
}

export const createFn = async function createFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({ db: dbArg, config, adapterFns, input }: CreateArgs<T, C, U, TDb, CDb, UDb>): Promise<TDoc<T>> {
  const db = await ensureDbConnection(dbArg);
  const { routerName, collectionName } = config;
  const { adapterFnToDbCreate } = adapterFns;

  const now = new Date();
  const docToInsert = {
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  const docToInsertDb = adapterFnToDbCreate(docToInsert);

  const result = await db.collection(collectionName).insertOne(docToInsertDb);

  if (!result.insertedId) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to create ${routerName}`,
    });
  }

  const doc = {
    id: adapterFnIdDbToFEServer(result.insertedId),
    ...docToInsert,
  } as unknown as TDoc<T>;

  return doc;
};
