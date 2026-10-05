import { useCallback, useState } from 'react';

export function usePullToRefresh(refetch: () => Promise<unknown>) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  return { isRefreshing, onRefresh };
}
