import { type ObjectId } from 'mongodb';
import type { Db } from 'mongodb';
import type { z, ZodObject, ZodRawShape } from 'zod';

export interface LogActivityConfig<TDb> {
  getMetadata?: (doc: TDb) => Record<string, unknown>;
  getChanges?: (before: TDb, after: TDb) => { before: Partial<TDb>; after: Partial<TDb> };
}

export interface BaseFunctionArgs<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> {
  db: Db | null;
  config: { routerName: string; collectionName: string };
  schemas: {
    schema: T;
    schemaCreate: C;
    schemaUpdate: U;
    schemaDb: TDb;
    schemaDbCreate: CDb;
    schemaDbUpdate: UDb;
  };
  adapterFns: {
    adapterFnDbToFE: (doc: z.infer<TDb>) => z.infer<T>;
    adapterFnToDbPartial: (doc: Partial<z.infer<T>> | undefined) => Partial<z.infer<TDb>> | undefined;
    adapterFnToDbCreate: (docCreate: z.infer<C>) => z.infer<CDb>;
    adapterFnToDbUpdate: (docUpdate: z.infer<U>) => z.infer<UDb>;
  };
  userIdDb?: ObjectId | null;
}

export interface BaseFunctionArgsWithLogging<
  T extends ZodObject<ZodRawShape>,
  C extends ZodObject<ZodRawShape>,
  U extends ZodObject<ZodRawShape>,
  TDb extends ZodObject<ZodRawShape>,
  CDb extends ZodObject<ZodRawShape>,
  UDb extends ZodObject<ZodRawShape>,
> extends BaseFunctionArgs<T, C, U, TDb, CDb, UDb> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any;
  logConfig?: LogActivityConfig<z.infer<TDb>>;
  logConfigAll?: LogActivityConfig<z.infer<TDb>>;
}

export type TDoc<T extends ZodObject<ZodRawShape>> = z.infer<T>;
export type TDocCreate<C extends ZodObject<ZodRawShape>> = z.infer<C>;
export type TDocDbCreate<CDb extends ZodObject<ZodRawShape>> = z.infer<CDb>;
export type TDocDbUpdate<UDb extends ZodObject<ZodRawShape>> = z.infer<UDb>;
