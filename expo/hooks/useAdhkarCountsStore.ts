import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@adhkar_counts';
const HISTORY_KEY = '@adhkar_counts_history';
const MAX_HISTORY_PER_ID = 20;
const SAVE_DELAY_MS = 500;

interface AdhkarCountsStore {
  counts: Record<string, number>;
  increment: (id: string, max: number) => void;
  reset: (id: string) => void;
  undo: (id: string) => void;
  getCount: (id: string) => number;
  canUndo: (id: string) => boolean;
  isLoading: boolean;
}

function parseNumberRecord(value: string | null): Record<string, number> {
  if (!value) return {};
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
  return Object.fromEntries(
    Object.entries(parsed).filter((entry): entry is [string, number] =>
      typeof entry[1] === 'number' && Number.isFinite(entry[1]) && entry[1] >= 0
    )
  );
}

function parseHistoryRecord(value: string | null): Record<string, number[]> {
  if (!value) return {};
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
  const result: Record<string, number[]> = {};
  for (const [id, history] of Object.entries(parsed)) {
    if (!Array.isArray(history)) continue;
    result[id] = history
      .filter((count): count is number => typeof count === 'number' && Number.isFinite(count) && count >= 0)
      .slice(-MAX_HISTORY_PER_ID);
  }
  return result;
}

export const [AdhkarCountsProvider, useAdhkarCountsStore] = createContextHook<AdhkarCountsStore>(() => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<Record<string, number[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const countsRef = useRef<Record<string, number>>({});
  const historyRef = useRef<Record<string, number[]>>({});
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedRef = useRef<boolean>(false);

  const persist = useCallback(async (): Promise<void> => {
    if (!hasLoadedRef.current) return;
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(countsRef.current)),
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(historyRef.current)),
    ]);
  }, []);

  useEffect(() => {
    let isMounted = true;
    void (async (): Promise<void> => {
      try {
        const [storedCounts, storedHistory] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(HISTORY_KEY),
        ]);
        if (!isMounted) return;
        const loadedCounts = parseNumberRecord(storedCounts);
        const loadedHistory = parseHistoryRecord(storedHistory);
        countsRef.current = loadedCounts;
        historyRef.current = loadedHistory;
        setCounts(loadedCounts);
        setHistory(loadedHistory);
      } catch (error) {
        if (__DEV__) console.warn('[AdhkarCountsStore] Could not restore saved counts.', error);
      } finally {
        if (isMounted) {
          hasLoadedRef.current = true;
          setIsLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      void persist().catch((error: unknown) => {
        if (__DEV__) console.warn('[AdhkarCountsStore] Could not save counts.', error);
      });
    }, SAVE_DELAY_MS);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [counts, history, persist]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState !== 'active') {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        void persist().catch(() => {});
      }
    });
    return () => {
      subscription.remove();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      void persist().catch(() => {});
    };
  }, [persist]);

  const increment = useCallback((id: string, max: number): void => {
    if (!hasLoadedRef.current || max <= 0) return;
    const current = countsRef.current[id] ?? 0;
    if (current >= max) return;

    const nextCounts = { ...countsRef.current, [id]: current + 1 };
    const stack = historyRef.current[id] ?? [];
    const nextStack = [...stack, current].slice(-MAX_HISTORY_PER_ID);
    const nextHistory = { ...historyRef.current, [id]: nextStack };

    countsRef.current = nextCounts;
    historyRef.current = nextHistory;
    setCounts(nextCounts);
    setHistory(nextHistory);
  }, []);

  const reset = useCallback((id: string): void => {
    if (!hasLoadedRef.current || (countsRef.current[id] ?? 0) === 0) return;
    const nextCounts = { ...countsRef.current };
    const nextHistory = { ...historyRef.current };
    delete nextCounts[id];
    delete nextHistory[id];
    countsRef.current = nextCounts;
    historyRef.current = nextHistory;
    setCounts(nextCounts);
    setHistory(nextHistory);
  }, []);

  const undo = useCallback((id: string): void => {
    const stack = historyRef.current[id] ?? [];
    if (!hasLoadedRef.current || stack.length === 0) return;
    const previousCount = stack[stack.length - 1] ?? 0;
    const nextStack = stack.slice(0, -1);
    const nextCounts = { ...countsRef.current };
    const nextHistory = { ...historyRef.current };

    if (previousCount === 0) delete nextCounts[id];
    else nextCounts[id] = previousCount;
    if (nextStack.length === 0) delete nextHistory[id];
    else nextHistory[id] = nextStack;

    countsRef.current = nextCounts;
    historyRef.current = nextHistory;
    setCounts(nextCounts);
    setHistory(nextHistory);
  }, []);

  const getCount = useCallback((id: string): number => counts[id] ?? 0, [counts]);
  const canUndo = useCallback((id: string): boolean => (history[id] ?? []).length > 0, [history]);

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
