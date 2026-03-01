export type ApiRequestOptions = RequestInit & {
  params?: Record<string, string>;
};

export type ApiResponse<T> = {
  data: T | null;
  status: number;
  statusText: string;
};

function buildUrl(url: string, params?: Record<string, string>): string {
  const query = params
    ? Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&')
    : '';
  return query ? `${url}?${query}` : url;
}

async function fetchRequest<T>(url: string, options: ApiRequestOptions): Promise<ApiResponse<T>> {
  const response = await fetch(url, options);

  const res: ApiResponse<T> = {
    status: response.status,
    statusText: response.statusText,
    data: null,
  };

  if (response.ok) {
    res.data = (await response.json()) as T;
  } else {
    console.error(`Error: ${response.statusText} (${response.status})`);
  }

  return res;
}

async function get<T>(url: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
  const fullUrl = buildUrl(url, options.params);
  return fetchRequest<T>(fullUrl, { method: 'GET', ...options });
}

async function post<T, B>(url: string, body: B, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
  return fetchRequest<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: JSON.stringify(body),
    ...options,
  });
}

async function put<T, B>(url: string, body: B, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
  return fetchRequest<T>(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: JSON.stringify(body),
    ...options,
  });
}

async function del<T, B>(url: string, body?: B, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
  const fullUrl = buildUrl(url, options.params);
  return fetchRequest<T>(fullUrl, {
    method: 'DELETE',
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });
}

export const apiClient = {
  get,
  post,
  put,
  delete: del,
};
