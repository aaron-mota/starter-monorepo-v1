export interface QueryConfig<TData, TError = Error> {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
}
