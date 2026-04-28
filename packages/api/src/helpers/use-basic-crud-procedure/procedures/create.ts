import { apiClient } from '../../../api-client';
import { buildParentRoute } from '../../build-parent-routes';
import { getDataDefault } from '../../get-data';
import { useMutation } from '@tanstack/react-query';
import { type z } from 'zod';
import type { MutationFunction, UseMutationOptions } from '@tanstack/react-query';
import type { QueryConfig, Resource } from '../../../types';

interface CreateParams<TDoc, TDocApi, TDocCreate, TDocApiCreate, TQuery extends QueryConfig> {
  resource: string;
  parentResources?: Resource[];
  schema?: z.ZodType<TDoc>;
  baseUrl: string;
  adapterFnApiToFE?: (data: TDocApi) => TDoc;
  adapterFnFEToApiCreate?: (data: TDocCreate) => TDocApiCreate;
  queryOverrides?: QueryConfig<TQuery['response'], TDocApi>;
}

export function create<TDoc, TDocApi, TDocCreate, TDocApiCreate, TQuery extends QueryConfig>({
  resource,
  parentResources,
  schema,
  baseUrl,
  adapterFnApiToFE,
  adapterFnFEToApiCreate,
  queryOverrides,
}: CreateParams<TDoc, TDocApi, TDocCreate, TDocApiCreate, TQuery>) {
  const { getData } = queryOverrides || {};

  const mutationFn: MutationFunction<TDoc, TDocCreate> = async (payload) => {
    const transformedPayload = adapterFnFEToApiCreate
      ? adapterFnFEToApiCreate(payload)
      : (payload as unknown as TDocApiCreate);

    const route = buildParentRoute([...(parentResources || []), resource]);
    const url = `${baseUrl}/${route}`;

    const res = await apiClient.post<TDocApi, TDocApiCreate>(url, transformedPayload);

    if (res.status === 201 || res.status === 200) {
      const rawData = getData ? getData(res.data as TQuery['response']) : (getDataDefault(res.data) as TDocApi);

      if (adapterFnApiToFE && schema) {
        const mappedData = adapterFnApiToFE(rawData);
        return schema.parse(mappedData);
      }
      return rawData as unknown as TDoc;
    }
    throw new Error(`Error creating resource: ${resource}`);
  };

  return {
    useMutation: (options?: UseMutationOptions<TDoc, Error, TDocCreate, unknown>) =>
      useMutation<TDoc, Error, TDocCreate>({ mutationFn, ...options }),
  };
}
