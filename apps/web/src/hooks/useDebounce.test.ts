import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value straight away', () => {
    const { result } = renderHook(() => useDebounce('café', 300));
    expect(result.current).toBe('café');
  });

  it('only updates after the delay has passed without new changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'c' },
    });

    rerender({ value: 'ca' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'caf' });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('c');

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('caf');
  });
});
