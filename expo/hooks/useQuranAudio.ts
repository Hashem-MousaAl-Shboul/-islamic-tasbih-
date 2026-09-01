import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Audio, type AVPlaybackStatus } from 'expo-av';
import { InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av/build/Audio.types';
import createContextHook from '@nkzw/create-context-hook';

import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useQuranStore } from '@/hooks/useQuranStore';
import { useReciterStore } from '@/hooks/useReciterStore';
import type { SurahMeta } from '@/utils/quranData';
import { getQuranRecitationUrl, type ReciterId } from '@/utils/ttsService';
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
const LOADING_TIMEOUT_MS = 15_000;
const PROGRESS_UPDATE_INTERVAL_MS = 500;
const POSITION_UPDATE_THRESHOLD_MS = 200;

async function disposeSound(sound: Audio.Sound | null): Promise<void> {
  if (!sound) return;
  sound.setOnPlaybackStatusUpdate(null);
  try {
    await sound.stopAsync();
  } catch {}
  try {
    await sound.unloadAsync();
  } catch {}
}

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
  const currentSurahRef = useRef<SurahMeta | null>(null);
  const activeReciterRef = useRef<ReciterId | null>(null);
  const repeatModeRef = useRef<RepeatMode>('none');
  const isPlayingRef = useRef<boolean>(false);
  const isLoadingRef = useRef<boolean>(false);
  const isSeekingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const operationIdRef = useRef<number>(0);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tRef = useRef(t);

  useEffect(() => { tRef.current = t; }, [t]);
  useEffect(() => { currentSurahRef.current = currentSurah; }, [currentSurah]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);

  const clearLoadingTimeout = useCallback((): void => {
    if (!loadingTimeoutRef.current) return;
    clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = null;
  }, []);

  const configureAudio = useCallback(async (): Promise<void> => {
    if (Platform.OS === 'web') return;
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  const resetPlaybackState = useCallback((clearSurah: boolean): void => {
    isLoadingRef.current = false;
    isPlayingRef.current = false;
    setIsLoading(false);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
    if (clearSurah) {
      currentSurahRef.current = null;
      activeReciterRef.current = null;
      setCurrentSurah(null);
    }
  }, []);

  const releaseCurrentSound = useCallback(async (): Promise<void> => {
    clearLoadingTimeout();
    const sound = soundRef.current;
    soundRef.current = null;
    await disposeSound(sound);
  }, [clearLoadingTimeout]);

  const failOperation = useCallback((operationId: number, sound: Audio.Sound): void => {
    if (!isMountedRef.current || operationId !== operationIdRef.current || soundRef.current !== sound) return;
    ++operationIdRef.current;
    clearLoadingTimeout();
    soundRef.current = null;
    void disposeSound(sound);
    resetPlaybackState(true);
    setError(tRef.current('audioNetworkError'));
  }, [clearLoadingTimeout, resetPlaybackState]);

  const createStatusHandler = useCallback((operationId: number, sound: Audio.Sound) => {
    return (status: AVPlaybackStatus): void => {
      if (!isMountedRef.current || operationId !== operationIdRef.current || soundRef.current !== sound) return;
      if (!status.isLoaded) {
        if ('error' in status && status.error) failOperation(operationId, sound);
        return;
      }

      clearLoadingTimeout();
      if (isLoadingRef.current) {
        isLoadingRef.current = false;
        setIsLoading(false);
      }

      const nextIsPlaying = Boolean(status.isPlaying);
      const nextPosition = status.positionMillis ?? 0;
      const nextDuration = status.durationMillis ?? 0;
      isPlayingRef.current = nextIsPlaying;
      setIsPlaying((previous) => previous === nextIsPlaying ? previous : nextIsPlaying);
      if (!isSeekingRef.current) {
        setPosition((previous) => Math.abs(previous - nextPosition) > POSITION_UPDATE_THRESHOLD_MS ? nextPosition : previous);
      }
      if (nextDuration > 0) setDuration((previous) => previous === nextDuration ? previous : nextDuration);

      if (!status.didJustFinish) return;
      if (repeatModeRef.current !== 'surah') {
        isPlayingRef.current = false;
        setIsPlaying(false);
        setPosition(0);
        return;
      }

      void (async (): Promise<void> => {
        try {
          await sound.setPositionAsync(0);
          if (operationId !== operationIdRef.current || soundRef.current !== sound) return;
          setPosition(0);
          await sound.playAsync();
        } catch {
          failOperation(operationId, sound);
        }
      })();
    };
  }, [clearLoadingTimeout, failOperation]);

  const playSurah = useCallback(async (surah: SurahMeta, reciter?: ReciterId): Promise<void> => {
    const reciterToUse = reciter ?? currentReciter;
    const isSameTrack = currentSurahRef.current?.number === surah.number
      && activeReciterRef.current === reciterToUse;

    if (isSameTrack && isLoadingRef.current) return;

    if (isSameTrack && soundRef.current) {
      const sound = soundRef.current;
      try {
        if (isPlayingRef.current) {
          await sound.pauseAsync();
          isPlayingRef.current = false;
          if (isMountedRef.current) setIsPlaying(false);
        } else {
          const status = await sound.getStatusAsync();
          if (!status.isLoaded) return;
          if ((status.durationMillis ?? 0) > 0 && status.positionMillis >= (status.durationMillis ?? 0)) {
            await sound.setPositionAsync(0);
            if (isMountedRef.current) setPosition(0);
          }
          await sound.playAsync();
          isPlayingRef.current = true;
          if (isMountedRef.current) {
            setIsPlaying(true);
            setError(null);
          }
        }
      } catch {
        const operationId = operationIdRef.current;
        failOperation(operationId, sound);
      }
      return;
    }

    const operationId = ++operationIdRef.current;
    clearLoadingTimeout();
    isLoadingRef.current = true;
    isPlayingRef.current = false;
    currentSurahRef.current = surah;
    activeReciterRef.current = reciterToUse;
    setError(null);
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentSurah(surah);
    setPosition(0);
    setDuration(0);

    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    try {
      await Promise.allSettled([stopYasAI(), releaseCurrentSound()]);
      if (!isMountedRef.current || operationId !== operationIdRef.current) return;

      const audioUrl = getQuranRecitationUrl(surah.number, reciterToUse);
      if (!audioUrl) throw new Error('Missing recitation URL');
      await configureAudio();
      if (!isMountedRef.current || operationId !== operationIdRef.current) return;

      const sound = new Audio.Sound();
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(createStatusHandler(operationId, sound));
      loadingTimeoutRef.current = setTimeout(() => {
        loadingTimeoutRef.current = null;
        failOperation(operationId, sound);
      }, LOADING_TIMEOUT_MS);

      await sound.loadAsync(
        { uri: audioUrl },
        {
          shouldPlay: true,
          isLooping: false,
          volume: 1,
          progressUpdateIntervalMillis: PROGRESS_UPDATE_INTERVAL_MS,
        },
        false
      );

      if (!isMountedRef.current || operationId !== operationIdRef.current || soundRef.current !== sound) {
        await disposeSound(sound);
        return;
      }

      void saveLastRead({
        surahNumber: surah.number,
        surahName: surah.name,
        surahEnglishName: surah.englishName,
        ayahNumber: 1,
        timestamp: Date.now(),
      }).catch(() => {});
    } catch {
      if (operationId !== operationIdRef.current) return;
      const sound = soundRef.current;
      if (sound) failOperation(operationId, sound);
      else {
        clearLoadingTimeout();
        resetPlaybackState(true);
        setError(tRef.current('audioNetworkError'));
      }
    }
  }, [clearLoadingTimeout, configureAudio, createStatusHandler, currentReciter, failOperation, releaseCurrentSound, resetPlaybackState, saveLastRead]);

  const togglePlayPause = useCallback(async (): Promise<void> => {
    const sound = soundRef.current;
    if (!sound || !currentSurahRef.current || isLoadingRef.current) return;
    try {
      if (isPlayingRef.current) {
        await sound.pauseAsync();
        isPlayingRef.current = false;
        if (isMountedRef.current) setIsPlaying(false);
        return;
      }
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;
      if ((status.durationMillis ?? 0) > 0 && status.positionMillis >= (status.durationMillis ?? 0)) {
        await sound.setPositionAsync(0);
        if (isMountedRef.current) setPosition(0);
      }
      await sound.playAsync();
      isPlayingRef.current = true;
      if (isMountedRef.current) {
        setIsPlaying(true);
        setError(null);
      }
    } catch {
      failOperation(operationIdRef.current, sound);
    }
  }, [failOperation]);

  const stop = useCallback(async (): Promise<void> => {
    ++operationIdRef.current;
    clearLoadingTimeout();
    await releaseCurrentSound();
    activeReciterRef.current = null;
    resetPlaybackState(false);
  }, [clearLoadingTimeout, releaseCurrentSound, resetPlaybackState]);

  const stopAndClear = useCallback(async (): Promise<void> => {
    ++operationIdRef.current;
    clearLoadingTimeout();
    await releaseCurrentSound();
    resetPlaybackState(true);
    if (isMountedRef.current) setError(null);
  }, [clearLoadingTimeout, releaseCurrentSound, resetPlaybackState]);

  const seekTo = useCallback(async (millis: number): Promise<void> => {
    const sound = soundRef.current;
    if (!sound || isLoadingRef.current) return;
    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;
      const maxPosition = status.durationMillis ?? duration;
      const requested = Number.isFinite(millis) ? millis : 0;
      const safePosition = Math.max(0, Math.min(requested, maxPosition));
      isSeekingRef.current = true;
      setPosition(safePosition);
      await sound.setPositionAsync(safePosition);
    } finally {
      isSeekingRef.current = false;
    }
  }, [duration]);

  const toggleRepeat = useCallback(async (): Promise<void> => {
    const nextMode: RepeatMode = repeatModeRef.current === 'none' ? 'surah' : 'none';
    repeatModeRef.current = nextMode;
    setRepeatMode(nextMode);
    try {
      await AsyncStorage.setItem(REPEAT_STORAGE_KEY, nextMode);
    } catch {}
    if (Platform.OS !== 'web') void Haptics.selectionAsync().catch(() => {});
  }, []);

  const isCurrentSurah = useCallback((surahNumber: number): boolean => {
    return currentSurahRef.current?.number === surahNumber;
  }, []);

  const dismissError = useCallback((): void => setError(null), []);

  useEffect(() => {
    let isMounted = true;
    void AsyncStorage.getItem(REPEAT_STORAGE_KEY).then((saved) => {
      if (!isMounted || (saved !== 'none' && saved !== 'surah')) return;
      repeatModeRef.current = saved;
      setRepeatMode(saved);
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      ++operationIdRef.current;
      clearLoadingTimeout();
      const sound = soundRef.current;
      soundRef.current = null;
      void disposeSound(sound);
    };
  }, [clearLoadingTimeout]);

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
  }), [currentSurah, isPlaying, isLoading, position, duration, repeatMode, error, playSurah, togglePlayPause, stop, stopAndClear, seekTo, toggleRepeat, isCurrentSurah, dismissError]);
});
