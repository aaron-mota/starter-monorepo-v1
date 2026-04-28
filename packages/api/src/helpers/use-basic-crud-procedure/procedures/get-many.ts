import { apiClient } from '../../../api-client';
import { buildParentRoute, buildQueryKey } from '../../build-parent-routes';
import { getDataDefault } from '../../get-data';
import { useQuery } from '@tanstack/react-query';
import { type z } from 'zod';
import type { QueryFunction } from '@tanstack/react-query';
import type { ConfigBasicCrudProcedure, OptionsUseQuery, QueryConfig, Resource } from '../../../types';

export type ParamsGetMany<TQueryParams> = {
  queryParams?: TQueryParams;
  parentResources?: Resource[];
};

export function getMany<TDoc, TDocApi, TQuery extends QueryConfig>(
  params: ParamsGetMany<TQuery> & {
    resource: string;
    adapterFnApiToFE?: (data: TDocApi) => TDoc;
    schema?: z.ZodType<TDoc>;
    baseUrl?: string;
    limitParamKey?: string;
    config?: ConfigBasicCrudProcedure;
    queryKeyBase?: string;
    queryOverrides?: QueryConfig<TQuery['response'], TDocApi[]>;
  }
) {
  const { parentResources, resource, adapterFnApiToFE, schema, baseUrl, config, queryKeyBase, queryOverrides } = params;
  const { getData } = queryOverrides || {};

  const allResources: Resource[] = [...(parentResources || []), resource];
  const route = buildParentRoute(allResources);
  const url = `${baseUrl}/${route}`;

  const queryParams = params.queryParams as unknown as Record<string, unknown>;
  const { queryKey, queryParamsFinal } = buildQueryKey(allResources, queryParams, baseUrl, queryKeyBase);

  const queryFn: QueryFunction<TDoc[]> = async () => {
    const res = await apiClient.get<TDocApi[]>(url, {
      ...config?.fetchOptions,
      params: queryParamsFinal,
    });

    if (res.status === 200) {
      const rawDataArray = getData
        ? getData(res.data as unknown as TQuery['response'])
        : (getDataDefault(res.data) as TDocApi[]);

      if (adapterFnApiToFE && schema) {
        const mappedDataArray = rawDataArray.map(adapterFnApiToFE);
        try {
          return mappedDataArray.map(schema.parse as (data: unknown) => TDoc);
        } catch (error) {
          console.error('Error parsing fetched data:', error);
          throw new Error(`Error parsing data (${resource}, getMany)`);
        }
      }
      return getDataDefault(res.data) as unknown as TDoc[];
    }
    throw new Error(`Error fetching data (${resource}) (getMany)`);
  };

  return {
    useQuery: (options?: OptionsUseQuery<TDoc[]>) => {
      return useQuery<TDoc[], Error>({ queryKey, queryFn, ...options });
    },
  };
}
