import { apiClient } from '../../../api-client';
import { buildParentRoute } from '../../build-parent-routes';
import { getDataDefault } from '../../get-data';
import { useMutation } from '@tanstack/react-query';
import { type z } from 'zod';
import type { MutationFunction, UseMutationOptions } from '@tanstack/react-query';
import type { Id, Resource } from '../../../types';

interface UpdateParams<TDoc, TDocApi, TDocUpdate, TDocApiUpdate> {
  resource: string;
  parentResources?: Resource[];
  schema?: z.ZodType<TDoc, z.ZodTypeDef, unknown>;
  baseUrl: string;
  adapterFnApiToFE?: (data: TDocApi) => TDoc;
  adapterFnFEToApiUpdate?: (data: TDocUpdate) => TDocApiUpdate;
}

export function update<TDoc, TDocApi, TDocUpdate, TDocApiUpdate>({
  resource,
  parentResources,
  schema,
  baseUrl,
  adapterFnApiToFE,
  adapterFnFEToApiUpdate,
}: UpdateParams<TDoc, TDocApi, TDocUpdate, TDocApiUpdate>) {
  const mutationFn: MutationFunction<TDoc, { id: Id; payload: TDocUpdate }> = async ({ id, payload }) => {
    const transformedPayload = adapterFnFEToApiUpdate
      ? adapterFnFEToApiUpdate(payload)
      : (payload as unknown as TDocApiUpdate);

    const route = buildParentRoute([...(parentResources || []), `${resource}/${id}`]);
    const url = `${baseUrl}/${route}`;

    const res = await apiClient.put<TDocApi, TDocApiUpdate>(url, transformedPayload);

    if (res.status === 200) {
      const rawData = getDataDefault(res.data) as TDocApi;

      if (adapterFnApiToFE && schema) {
        const mappedData = adapterFnApiToFE(rawData);
        return schema.parse(mappedData);
      }
      return rawData as unknown as TDoc;
    }
    throw new Error(`Error updating resource: ${resource}`);
  };

  return {
    useMutation: (options?: UseMutationOptions<TDoc, Error, { id: Id; payload: TDocUpdate }, unknown>) =>
      useMutation<TDoc, Error, { id: Id; payload: TDocUpdate }>({ mutationFn, ...options }),
  };
}
