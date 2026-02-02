import { useState, useEffect, useCallback } from 'react';
import { ttsService, ReciterId } from '@/utils/ttsService';

export interface TTSState {
  isPlaying: boolean;
  isLoading: boolean;
  currentText: string;
  currentReciter: ReciterId;
  error: string | null;
  isQueueProcessing: boolean;
  queueLength: number;
}

export function useTTS() {
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isLoading: false,
    currentText: '',
    currentReciter: 'alafasy',
    error: null,
    isQueueProcessing: false,
    queueLength: 0,
  });

  // تحديث الحالة بشكل دوري
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        isPlaying: ttsService.isCurrentlyPlaying(),
        currentText: ttsService.getCurrentText(),
        currentReciter: ttsService.getCurrentReciter(),
        isQueueProcessing: ttsService.isQueueProcessing(),
        queueLength: ttsService.getQueueLength(),
      }));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const setReciter = useCallback((reciter: ReciterId) => {
    try {
      console.log(`[useTTS] Setting reciter to: ${reciter}`);
      ttsService.setReciter(reciter);
      setState(prev => ({ ...prev, currentReciter: reciter, error: null }));
    } catch (error) {
      console.error('[useTTS] Set reciter error:', error);
      setState(prev => ({ ...prev, error: 'فشل في تغيير القارئ. يرجى المحاولة مرة أخرى.' }));
    }
  }, []);

  const playDhikr = useCallback(async (text: string, reciter?: ReciterId) => {
    try {
      console.log(`[useTTS] Playing dhikr: ${text.substring(0, 30)}...`);
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await ttsService.playDhikr(text, reciter);
      
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('[useTTS] Play dhikr error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'فشل في تشغيل الذكر. يرجى المحاولة مرة أخرى.' 
      }));
    }
  }, []);

  const playAdhkarCategory = useCallback(async (texts: string[], reciter?: ReciterId) => {
    try {
      console.log(`[useTTS] Playing adhkar category: ${texts.length} items`);
      
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await ttsService.playAdhkarCategory(texts, reciter);
      
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('[useTTS] Play adhkar category error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'فشل في تشغيل الأذكار. يرجى المحاولة مرة أخرى.' 
      }));
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      console.log('[useTTS] Stopping TTS');
      
      await ttsService.stop();
      
      setState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isLoading: false,
        currentText: '',
        isQueueProcessing: false,
        queueLength: 0,
        error: null 
      }));
    } catch (error) {
      console.error('[useTTS] Stop error:', error);
      setState(prev => ({ ...prev, error: 'فشل في إيقاف التشغيل. يرجى المحاولة مرة أخرى.' }));
    }
  }, []);

  const pause = useCallback(async () => {
    try {
      console.log('[useTTS] Pausing TTS');
      
      await ttsService.pause();
      
      setState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isLoading: false,
        error: null 
      }));
    } catch (error) {
      console.error('[useTTS] Pause error:', error);
      setState(prev => ({ ...prev, error: 'فشل في إيقاف التشغيل مؤقتاً. يرجى المحاولة مرة أخرى.' }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    setReciter,
    playDhikr,
    playAdhkarCategory,
    stop,
    pause,
    clearError,
  };
}