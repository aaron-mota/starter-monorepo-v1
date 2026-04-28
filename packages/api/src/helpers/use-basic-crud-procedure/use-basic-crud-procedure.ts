import { URL_API } from '../../constants';
import { create } from './procedures/create';
import { createMany } from './procedures/create-many';
import { del } from './procedures/delete';
import { deleteMany } from './procedures/delete-many';
import { getMany } from './procedures/get-many';
import { getSingle } from './procedures/get-single';
import { getSingleWhere } from './procedures/get-single-where';
import { update } from './procedures/update';
import { updateMany } from './procedures/update-many';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { z } from 'zod';
import type {
  ConfigBasicCrudProcedure,
  Id,
  OptionsUseQuery,
  QueriesConfig,
  QueryConfig,
  QueryParams,
} from '../../types';
import type { ParamsGetMany } from './procedures/get-many';
import type { ParamsGetSingle } from './procedures/get-single';
import type { ParamsGetSingleWhere } from './procedures/get-single-where';

interface Args<
  TDoc,
  TDocApi,
  TDocCreate,
  TDocApiCreate,
  TDocUpdate,
  TDocApiUpdate,
  TDeleteReturn = TDoc,
  TQueryGetMany = QueryConfig<TDocApi[], TDocApi[]>,
  TQueryGetSingle = QueryConfig<TDocApi, TDocApi>,
> {
  resource: string;
  schema: z.ZodType<TDoc>;
  adapterFnApiToFE: (data: TDocApi) => TDoc;
  adapterFnFEToApiCreate?: (data: TDocCreate) => TDocApiCreate;
  adapterFnFEToApiUpdate?: (data: TDocUpdate) => TDocApiUpdate;
  queryKeyBase?: string;
  limitParamKey?: string;
  baseUrl?: string;
  config?: ConfigBasicCrudProcedure;
  queries?: QueriesConfig<TDoc, TDocApi, TDocCreate, TDocApiCreate, TDocUpdate, TDocApiUpdate, TDeleteReturn>;
}

export function useBasicCRUDProcedure<
  TDoc,
  TDocApi,
  TDocCreate,
  TDocApiCreate,
  TDocUpdate,
  TDocApiUpdate,
  TDeleteReturn = TDoc,
  TQueryGetMany = QueryConfig<TDocApi[], TDocApi[]>,
  TQueryGetSingle = QueryConfig<TDocApi, TDocApi>,
>({
  resource,
  schema,
  adapterFnApiToFE,
  adapterFnFEToApiCreate,
  adapterFnFEToApiUpdate,
  queryKeyBase,
  limitParamKey = 'limit',
  baseUrl = URL_API,
  config,
  queries,
}: Args<
  TDoc,
  TDocApi,
  TDocCreate,
  TDocApiCreate,
  TDocUpdate,
  TDocApiUpdate,
  TDeleteReturn,
  TQueryGetMany,
  TQueryGetSingle
>) {
  return {
    getSingle: {
      useQuery: (
        // @ts-expect-error dynamic typing
        params: ParamsGetSingle<TQueryGetSingle['queryParams']>,
        options?: OptionsUseQuery<TDoc>
      ) => {
        // @ts-expect-error dynamic typing
        return getSingle<TDoc, TDocApi, TQueryGetSingle>({
          ...params,
          resource,
          adapterFnApiToFE,
          schema,
          baseUrl,
          queryKeyBase,
          config,
          queryOverrides: queries?.getSingle,
        }).useQuery(options);
      },
    },
    getSingleWhere: {
      useQuery: (
        // @ts-expect-error dynamic typing
        params: ParamsGetSingleWhere<TQueryGetSingle['queryParams']>,
        options?: OptionsUseQuery<TDoc>
      ) => {
        // @ts-expect-error dynamic typing
        return getSingleWhere<TDoc, TDocApi, TQueryGetSingle>({
          ...params,
          resource,
          adapterFnApiToFE,
          schema,
          baseUrl,
          limitParamKey,
          config,
          queryKeyBase,
          queryOverrides: queries?.getSingleWhere,
        }).useQuery(options);
      },
    },
    getMany: {
      useQuery: (
        // @ts-expect-error dynamic typing
        params: ParamsGetMany<TQueryGetMany['queryParams']>,
        options?: OptionsUseQuery<TDoc[]>
      ) => {
        // @ts-expect-error dynamic typing
        return getMany<TDoc, TDocApi, TQueryGetMany>({
          ...params,
          resource,
          adapterFnApiToFE,
          schema,
          baseUrl,
          config,
          limitParamKey,
          queryKeyBase,
          queryOverrides: queries?.getMany,
        }).useQuery(options);
      },
    },
    create: {
      useMutation: (options?: UseMutationOptions<TDoc, Error, TDocCreate, unknown>) =>
        create<TDoc, TDocApi, TDocCreate, TDocApiCreate, QueryConfig>({
          resource,
          schema,
          baseUrl,
          adapterFnApiToFE,
          adapterFnFEToApiCreate,
          queryOverrides: queries?.create as QueryConfig | undefined,
        }).useMutation(options),
    },
    createMany: {
      useMutation: (options?: UseMutationOptions<TDoc[], Error, TDocCreate[], unknown>) =>
        createMany<TDoc, TDocApi, TDocCreate, TDocApiCreate, QueryConfig>({
          resource,
          schema,
          baseUrl,
          adapterFnApiToFE,
          adapterFnFEToApiCreate,
          queryOverrides: queries?.createMany as QueryConfig | undefined,
        }).useMutation(options),
    },
    update: {
      useMutation: (options?: UseMutationOptions<TDoc, Error, { id: Id; payload: TDocUpdate }, unknown>) =>
        update<TDoc, TDocApi, TDocUpdate, TDocApiUpdate>({
          resource,
          schema,
          baseUrl,
          adapterFnApiToFE,
          adapterFnFEToApiUpdate,
        }).useMutation(options),
    },
    updateMany: {
      useMutation: (options?: UseMutationOptions<TDoc[], Error, { id: Id; payload: TDocUpdate }[], unknown>) =>
        updateMany<TDoc, TDocApi, TDocUpdate, TDocApiUpdate>({
          resource,
          schema,
          baseUrl,
          adapterFnApiToFE,
          adapterFnFEToApiUpdate,
        }).useMutation(options),
    },
    delete: {
      useMutation: (options?: UseMutationOptions<TDeleteReturn, Error, { id: Id }, unknown>) =>
        del<TDeleteReturn>({
          resource,
          baseUrl,
        }).useMutation(options),
    },
    deleteMany: {
      useMutation: (options?: UseMutationOptions<TDeleteReturn[], Error, { id: Id }[], unknown>) =>
        deleteMany<TDeleteReturn>({
          resource,
          baseUrl,
        }).useMutation(options),
    },
  };
}
