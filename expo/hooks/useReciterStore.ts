import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { ttsService, ReciterId, RECITER_NAMES } from '@/utils/ttsService';

const RECITER_STORAGE_KEY = 'selected_reciter';
const DEFAULT_RECITER: ReciterId = 'alafasy';

function isReciterId(value: string | null): value is ReciterId {
  return value !== null && Object.prototype.hasOwnProperty.call(RECITER_NAMES, value);
}

export const [ReciterProvider, useReciterStore] = createContextHook(() => {
  const [currentReciter, setCurrentReciter] = useState<ReciterId>(DEFAULT_RECITER);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const loadSavedReciter = async () => {
      try {
        const savedReciter = await AsyncStorage.getItem(RECITER_STORAGE_KEY);
        
        if (!mounted) return;
        
        const nextReciter = isReciterId(savedReciter) ? savedReciter : DEFAULT_RECITER;
        setCurrentReciter(nextReciter);
        ttsService.setReciter(nextReciter);
        setIsLoading(false);
      } catch (error) {
        console.error('[ReciterStore] Error loading saved reciter:', error);
        if (mounted) {
          setCurrentReciter(DEFAULT_RECITER);
          ttsService.setReciter(DEFAULT_RECITER);
          setIsLoading(false);
        }
      }
    };
    
    loadSavedReciter();
    
    return () => {
      mounted = false;
    };
  }, []);

  const changeReciter = useCallback(async (reciterId: ReciterId) => {
    try {
      setCurrentReciter(reciterId);
      ttsService.setReciter(reciterId);
      
      await AsyncStorage.setItem(RECITER_STORAGE_KEY, reciterId);
    } catch (error) {
      console.error('[ReciterStore] Error changing reciter:', error);
    }
  }, []);

  const getCurrentReciterName = useCallback(() => {
    return RECITER_NAMES[currentReciter];
  }, [currentReciter]);

  return useMemo(() => ({
    currentReciter,
    isLoading,
    changeReciter,
    getCurrentReciterName,
  }), [currentReciter, isLoading, changeReciter, getCurrentReciterName]);
});
