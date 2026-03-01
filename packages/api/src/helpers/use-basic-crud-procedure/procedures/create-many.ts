import { apiClient } from '../../../api-client';
import { buildParentRoute } from '../../build-parent-routes';
import { getDataDefault } from '../../get-data';
import { useMutation } from '@tanstack/react-query';
import { type z } from 'zod';
import type { MutationFunction, UseMutationOptions } from '@tanstack/react-query';
import type { QueryConfig, Resource } from '../../../types';

interface CreateManyParams<TDoc, TDocApi, TDocCreate, TDocApiCreate, TQuery extends QueryConfig> {
  resource: string;
  parentResources?: Resource[];
  schema?: z.ZodType<TDoc, z.ZodTypeDef, unknown>;
  baseUrl: string;
  adapterFnApiToFE?: (data: TDocApi) => TDoc;
  adapterFnFEToApiCreate?: (data: TDocCreate) => TDocApiCreate;
  queryOverrides?: QueryConfig<TQuery['response'], TDocApi[]>;
}

export function createMany<TDoc, TDocApi, TDocCreate, TDocApiCreate, TQuery extends QueryConfig>({
  resource,
  parentResources,
  schema,
  baseUrl,
  adapterFnApiToFE,
  adapterFnFEToApiCreate,
  queryOverrides,
}: CreateManyParams<TDoc, TDocApi, TDocCreate, TDocApiCreate, TQuery>) {
  const { getData } = queryOverrides || {};

  const mutationFn: MutationFunction<TDoc[], TDocCreate[]> = async (payload) => {
    const transformedPayload = adapterFnFEToApiCreate
      ? payload.map(adapterFnFEToApiCreate)
      : (payload as unknown as TDocApiCreate[]);

    const route = buildParentRoute([...(parentResources || []), resource]);
    const url = `${baseUrl}/${route}`;

    const res = await apiClient.post<TDocApi[], TDocApiCreate[]>(url, transformedPayload);

    if (res.status === 201 || res.status === 200) {
      const rawDataArray = getData
        ? getData(res.data as unknown as TQuery['response'])
        : (getDataDefault(res.data) as TDocApi[]);

      if (adapterFnApiToFE && schema) {
        return rawDataArray.map((item) => schema.parse(adapterFnApiToFE(item)));
      }
      return rawDataArray as unknown as TDoc[];
    }
    throw new Error(`Error creating resources: ${resource}`);
  };

  return {
    useMutation: (options?: UseMutationOptions<TDoc[], Error, TDocCreate[], unknown>) =>
      useMutation<TDoc[], Error, TDocCreate[]>({ mutationFn, ...options }),
  };
}
