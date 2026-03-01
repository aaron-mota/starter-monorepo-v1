import { apiClient } from '../../../api-client';
import { buildParentRoute } from '../../build-parent-routes';
import { useMutation } from '@tanstack/react-query';
import type { MutationFunction, UseMutationOptions } from '@tanstack/react-query';
import type { Id, Resource } from '../../../types';

interface DeleteManyParams<TDeleteReturn> {
  resource: string;
  parentResources?: Resource[];
  baseUrl: string;
}

export function deleteMany<TDeleteReturn>({ resource, parentResources, baseUrl }: DeleteManyParams<TDeleteReturn>) {
  const mutationFn: MutationFunction<TDeleteReturn[], { id: Id }[]> = async (items) => {
    const route = buildParentRoute([...(parentResources || []), resource]);
    const url = `${baseUrl}/${route}`;

    const res = await apiClient.delete<TDeleteReturn[], { id: Id }[]>(url, items);

    if (res.status === 200 || res.status === 204) {
      return res.data as TDeleteReturn[];
    }
    throw new Error(`Error deleting resources: ${resource}`);
  };

  return {
    useMutation: (options?: UseMutationOptions<TDeleteReturn[], Error, { id: Id }[], unknown>) =>
      useMutation<TDeleteReturn[], Error, { id: Id }[]>({ mutationFn, ...options }),
  };
}
