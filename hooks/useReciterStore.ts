import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { ttsService, ReciterId, RECITER_NAMES } from '@/utils/ttsService';

const RECITER_STORAGE_KEY = 'selected_reciter';

export const [ReciterProvider, useReciterStore] = createContextHook(() => {
  const [currentReciter, setCurrentReciter] = useState<ReciterId>('sudais');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const loadSavedReciter = async () => {
      try {
        const savedReciter = await AsyncStorage.getItem(RECITER_STORAGE_KEY);
        
        if (!mounted) return;
        
        if (savedReciter && (savedReciter as ReciterId)) {
          setCurrentReciter(savedReciter as ReciterId);
          ttsService.setReciter(savedReciter as ReciterId);
        } else {
          setCurrentReciter('sudais');
          ttsService.setReciter('sudais');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('[ReciterStore] Error loading saved reciter:', error);
        if (mounted) {
          setCurrentReciter('sudais');
          ttsService.setReciter('sudais');
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
      console.log(`[ReciterStore] Changing reciter to: ${reciterId}`);
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
