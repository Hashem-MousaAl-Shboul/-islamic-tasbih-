import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio, type AVPlaybackStatus } from 'expo-av';
import { InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av/build/Audio.types';
import createContextHook from '@nkzw/create-context-hook';

import { getQuranRecitationUrl, type ReciterId } from '@/utils/ttsService';
import { useReciterStore } from '@/hooks/useReciterStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useQuranStore } from '@/hooks/useQuranStore';
import type { SurahMeta } from '@/utils/quranData';
import { stopAudio as stopYasAI } from '@/utils/yasAI';

export type RepeatMode = 'none' | 'surah';

export interface QuranAudioState {
  currentSurah: SurahMeta | null;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  repeatMode: RepeatMode;
  error: string | null;
}

const REPEAT_STORAGE_KEY = 'quran_repeat_mode';

export const [QuranAudioProvider, useQuranAudio] = createContextHook(() => {
  const { currentReciter } = useReciterStore();
  const { t } = useLanguageStore();
  const { saveLastRead } = useQuranStore();

  const [currentSurah, setCurrentSurah] = useState<SurahMeta | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [error, setError] = useState<string | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);
  const repeatModeRef = useRef<RepeatMode>('none');
  const currentSurahRef = useRef<SurahMeta | null>(null);
  const isSeekingRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);
  const isLoadingRef = useRef<boolean>(false);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tRef = useRef(t);

  useEffect(() => { tRef.current = t; }, [t]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    currentSurahRef.current = currentSurah;
  }, [currentSurah]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Load saved repeat mode
  useEffect(() => {
    let mounted = true;
    const loadRepeatMode = async () => {
      try {
        const saved = await getStoredRepeatMode();
        if (mounted && saved) {
          setRepeatMode(saved);
          repeatModeRef.current = saved;
        }
      } catch (e) {
        console.log('[QuranAudio] Error loading repeat mode:', e);
      }
    };
    void loadRepeatMode();
    return () => { mounted = false; };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      if (soundRef.current) {
        void soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  const cleanupPlayer = useCallback(async () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
  }, []);

  const setupAudio = useCallback(async () => {
    try {
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          playThroughEarpieceAndroid: false,
        });
      }
    } catch (error) {
      console.error('[QuranAudio] Audio setup error:', error);
    }
  }, []);

  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      const err = (status as any)?.error;
      if (err) {
        console.error('[QuranAudio] Player error:', err);
        setError(tRef.current('audioNetworkError'));
        setIsPlaying(false);
        isLoadingRef.current = false;
        setIsLoading(false);
        soundRef.current = null;
      }
      return;
    }

    if ((status as any).error) {
      console.error('[QuranAudio] Player error:', (status as any).error);
      setError(tRef.current('audioNetworkError'));
      setIsPlaying(false);
      isLoadingRef.current = false;
      setIsLoading(false);
      return;
    }

    isLoadingRef.current = false;
    setIsLoading(prev => (prev ? false : prev));
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    const nextIsPlaying = Boolean(status.isPlaying);
    const nextPos = Number(status.positionMillis ?? 0);
    const nextDur = Number(status.durationMillis ?? 0);

    setIsPlaying(prev => (prev !== nextIsPlaying ? nextIsPlaying : prev));
    if (!isSeekingRef.current) {
      setPosition(prev => (Math.abs(prev - nextPos) > 200 ? nextPos : prev));
    }
    setDuration(prev => (prev !== nextDur && nextDur > 0 ? nextDur : prev));

    if (status.didJustFinish) {
      if (repeatModeRef.current === 'surah') {
        void (async () => {
          try {
            await soundRef.current?.setPositionAsync(0);
            await soundRef.current?.playAsync();
            setPosition(0);
          } catch (e) {
            console.error('[QuranAudio] Repeat error:', e);
            setIsPlaying(false);
            setPosition(0);
          }
        })();
      } else {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  }, []);

  const playSurah = useCallback(async (surah: SurahMeta, reciter?: ReciterId) => {
    const reciterToUse = reciter ?? currentReciter;

    // Prevent double-play race condition
    if (isLoadingRef.current && currentSurahRef.current?.number !== surah.number) {
      console.log('[QuranAudio] Already loading another surah, ignoring play request');
      return;
    }

    try {
      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }

      setError(null);

      // If same surah is already loaded, toggle pause/play
      if (currentSurahRef.current?.number === surah.number && soundRef.current) {
        if (isPlayingRef.current) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded && status.durationMillis && status.positionMillis >= status.durationMillis && status.durationMillis > 0) {
            await soundRef.current.setPositionAsync(0);
          }
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      // Stop YasAI if playing
      try { await stopYasAI(); } catch {}

      // Cleanup existing player
      await cleanupPlayer();

      isLoadingRef.current = true;
      setIsLoading(true);
      setCurrentSurah(surah);
      setPosition(0);
      setDuration(0);

      const audioUrl = getQuranRecitationUrl(surah.number, reciterToUse);
      console.log(`[QuranAudio] Playing surah ${surah.number} with reciter ${reciterToUse}: ${audioUrl}`);
      if (!audioUrl) {
        setError(tRef.current('errorLoadingVerses'));
        isLoadingRef.current = false;
        setIsLoading(false);
        setCurrentSurah(null);
        return;
      }

      await setupAudio();

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, isLooping: false, volume: 1.0 },
        handlePlaybackStatusUpdate,
        false // do not download first for remote mp3
      );

      soundRef.current = sound;
      setIsPlaying(true);

      // Safety timeout: clear loading state after 15s if no status update arrived
      loadingTimeoutRef.current = setTimeout(() => {
        loadingTimeoutRef.current = null;
        isLoadingRef.current = false;
        setIsLoading(prev => (prev ? false : prev));
      }, 15000);

      void saveLastRead({
        surahNumber: surah.number,
        surahName: surah.name,
        surahEnglishName: surah.englishName,
        ayahNumber: 1,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('[QuranAudio] Play surah error:', error);
      setError(tRef.current('audioNetworkError'));
      isLoadingRef.current = false;
      setIsLoading(false);
      setIsPlaying(false);
      setCurrentSurah(null);
    }
  }, [currentReciter, setupAudio, cleanupPlayer, saveLastRead, handlePlaybackStatusUpdate]);

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current || !currentSurahRef.current) return;
    try {
      if (isPlayingRef.current) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.durationMillis && status.positionMillis >= status.durationMillis && status.durationMillis > 0) {
          await soundRef.current.setPositionAsync(0);
          setPosition(0);
        }
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('[QuranAudio] Toggle play/pause error:', error);
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.setPositionAsync(0);
      }
      setIsPlaying(false);
      setPosition(0);
    } catch (error) {
      console.error('[QuranAudio] Stop error:', error);
    }
  }, []);

  const stopAndClear = useCallback(async () => {
    try {
      await cleanupPlayer();
      isLoadingRef.current = false;
      setIsPlaying(false);
      setIsLoading(false);
      setPosition(0);
      setDuration(0);
      setCurrentSurah(null);
      setError(null);
    } catch (error) {
      console.error('[QuranAudio] Stop and clear error:', error);
    }
  }, [cleanupPlayer]);

  const seekTo = useCallback(async (millis: number) => {
    if (!soundRef.current) return;
    try {
      isSeekingRef.current = true;
      await soundRef.current.setPositionAsync(millis);
      setPosition(millis);
      isSeekingRef.current = false;
    } catch (error) {
      console.error('[QuranAudio] Seek error:', error);
      isSeekingRef.current = false;
    }
  }, []);

  const toggleRepeat = useCallback(async () => {
    const newMode: RepeatMode = repeatMode === 'none' ? 'surah' : 'none';
    setRepeatMode(newMode);
    repeatModeRef.current = newMode;
    try {
      await saveRepeatMode(newMode);
    } catch (e) {
      console.log('[QuranAudio] Error saving repeat mode:', e);
    }
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [repeatMode]);

  const isCurrentSurah = useCallback((surahNumber: number): boolean => {
    return currentSurahRef.current?.number === surahNumber;
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  return useMemo(() => ({
    currentSurah,
    isPlaying,
    isLoading,
    position,
    duration,
    repeatMode,
    error,
    playSurah,
    togglePlayPause,
    stop,
    stopAndClear,
    seekTo,
    toggleRepeat,
    isCurrentSurah,
    dismissError,
  }), [
    currentSurah, isPlaying, isLoading, position, duration, repeatMode, error,
    playSurah, togglePlayPause, stop, stopAndClear, seekTo, toggleRepeat,
    isCurrentSurah, dismissError,
  ]);
});

// AsyncStorage helpers for repeat mode
async function getStoredRepeatMode(): Promise<RepeatMode | null> {
  try {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    const saved = await AsyncStorage.getItem(REPEAT_STORAGE_KEY);
    if (saved === 'none' || saved === 'surah') return saved;
    return null;
  } catch {
    return null;
  }
}

async function saveRepeatMode(mode: RepeatMode): Promise<void> {
  try {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.setItem(REPEAT_STORAGE_KEY, mode);
  } catch (e) {
    console.log('[QuranAudio] Error saving repeat mode:', e);
  }
}
