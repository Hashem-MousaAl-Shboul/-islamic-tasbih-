import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Platform, Alert } from 'react-native';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import createContextHook from '@nkzw/create-context-hook';

import { getQuranRecitationUrl, type ReciterId } from '@/utils/ttsService';
import { useReciterStore } from '@/hooks/useReciterStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useQuranStore } from '@/hooks/useQuranStore';
import { getSurahByNumber, type SurahMeta } from '@/utils/quranData';
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

  const playerRef = useRef<AudioPlayer | null>(null);
  const statusListenerRef = useRef<{ remove: () => void } | null>(null);
  const repeatModeRef = useRef<RepeatMode>('none');
  const currentSurahRef = useRef<SurahMeta | null>(null);
  const isSeekingRef = useRef<boolean>(false);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    currentSurahRef.current = currentSurah;
  }, [currentSurah]);

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
      if (statusListenerRef.current) {
        try { statusListenerRef.current.remove(); } catch {}
        statusListenerRef.current = null;
      }
      if (playerRef.current) {
        try { playerRef.current.remove(); } catch {}
        playerRef.current = null;
      }
    };
  }, []);

  const setupAudio = useCallback(async () => {
    try {
      if (Platform.OS !== 'web') {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'duckOthers',
          shouldRouteThroughEarpiece: false,
          allowsRecording: false,
        });
      }
    } catch (error) {
      console.error('[QuranAudio] Audio setup error:', error);
    }
  }, []);

  const cleanupPlayer = useCallback(() => {
    if (statusListenerRef.current) {
      try { statusListenerRef.current.remove(); } catch {}
      statusListenerRef.current = null;
    }
    if (playerRef.current) {
      try { playerRef.current.remove(); } catch {}
      playerRef.current = null;
    }
  }, []);

  const playSurah = useCallback(async (surah: SurahMeta, reciter?: ReciterId) => {
    const reciterToUse = reciter ?? currentReciter;

    try {
      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }

      setError(null);

      // If same surah is already playing, toggle pause
      if (currentSurahRef.current?.number === surah.number && playerRef.current) {
        if (isPlaying) {
          playerRef.current.pause();
          setIsPlaying(false);
        } else {
          if (playerRef.current.currentTime >= playerRef.current.duration && playerRef.current.duration > 0) {
            await playerRef.current.seekTo(0);
          }
          playerRef.current.play();
          setIsPlaying(true);
        }
        return;
      }

      // Stop YasAI if playing
      try { await stopYasAI(); } catch {}

      // Cleanup existing player
      cleanupPlayer();

      setIsLoading(true);
      setCurrentSurah(surah);
      setPosition(0);
      setDuration(0);

      const audioUrl = getQuranRecitationUrl(surah.number, reciterToUse);
      if (!audioUrl) {
        setError(t('errorLoadingVerses'));
        setIsLoading(false);
        setCurrentSurah(null);
        return;
      }

      await setupAudio();

      const newPlayer = createAudioPlayer({ uri: audioUrl });
      newPlayer.volume = 1.0;

      statusListenerRef.current = newPlayer.addListener('playbackStatusUpdate', (status: any) => {
        if (!status?.isLoaded) return;
        if (status.error) {
          console.error('[QuranAudio] Player error:', status.error);
          setError(t('audioNetworkError'));
          setIsPlaying(false);
          setIsLoading(false);
          return;
        }
        const nextIsPlaying = Boolean(status.playing);
        const nextPos = Number(status.currentTime ?? 0) * 1000;
        const nextDur = Number(status.duration ?? 0) * 1000;

        setIsPlaying(prev => (prev !== nextIsPlaying ? nextIsPlaying : prev));
        if (!isSeekingRef.current) {
          setPosition(prev => (Math.abs(prev - nextPos) > 200 ? nextPos : prev));
        }
        setDuration(prev => (prev !== nextDur && nextDur > 0 ? nextDur : prev));

        if (status.didJustFinish) {
          if (repeatModeRef.current === 'surah') {
            // Repeat the surah
            try {
              newPlayer.seekTo(0);
              newPlayer.play();
              setPosition(0);
            } catch (e) {
              console.error('[QuranAudio] Repeat error:', e);
              setIsPlaying(false);
              setPosition(0);
            }
          } else {
            setIsPlaying(false);
            setPosition(0);
          }
        }
      });

      playerRef.current = newPlayer;
      newPlayer.play();
      setIsPlaying(true);
      setIsLoading(false);

      // Save last read
      void saveLastRead({
        surahNumber: surah.number,
        surahName: surah.name,
        surahEnglishName: surah.englishName,
        ayahNumber: 1,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('[QuranAudio] Play surah error:', error);
      setError(t('audioNetworkError'));
      setIsLoading(false);
      setIsPlaying(false);
      setCurrentSurah(null);
    }
  }, [currentReciter, setupAudio, cleanupPlayer, t, saveLastRead]);

  const togglePlayPause = useCallback(async () => {
    if (!playerRef.current || !currentSurahRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pause();
        setIsPlaying(false);
      } else {
        if (playerRef.current.currentTime >= playerRef.current.duration && playerRef.current.duration > 0) {
          await playerRef.current.seekTo(0);
          setPosition(0);
        }
        playerRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('[QuranAudio] Toggle play/pause error:', error);
    }
  }, [isPlaying]);

  const stop = useCallback(async () => {
    try {
      if (playerRef.current) {
        playerRef.current.pause();
        await playerRef.current.seekTo(0);
      }
      setIsPlaying(false);
      setPosition(0);
    } catch (error) {
      console.error('[QuranAudio] Stop error:', error);
    }
  }, []);

  const stopAndClear = useCallback(async () => {
    try {
      cleanupPlayer();
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
    if (!playerRef.current) return;
    try {
      isSeekingRef.current = true;
      await playerRef.current.seekTo(millis / 1000);
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
