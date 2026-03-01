'use client';

import { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import superjson from 'superjson';
import { trpc, trpcClient } from '@/lib/trpc';

const QueryClientContext = createContext<QueryClient | null>(null);

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 0,
            gcTime: 1000 * 60 * 60 * 24,
          },
        },
      })
  );

  const [asyncStoragePersister] = useState(() =>
    createAsyncStoragePersister({
      storage: AsyncStorage,
      key: 'STARTER_CACHE',
      throttleTime: 1000,
      serialize: (data) => superjson.stringify(data),
      deserialize: (data) => superjson.parse(data),
    })
  );

  return (
    <QueryClientContext.Provider value={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: asyncStoragePersister }}>
          {children}
        </PersistQueryClientProvider>
      </trpc.Provider>
    </QueryClientContext.Provider>
  );
}

export function useQueryClient() {
  const queryClient = useContext(QueryClientContext);
  if (!queryClient) {
    throw new Error('useQueryClient must be used within TRPCProvider');
  }
  return queryClient;
}
