import { ensureDbConnection } from './db-connection';
import { TRPCError } from '@trpc/server';
import { type ObjectId } from 'mongodb';
import type { z, ZodObject, ZodRawShape } from 'zod';
import type { BaseFunctionArgs } from './types';

interface GetManyOptionsArgs<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> extends BaseFunctionArgs<T, C, U, TDb, CDb, UDb> {
  input?: Partial<z.infer<T>>;
}

export const getManyOptionsFn = async function getManyOptionsFn<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
>({
  db: dbArg,
  config,
  adapterFns,
  input,
}: GetManyOptionsArgs<T, C, U, TDb, CDb, UDb>): Promise<
  Array<{
    id: string;
    name: string;
    type: string;
    label: string;
    value: string;
  }>
> {
  const db = await ensureDbConnection(dbArg);
  const { routerName, collectionName } = config;
  const { adapterFnToDbPartial } = adapterFns;

  const inputDb = adapterFnToDbPartial(input);

  const docsDb = (await db
    .collection(collectionName)
    .find(inputDb || {})
    .sort({ _id: -1 })
    .project({ name: 1 })
    .toArray()) as { _id: ObjectId; name: string }[];

  if (!docsDb) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No ${routerName} found`,
    });
  }

  return docsDb.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    type: collectionName,
    label: doc.name,
    value: doc.name,
  }));
};
