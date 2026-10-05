import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

export type FilterChanges = Record<string, string | undefined>;

export function useUrlFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateFilters = useCallback(
    (changes: FilterChanges) => {
      setSearchParams(
        (currentParams) => {
          const nextParams = new URLSearchParams(currentParams);
          for (const [name, value] of Object.entries(changes)) {
            if (value) nextParams.set(name, value);
            else nextParams.delete(name);
          }
          if (!('page' in changes)) nextParams.delete('page');
          return nextParams;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { searchParams, updateFilters };
}
