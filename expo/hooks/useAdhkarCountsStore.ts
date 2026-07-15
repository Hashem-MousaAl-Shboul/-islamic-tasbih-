import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@adhkar_counts';

interface AdhkarCountsStore {
  counts: Record<string, number>;
  increment: (id: string, max: number) => void;
  reset: (id: string) => void;
  getCount: (id: string) => number;
  isLoading: boolean;
}

export const [AdhkarCountsProvider, useAdhkarCountsStore] = createContextHook<AdhkarCountsStore>(() => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const countsRef = useRef(counts);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    countsRef.current = counts;
  }, [counts]);

  // Load from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            setCounts(parsed);
          }
        }
      } catch (e) {
        console.error('[AdhkarCountsStore] Error loading counts:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Debounced save
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      return;
    }
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(countsRef.current)).catch((e) => {
        console.error('[AdhkarCountsStore] Error saving counts:', e);
      });
    }, 1500);
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [counts]);

  const increment = useCallback((id: string, max: number) => {
    setCounts((prev) => {
      const current = prev[id] ?? 0;
      if (current >= max) return prev;
      return { ...prev, [id]: current + 1 };
    });
  }, []);

  const reset = useCallback((id: string) => {
    setCounts((prev) => {
      if (prev[id] === undefined || prev[id] === 0) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const getCount = useCallback((id: string): number => {
    return counts[id] ?? 0;
  }, [counts]);

  return useMemo(() => ({
    counts,
    increment,
    reset,
    getCount,
    isLoading,
  }), [counts, increment, reset, getCount, isLoading]);
});
