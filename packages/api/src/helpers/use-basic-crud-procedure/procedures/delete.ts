import { apiClient } from '../../../api-client';
import { buildParentRoute } from '../../build-parent-routes';
import { useMutation } from '@tanstack/react-query';
import type { MutationFunction, UseMutationOptions } from '@tanstack/react-query';
import type { Id, Resource } from '../../../types';

interface DeleteParams<TDeleteReturn> {
  resource: string;
  parentResources?: Resource[];
  baseUrl: string;
}

export function del<TDeleteReturn>({ resource, parentResources, baseUrl }: DeleteParams<TDeleteReturn>) {
  const mutationFn: MutationFunction<TDeleteReturn, { id: Id }> = async ({ id }) => {
    const route = buildParentRoute([...(parentResources || []), `${resource}/${id}`]);
    const url = `${baseUrl}/${route}`;

    const res = await apiClient.delete<TDeleteReturn, { id: Id }>(url, { id });

    if (res.status === 200 || res.status === 204) {
      return res.data as TDeleteReturn;
    }
    throw new Error(`Error deleting resource: ${resource}`);
  };

  return {
    useMutation: (options?: UseMutationOptions<TDeleteReturn, Error, { id: Id }, unknown>) =>
      useMutation<TDeleteReturn, Error, { id: Id }>({ mutationFn, ...options }),
  };
}
