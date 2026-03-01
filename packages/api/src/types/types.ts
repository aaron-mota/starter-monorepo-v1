import type { QueryKey, UseInfiniteQueryOptions, UseQueryOptions } from '@tanstack/react-query';
import type { z } from 'zod';

export type Resource = string | [string, Id];
export type Id = string | number | null | undefined;
export type DeletedReturn = { id: Id };

export type QueryParams<T = Record<string, unknown>> = Partial<T>;

export type OptionsUseQuery<TDoc> = Omit<UseQueryOptions<TDoc, Error, TDoc, QueryKey>, 'queryKey' | 'queryFn'>;
export type OptionsUseQueryInfinite<TDoc> = Omit<
  UseInfiniteQueryOptions<TDoc, Error, TDoc, QueryKey>,
  'queryKey' | 'queryFn'
>;

export interface ApiV2Response {
  status: number;
  data?: unknown | unknown[];
}

export interface ConfigBasicCrudProcedure {
  apiKey?: string;
  routes?: {
    generateToken?: string;
  };
  fetchOptions?: {
    headers?: Record<string, string>;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface QueryConfig<TResponse = any, TData = any> {
  queryParams?: z.ZodSchema;
  response: z.ZodSchema;
  getData: (response: TResponse) => TData;
  body?: z.ZodSchema;
}

export interface QueriesConfig<
  TDoc,
  TDocApi,
  TDocCreate,
  TDocApiCreate,
  TDocUpdate,
  TDocApiUpdate,
  TDeleteReturn = TDoc,
> {
  getMany?: QueryConfig<TDocApi[], TDocApi[]>;
  getSingle?: QueryConfig<TDocApi, TDocApi>;
  getSingleWhere?: QueryConfig<TDocApi, TDocApi>;
  create?: QueryConfig<TDocApi, TDocApi>;
  update?: QueryConfig<TDocApi, TDocApi>;
  delete?: QueryConfig<unknown, TDeleteReturn>;
  createMany?: QueryConfig<TDocApi[], TDocApi[]>;
  updateMany?: QueryConfig<TDocApi[], TDocApi[]>;
  deleteMany?: QueryConfig<TDocApi[], TDocApi[]>;
}
