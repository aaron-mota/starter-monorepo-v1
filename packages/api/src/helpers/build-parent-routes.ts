import { URL_API } from '../constants';
import type { QueryKey } from '@tanstack/react-query';
import type { Resource } from '../types';

export function buildParentRoute(parentResources: Resource[]): string {
  return parentResources
    .map((resource) => {
      if (Array.isArray(resource)) {
        const [resourceName, id] = resource;
        return `${resourceName}/${id !== null ? id : 'null'}`;
      }
      return `${resource}`;
    })
    .join('/');
}

export function buildQueryKey(
  parentResources: Resource[],
  queryParams?: Record<string, unknown>,
  baseUrl?: string,
  queryKeyBase?: string
): {
  queryKey: QueryKey;
  queryParamsFinal?: Record<string, string>;
} {
  const queryKey: unknown[] = parentResources.flatMap((resource) =>
    Array.isArray(resource) ? [resource[0], String(resource[1])] : [resource]
  );

  if (queryParams && Object.values(queryParams).every((value) => value !== undefined)) {
    const queryParamsFinal: Record<string, string> = {};
    Object.entries(queryParams).forEach(([key, value]) => {
      queryParamsFinal[key] = String(value);
    });
    queryKey.push(queryParamsFinal);

    if (queryKeyBase || baseUrl !== URL_API) {
      const queryKeyBaseFinal = queryKeyBase || baseUrl;
      queryKey.unshift(queryKeyBaseFinal);
    }

    return { queryKey, queryParamsFinal };
  }

  if (queryKeyBase || baseUrl !== URL_API) {
    const queryKeyBaseFinal = queryKeyBase || baseUrl;
    queryKey.unshift(queryKeyBaseFinal);
  }

  return { queryKey };
}
