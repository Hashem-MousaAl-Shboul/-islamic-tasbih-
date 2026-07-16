import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

const LAST_READ_KEY = 'quran_last_read';

export interface LastReadPosition {
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  ayahNumber: number;
  page?: number;
  timestamp: number;
}

export const [QuranStoreProvider, useQuranStore] = createContextHook(() => {
  const [lastRead, setLastRead] = useState<LastReadPosition | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const loadLastRead = async () => {
      try {
        const saved = await AsyncStorage.getItem(LAST_READ_KEY);
        if (!mounted) return;
        if (saved) {
          const parsed = JSON.parse(saved) as LastReadPosition;
          setLastRead(parsed);
        }
      } catch (error) {
        console.error('[QuranStore] Error loading last read:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void loadLastRead();
    return () => { mounted = false; };
  }, []);

  const saveLastRead = useCallback(async (position: LastReadPosition) => {
    try {
      setLastRead(position);
      await AsyncStorage.setItem(LAST_READ_KEY, JSON.stringify(position));
      console.log('[QuranStore] Saved last read:', position.surahNumber, position.ayahNumber);
    } catch (error) {
      console.error('[QuranStore] Error saving last read:', error);
    }
  }, []);

  const clearLastRead = useCallback(async () => {
    try {
      setLastRead(null);
      await AsyncStorage.removeItem(LAST_READ_KEY);
    } catch (error) {
      console.error('[QuranStore] Error clearing last read:', error);
    }
  }, []);

  return useMemo(() => ({
    lastRead,
    isLoading,
    saveLastRead,
    clearLastRead,
  }), [lastRead, isLoading, saveLastRead, clearLastRead]);
});
