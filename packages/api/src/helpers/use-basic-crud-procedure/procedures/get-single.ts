import { apiClient } from '../../../api-client';
import { buildParentRoute, buildQueryKey } from '../../build-parent-routes';
import { getDataDefault } from '../../get-data';
import { useQuery } from '@tanstack/react-query';
import { type z } from 'zod';
import type { QueryFunction } from '@tanstack/react-query';
import type { ConfigBasicCrudProcedure, Id, OptionsUseQuery, QueryConfig, Resource } from '../../../types';

export type ParamsGetSingle<TQueryParams> = {
  id: Id;
  queryParams?: TQueryParams;
  parentResources?: Resource[];
};

export function getSingle<TDoc, TDocApi, TQuery extends QueryConfig>(
  params: ParamsGetSingle<TQuery> & {
    resource: string;
    schema?: z.ZodType<TDoc, z.ZodTypeDef, unknown>;
    baseUrl?: string;
    adapterFnApiToFE?: (data: TDocApi) => TDoc;
    queryKeyBase?: string;
    config?: ConfigBasicCrudProcedure;
    queryOverrides?: QueryConfig<TQuery['response'], TDocApi>;
  }
) {
  const { parentResources, resource, id, adapterFnApiToFE, schema, baseUrl, queryKeyBase, config, queryOverrides } =
    params;
  const { getData } = queryOverrides || {};

  const allResources: Resource[] = [...(parentResources || []), [resource, id]];
  const route = buildParentRoute(allResources);
  const url = `${baseUrl}/${route}`;

  const queryParams = params.queryParams as unknown as Record<string, unknown>;
  const { queryKey, queryParamsFinal } = buildQueryKey(allResources, queryParams, baseUrl, queryKeyBase);

  const queryFn: QueryFunction<TDoc> = async () => {
    const res = await apiClient.get<TDocApi>(url, {
      ...config?.fetchOptions,
      params: queryParamsFinal,
    });

    if (res.status === 200) {
      const rawData = getData ? getData(res.data as TQuery['response']) : (getDataDefault(res.data) as TDocApi);

      if (adapterFnApiToFE && schema) {
        const mappedData = adapterFnApiToFE(rawData);
        try {
          return schema.parse(mappedData);
        } catch (error) {
          console.error('Error parsing fetched data:', error);
          throw new Error(`Error parsing data (${resource})`);
        }
      }
      return getDataDefault(res.data) as unknown as TDoc;
    }
    throw new Error(`Error fetching data (${resource}) (getSingle)`);
  };

  return {
    useQuery: (options?: OptionsUseQuery<TDoc>) => {
      return useQuery<TDoc, Error>({ queryKey, queryFn, ...options });
    },
  };
}
