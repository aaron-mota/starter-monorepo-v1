import { apiClient } from '../../../api-client';
import { buildParentRoute } from '../../build-parent-routes';
import { useMutation } from '@tanstack/react-query';
import { type z } from 'zod';
import type { MutationFunction, UseMutationOptions } from '@tanstack/react-query';
import type { Id, Resource } from '../../../types';

interface UpdateManyParams<TDoc, TDocApi, TDocUpdate, TDocApiUpdate> {
  resource: string;
  parentResources?: Resource[];
  schema?: z.ZodType<TDoc>;
  baseUrl: string;
  adapterFnApiToFE?: (data: TDocApi) => TDoc;
  adapterFnFEToApiUpdate?: (data: TDocUpdate) => TDocApiUpdate;
}

export function updateMany<TDoc, TDocApi, TDocUpdate, TDocApiUpdate>({
  resource,
  parentResources,
  schema,
  baseUrl,
  adapterFnApiToFE,
  adapterFnFEToApiUpdate,
}: UpdateManyParams<TDoc, TDocApi, TDocUpdate, TDocApiUpdate>) {
  const mutationFn: MutationFunction<TDoc[], { id: Id; payload: TDocUpdate }[]> = async (updates) => {
    const transformedUpdates = updates.map(({ id, payload }) => ({
      id,
      payload: adapterFnFEToApiUpdate ? adapterFnFEToApiUpdate(payload) : (payload as unknown as TDocApiUpdate),
    }));

    const route = buildParentRoute([...(parentResources || []), resource]);
    const url = `${baseUrl}/${route}`;

    const res = await apiClient.put<TDocApi[], typeof transformedUpdates>(url, transformedUpdates);

    if (res.status === 200) {
      const rawDataArray = res.data as TDocApi[];
      if (adapterFnApiToFE && schema) {
        return rawDataArray.map((item) => schema.parse(adapterFnApiToFE(item)));
      }
      return rawDataArray as unknown as TDoc[];
    }
    throw new Error(`Error updating resources: ${resource}`);
  };

  return {
    useMutation: (options?: UseMutationOptions<TDoc[], Error, { id: Id; payload: TDocUpdate }[], unknown>) =>
      useMutation<TDoc[], Error, { id: Id; payload: TDocUpdate }[]>({ mutationFn, ...options }),
  };
}
