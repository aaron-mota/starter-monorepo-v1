import { useCallback, useState } from 'react';
import { trpc } from '@/lib/trpc';

/**
 * Pull-to-refresh hook that invalidates all tRPC queries.
 * Returns `{ refreshing, onRefresh }` to pass to ScrollView/FlatList.
 */
export function useRefresh() {
  const [refreshing, setRefreshing] = useState(false);
  const utils = trpc.useUtils();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await utils.invalidate();
    setRefreshing(false);
  }, [utils]);

  return { refreshing, onRefresh };
}
