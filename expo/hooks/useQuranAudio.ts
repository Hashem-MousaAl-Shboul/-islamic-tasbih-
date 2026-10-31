import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from 'expo-audio';
import { useQuery } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';

import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useQuranStore } from '@/hooks/useQuranStore';
import { useReciterStore } from '@/hooks/useReciterStore';
import type { SurahMeta } from '@/utils/quranData';
import {
  clampPageNumber,
  clampSurahNumber,
  fetchPageVerses,
  fetchSurahVerses,
  type SurahTextResult,
} from '@/utils/quranApi';
import { getQuranRecitationUrl, type ReciterId } from '@/utils/ttsService';
import { stopAudio as stopYasAI } from '@/utils/yasAI';

export type RepeatMode = 'none' | 'surah';

/** هدف جلب النص: سورة كاملة أو صفحة مصحفية */
export type QuranTextTarget =
  | { kind: 'surah'; number: number }
  | { kind: 'page'; number: number };

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

async function disposeSound(player: AudioPlayer | null): Promise<void> {
  if (!player) return;
  try {
    player.pause();
  } catch {}
  try {
    player.remove();
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
  const [textTarget, setTextTarget] = useState<QuranTextTarget | null>(null);

  // —— جلب نصوص القرآن (الجسر الوحيد بين API والشاشات) ——
  // React Query يتكفل بالتخزين المؤقت (النصوص لا تتغير) وإعادة المحاولة.
  const {
    data: textData,
    isLoading: isTextLoading,
    isError: hasTextError,
    isFetching: isTextFetching,
    refetch: refetchText,
  } = useQuery<SurahTextResult>({
    queryKey: textTarget
      ? ['quran-text', textTarget.kind, textTarget.number]
      : ['quran-text', 'idle'],
    queryFn: () => {
      if (!textTarget) throw new Error('No text target');
      return textTarget.kind === 'page'
        ? fetchPageVerses(textTarget.number)
        : fetchSurahVerses(textTarget.number);
    },
    enabled: textTarget !== null,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });

  const surahText: SurahTextResult | null = textTarget ? textData ?? null : null;
  const isLoadingText: boolean = textTarget !== null && isTextLoading;
  const isTextError: boolean = textTarget !== null && hasTextError;

  const loadSurahText = useCallback((surahNumber: number): void => {
    setTextTarget({ kind: 'surah', number: clampSurahNumber(surahNumber) });
  }, []);

  const loadPageText = useCallback((pageNumber: number): void => {
    setTextTarget({ kind: 'page', number: clampPageNumber(pageNumber) });
  }, []);

  const retryText = useCallback((): void => {
    void refetchText();
  }, [refetchText]);

  const clearText = useCallback((): void => {
    setTextTarget(null);
  }, []);

  const soundRef = useRef<AudioPlayer | null>(null);
  const statusSubRef = useRef<{ remove: () => void } | null>(null);
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
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'duckOthers',
      shouldRouteThroughEarpiece: false,
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
    const sub = statusSubRef.current;
    statusSubRef.current = null;
    try { sub?.remove(); } catch {}
    const sound = soundRef.current;
    soundRef.current = null;
    await disposeSound(sound);
  }, [clearLoadingTimeout]);

  const failOperation = useCallback((operationId: number, sound: AudioPlayer): void => {
    if (!isMountedRef.current || operationId !== operationIdRef.current || soundRef.current !== sound) return;
    ++operationIdRef.current;
    clearLoadingTimeout();
    const sub = statusSubRef.current;
    statusSubRef.current = null;
    try { sub?.remove(); } catch {}
    soundRef.current = null;
    void disposeSound(sound);
    resetPlaybackState(true);
    setError(tRef.current('audioNetworkError'));
  }, [clearLoadingTimeout, resetPlaybackState]);

  const createStatusHandler = useCallback((operationId: number, sound: AudioPlayer) => {
    return (status: AudioStatus): void => {
      if (!isMountedRef.current || operationId !== operationIdRef.current || soundRef.current !== sound) return;
      if (!status.isLoaded) {
        if (status.error) failOperation(operationId, sound);
        return;
      }

      clearLoadingTimeout();
      if (isLoadingRef.current) {
        isLoadingRef.current = false;
        setIsLoading(false);
      }

      const nextIsPlaying = Boolean(status.playing);
      const nextPosition = (status.currentTime ?? 0) * 1000;
      const nextDuration = (status.duration ?? 0) * 1000;
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
          await sound.seekTo(0);
          if (operationId !== operationIdRef.current || soundRef.current !== sound) return;
          setPosition(0);
          sound.play();
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
          sound.pause();
          isPlayingRef.current = false;
          if (isMountedRef.current) setIsPlaying(false);
        } else {
          if (!sound.isLoaded) return;
          const durationMillis = (sound.duration ?? 0) * 1000;
          if (durationMillis > 0 && (sound.currentTime ?? 0) * 1000 >= durationMillis) {
            await sound.seekTo(0);
            if (isMountedRef.current) setPosition(0);
          }
          sound.play();
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

      const sound = createAudioPlayer(
        { uri: audioUrl },
        { updateInterval: PROGRESS_UPDATE_INTERVAL_MS }
      );
      soundRef.current = sound;
      statusSubRef.current = sound.addListener('playbackStatusUpdate', createStatusHandler(operationId, sound));
      loadingTimeoutRef.current = setTimeout(() => {
        loadingTimeoutRef.current = null;
        failOperation(operationId, sound);
      }, LOADING_TIMEOUT_MS);

      sound.play();

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
        sound.pause();
        isPlayingRef.current = false;
        if (isMountedRef.current) setIsPlaying(false);
        return;
      }
      if (!sound.isLoaded) return;
      const durationMillis = (sound.duration ?? 0) * 1000;
      if (durationMillis > 0 && (sound.currentTime ?? 0) * 1000 >= durationMillis) {
        await sound.seekTo(0);
        if (isMountedRef.current) setPosition(0);
      }
      sound.play();
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
      if (!sound.isLoaded) return;
      const maxPosition = (sound.duration ?? duration / 1000) * 1000;
      const requested = Number.isFinite(millis) ? millis : 0;
      const safePosition = Math.max(0, Math.min(requested, maxPosition));
      isSeekingRef.current = true;
      setPosition(safePosition);
      await sound.seekTo(safePosition / 1000);
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
      const sub = statusSubRef.current;
      statusSubRef.current = null;
      try { sub?.remove(); } catch {}
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
    surahText,
    isLoadingText,
    isTextError,
    isTextFetching,
    loadSurahText,
    loadPageText,
    retryText,
    clearText,
  }), [currentSurah, isPlaying, isLoading, position, duration, repeatMode, error, playSurah, togglePlayPause, stop, stopAndClear, seekTo, toggleRepeat, isCurrentSurah, dismissError, surahText, isLoadingText, isTextError, isTextFetching, loadSurahText, loadPageText, retryText, clearText]);
});
