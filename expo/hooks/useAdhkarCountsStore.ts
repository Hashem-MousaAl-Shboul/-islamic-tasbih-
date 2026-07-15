import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@adhkar_counts';
const HISTORY_KEY = '@adhkar_counts_history';

const MAX_HISTORY_PER_ID = 20;

interface AdhkarCountsStore {
  counts: Record<string, number>;
  increment: (id: string, max: number) => void;
  reset: (id: string) => void;
  undo: (id: string) => void;
  getCount: (id: string) => number;
  canUndo: (id: string) => boolean;
  isLoading: boolean;
}

export const [AdhkarCountsProvider, useAdhkarCountsStore] = createContextHook<AdhkarCountsStore>(() => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<Record<string, number[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const countsRef = useRef(counts);
  const historyRef = useRef(history);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    countsRef.current = counts;
  }, [counts]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  // Load from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const [storedCounts, storedHistory] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(HISTORY_KEY),
        ]);
        if (storedCounts) {
          const parsed = JSON.parse(storedCounts);
          if (parsed && typeof parsed === 'object') {
            setCounts(parsed);
          }
        }
        if (storedHistory) {
          const parsed = JSON.parse(storedHistory);
          if (parsed && typeof parsed === 'object') {
            setHistory(parsed);
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
      Promise.all([
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(countsRef.current)),
        AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(historyRef.current)),
      ]).catch((e) => {
        console.error('[AdhkarCountsStore] Error saving counts:', e);
      });
    }, 1500);
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [counts, history]);

  const increment = useCallback((id: string, max: number) => {
    setCounts((prev) => {
      const current = prev[id] ?? 0;
      if (current >= max) return prev;
      const next = { ...prev, [id]: current + 1 };
      return next;
    });
    setHistory((prev) => {
      const current = countsRef.current[id] ?? 0;
      const stack = prev[id] ?? [];
      const nextStack = [...stack, current];
      if (nextStack.length > MAX_HISTORY_PER_ID) {
        nextStack.shift();
      }
      return { ...prev, [id]: nextStack };
    });
  }, []);

  const reset = useCallback((id: string) => {
    setCounts((prev) => {
      if (prev[id] === undefined || prev[id] === 0) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setHistory((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const undo = useCallback((id: string) => {
    setHistory((prev) => {
      const stack = prev[id] ?? [];
      if (stack.length === 0) return prev;
      const previousCount = stack[stack.length - 1];
      const nextStack = stack.slice(0, stack.length - 1);
      const nextHistory = { ...prev, [id]: nextStack };
      if (nextStack.length === 0) {
        delete nextHistory[id];
      }
      setCounts((countPrev) => {
        const current = countPrev[id] ?? 0;
        if (current === 0) return countPrev;
        const nextCount = previousCount >= current ? Math.max(0, current - 1) : previousCount;
        if (nextCount === 0) {
          const next = { ...countPrev };
          delete next[id];
          return next;
        }
        return { ...countPrev, [id]: nextCount };
      });
      return nextHistory;
    });
  }, []);

  const getCount = useCallback((id: string): number => {
    return counts[id] ?? 0;
  }, [counts]);

  const canUndo = useCallback((id: string): boolean => {
    return (history[id] ?? []).length > 0;
  }, [history]);

  return useMemo(() => ({
    counts,
    increment,
    reset,
    undo,
    getCount,
    canUndo,
    isLoading,
  }), [counts, increment, reset, undo, getCount, canUndo, isLoading]);
});