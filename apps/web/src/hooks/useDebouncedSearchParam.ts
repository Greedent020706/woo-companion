import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useDebounce } from './useDebounce';

export function useDebouncedSearchParam(paramName: string, delayInMs = 350) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(() => searchParams.get(paramName) ?? '');
  const debouncedValue = useDebounce(inputValue, delayInMs);

  useEffect(() => {
    setSearchParams(
      (currentParams) => {
        if ((currentParams.get(paramName) ?? '') === debouncedValue) return currentParams;
        const nextParams = new URLSearchParams(currentParams);
        if (debouncedValue) nextParams.set(paramName, debouncedValue);
        else nextParams.delete(paramName);
        nextParams.delete('page');
        return nextParams;
      },
      { replace: true },
    );
  }, [debouncedValue, paramName, setSearchParams]);

  return { inputValue, setInputValue, debouncedValue };
}
