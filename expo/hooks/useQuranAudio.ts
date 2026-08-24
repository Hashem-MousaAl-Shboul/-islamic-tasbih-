import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio, type AVPlaybackStatus } from 'expo-av';
import {
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from 'expo-av/build/Audio.types';
import createContextHook from '@nkzw/create-context-hook';

import {
  getQuranRecitationUrl,
  type ReciterId,
} from '@/utils/ttsService';
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

const LOADING_TIMEOUT = 15000;
const PROGRESS_UPDATE_INTERVAL = 500;
const POSITION_UPDATE_THRESHOLD = 200;

export const [QuranAudioProvider, useQuranAudio] =
  createContextHook(() => {
    const { currentReciter } = useReciterStore();
    const { t } = useLanguageStore();
    const { saveLastRead } = useQuranStore();

    // ------------------------------------------------------------
    // State
    // ------------------------------------------------------------

    const [currentSurah, setCurrentSurah] =
      useState<SurahMeta | null>(null);

    const [isPlaying, setIsPlaying] =
      useState(false);

    const [isLoading, setIsLoading] =
      useState(false);

    const [position, setPosition] =
      useState(0);

    const [duration, setDuration] =
      useState(0);

    const [repeatMode, setRepeatMode] =
      useState<RepeatMode>('none');

    const [error, setError] =
      useState<string | null>(null);

    // ------------------------------------------------------------
    // Refs
    // ------------------------------------------------------------

    const soundRef =
      useRef<Audio.Sound | null>(null);

    const currentSurahRef =
      useRef<SurahMeta | null>(null);

    const repeatModeRef =
      useRef<RepeatMode>('none');

    const isPlayingRef =
      useRef(false);

    const isLoadingRef =
      useRef(false);

    const isSeekingRef =
      useRef(false);

    const mountedRef =
      useRef(true);

    const operationIdRef =
      useRef(0);

    const loadingTimeoutRef =
      useRef<ReturnType<typeof setTimeout> | null>(null);

    const tRef = useRef(t);

    // ------------------------------------------------------------
    // Synchronize refs
    // ------------------------------------------------------------

    useEffect(() => {
      tRef.current = t;
    }, [t]);

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

    // ------------------------------------------------------------
    // Loading timeout
    // ------------------------------------------------------------

    const clearLoadingTimeout = useCallback(() => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }, []);

    // ------------------------------------------------------------
    // Audio setup
    // ------------------------------------------------------------

    const setupAudio = useCallback(async () => {
      if (Platform.OS === 'web') {
        return;
      }

      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,

          // Keep audio active when app goes to background.
          staysActiveInBackground: true,

          shouldDuckAndroid: true,

          interruptionModeAndroid:
            InterruptionModeAndroid.DuckOthers,

          interruptionModeIOS:
            InterruptionModeIOS.DuckOthers,

          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error(
          '[QuranAudio] Audio setup error:',
          error
        );
      }
    }, []);

    // ------------------------------------------------------------
    // Cleanup player
    // ------------------------------------------------------------

    const cleanupPlayer = useCallback(async () => {
      clearLoadingTimeout();

      const sound = soundRef.current;

      // Remove reference immediately so no new operation
      // can accidentally use a player being unloaded.
      soundRef.current = null;

      if (!sound) {
        return;
      }

      try {
        await sound.stopAsync();
      } catch {}

      try {
        await sound.unloadAsync();
      } catch (error) {
        console.log(
          '[QuranAudio] unloadAsync error:',
          error
        );
      }
    }, [clearLoadingTimeout]);

    // ------------------------------------------------------------
    // Playback status
    // ------------------------------------------------------------

    const handlePlaybackStatusUpdate = useCallback(
      (status: AVPlaybackStatus) => {
        if (!mountedRef.current) {
          return;
        }

        // --------------------------------------------------------
        // Audio not loaded / failed
        // --------------------------------------------------------

        if (!status.isLoaded) {
          const playbackError =
            'error' in status
              ? status.error
              : null;

          if (playbackError) {
            console.error(
              '[QuranAudio] Playback error:',
              playbackError
            );

            clearLoadingTimeout();

            isLoadingRef.current = false;
            isPlayingRef.current = false;

            setIsLoading(false);
            setIsPlaying(false);

            setError(
              tRef.current('audioNetworkError')
            );
          }

          return;
        }

        // --------------------------------------------------------
        // Loaded
        // --------------------------------------------------------

        clearLoadingTimeout();

        isLoadingRef.current = false;
        setIsLoading(false);

        const nextIsPlaying =
          Boolean(status.isPlaying);

        const nextPosition =
          Number(status.positionMillis ?? 0);

        const nextDuration =
          Number(status.durationMillis ?? 0);

        isPlayingRef.current =
          nextIsPlaying;

        setIsPlaying(prev =>
          prev !== nextIsPlaying
            ? nextIsPlaying
            : prev
        );

        // Do not fight the user's seek operation.
        if (!isSeekingRef.current) {
          setPosition(prev =>
            Math.abs(prev - nextPosition) >
            POSITION_UPDATE_THRESHOLD
              ? nextPosition
              : prev
          );
        }

        if (nextDuration > 0) {
          setDuration(prev =>
            prev !== nextDuration
              ? nextDuration
              : prev
          );
        }

        // --------------------------------------------------------
        // Surah finished
        // --------------------------------------------------------

        if (status.didJustFinish) {
          const sound = soundRef.current;

          if (!sound) {
            isPlayingRef.current = false;

            setIsPlaying(false);
            setPosition(0);

            return;
          }

          if (
            repeatModeRef.current === 'surah'
          ) {
            void (async () => {
              try {
                await sound.setPositionAsync(0);

                if (!mountedRef.current) {
                  return;
                }

                setPosition(0);

                await sound.playAsync();

                if (mountedRef.current) {
                  isPlayingRef.current = true;
                  setIsPlaying(true);
                }
              } catch (error) {
                console.error(
                  '[QuranAudio] Repeat error:',
                  error
                );

                if (mountedRef.current) {
                  isPlayingRef.current = false;

                  setIsPlaying(false);
                  setPosition(0);

                  setError(
                    tRef.current(
                      'audioNetworkError'
                    )
                  );
                }
              }
            })();
          } else {
            isPlayingRef.current = false;

            setIsPlaying(false);
            setPosition(0);
          }
        }
      },
      [clearLoadingTimeout]
    );

    // ------------------------------------------------------------
    // Play Surah
    // ------------------------------------------------------------

    const playSurah = useCallback(
      async (
        surah: SurahMeta,
        reciter?: ReciterId
      ) => {
        const reciterToUse =
          reciter ?? currentReciter;

        // --------------------------------------------------------
        // Same Surah
        // --------------------------------------------------------

        if (
          currentSurahRef.current?.number ===
            surah.number &&
          soundRef.current &&
          !isLoadingRef.current
        ) {
          const sound = soundRef.current;

          try {
            if (isPlayingRef.current) {
              await sound.pauseAsync();

              if (mountedRef.current) {
                isPlayingRef.current = false;
                setIsPlaying(false);
              }
            } else {
              const status =
                await sound.getStatusAsync();

              if (!status.isLoaded) {
                return;
              }

              const currentPosition =
                status.positionMillis ?? 0;

              const currentDuration =
                status.durationMillis ?? 0;

              if (
                currentDuration > 0 &&
                currentPosition >=
                  currentDuration
              ) {
                await sound.setPositionAsync(0);

                if (mountedRef.current) {
                  setPosition(0);
                }
              }

              await sound.playAsync();

              if (mountedRef.current) {
                isPlayingRef.current = true;
                setIsPlaying(true);
                setError(null);
              }
            }
          } catch (error) {
            console.error(
              '[QuranAudio] Existing sound error:',
              error
            );

            if (mountedRef.current) {
              isPlayingRef.current = false;
              setIsPlaying(false);

              setError(
                tRef.current(
                  'audioNetworkError'
                )
              );
            }
          }

          return;
        }

        // --------------------------------------------------------
        // New operation
        // --------------------------------------------------------

        const operationId =
          ++operationIdRef.current;

        try {
          if (Platform.OS !== 'web') {
            void Haptics.impactAsync(
              Haptics.ImpactFeedbackStyle.Light
            ).catch(() => {});
          }

          setError(null);

          isLoadingRef.current = true;
          isPlayingRef.current = false;

          setIsLoading(true);
          setIsPlaying(false);

          setCurrentSurah(surah);
          setPosition(0);
          setDuration(0);

          // ------------------------------------------------------
          // Stop YasAI
          // ------------------------------------------------------

          try {
            await stopYasAI();
          } catch (error) {
            console.log(
              '[QuranAudio] YasAI stop error:',
              error
            );
          }

          // ------------------------------------------------------
          // Remove previous Quran player
          // ------------------------------------------------------

          await cleanupPlayer();

          // ------------------------------------------------------
          // Make sure this request is still current
          // ------------------------------------------------------

          if (
            operationId !==
            operationIdRef.current
          ) {
            return;
          }

          // ------------------------------------------------------
          // Get audio URL
          // ------------------------------------------------------

          const audioUrl =
            getQuranRecitationUrl(
              surah.number,
              reciterToUse
            );

          console.log(
            `[QuranAudio] Loading Surah ${surah.number} with reciter ${reciterToUse}`
          );

          if (!audioUrl) {
            throw new Error(
              'Audio URL is empty'
            );
          }

          // ------------------------------------------------------
          // Configure audio
          // ------------------------------------------------------

          await setupAudio();

          if (
            operationId !==
            operationIdRef.current
          ) {
            return;
          }

          // ------------------------------------------------------
          // Create player
          // ------------------------------------------------------

          const { sound, status } =
            await Audio.Sound.createAsync(
              { uri: audioUrl },
              {
                shouldPlay: true,
                isLooping: false,
                volume: 1.0,

                // More responsive position updates.
                progressUpdateIntervalMillis:
                  PROGRESS_UPDATE_INTERVAL,
              },
              handlePlaybackStatusUpdate,
              false
            );

          // ------------------------------------------------------
          // Operation became obsolete
          // ------------------------------------------------------

          if (
            operationId !==
              operationIdRef.current ||
            !mountedRef.current
          ) {
            try {
              await sound.unloadAsync();
            } catch {}

            return;
          }

          soundRef.current = sound;

          // ------------------------------------------------------
          // Initial status
          // ------------------------------------------------------

          if (status.isLoaded) {
            const initialPosition =
              status.positionMillis ?? 0;

            const initialDuration =
              status.durationMillis ?? 0;

            const initialPlaying =
              Boolean(status.isPlaying);

            setPosition(
              initialPosition
            );

            setDuration(
              initialDuration
            );

            isPlayingRef.current =
              initialPlaying;

            setIsPlaying(
              initialPlaying
            );
          }

          // ------------------------------------------------------
          // Safety timeout
          // ------------------------------------------------------

          clearLoadingTimeout();

          loadingTimeoutRef.current =
            setTimeout(() => {
              loadingTimeoutRef.current =
                null;

              if (
                operationId !==
                operationIdRef.current
              ) {
                return;
              }

              if (isLoadingRef.current) {
                console.warn(
                  '[QuranAudio] Loading timeout'
                );

                isLoadingRef.current =
                  false;

                if (mountedRef.current) {
                  setIsLoading(false);
                }
              }
            }, LOADING_TIMEOUT);

          // ------------------------------------------------------
          // Save last read
          // ------------------------------------------------------

          void saveLastRead({
            surahNumber: surah.number,
            surahName: surah.name,
            surahEnglishName:
              surah.englishName,
            ayahNumber: 1,
            timestamp: Date.now(),
          }).catch(error => {
            console.log(
              '[QuranAudio] saveLastRead error:',
              error
            );
          });
        } catch (error) {
          console.error(
            '[QuranAudio] Play surah error:',
            error
          );

          if (
            operationId !==
            operationIdRef.current
          ) {
            return;
          }

          clearLoadingTimeout();

          await cleanupPlayer();

          isLoadingRef.current = false;
          isPlayingRef.current = false;

          if (mountedRef.current) {
            setIsLoading(false);
            setIsPlaying(false);

            setPosition(0);
            setDuration(0);

            setCurrentSurah(null);

            setError(
              tRef.current(
                'audioNetworkError'
              )
            );
          }
        }
      },
      [
        currentReciter,
        cleanupPlayer,
        setupAudio,
        clearLoadingTimeout,
        handlePlaybackStatusUpdate,
        saveLastRead,
      ]
    );

    // ------------------------------------------------------------
    // Toggle play / pause
    // ------------------------------------------------------------

    const togglePlayPause = useCallback(
      async () => {
        const sound =
          soundRef.current;

        if (
          !sound ||
          !currentSurahRef.current ||
          isLoadingRef.current
        ) {
          return;
        }

        try {
          if (isPlayingRef.current) {
            await sound.pauseAsync();

            if (mountedRef.current) {
              isPlayingRef.current = false;
              setIsPlaying(false);
            }

            return;
          }

          const status =
            await sound.getStatusAsync();

          if (!status.isLoaded) {
            return;
          }

          const currentPosition =
            status.positionMillis ?? 0;

          const currentDuration =
            status.durationMillis ?? 0;

          if (
            currentDuration > 0 &&
            currentPosition >=
              currentDuration
          ) {
            await sound.setPositionAsync(0);

            if (mountedRef.current) {
              setPosition(0);
            }
          }

          await sound.playAsync();

          if (mountedRef.current) {
            isPlayingRef.current = true;
            setIsPlaying(true);
            setError(null);
          }
        } catch (error) {
          console.error(
            '[QuranAudio] Toggle error:',
            error
          );

          if (mountedRef.current) {
            isPlayingRef.current = false;

            setIsPlaying(false);

            setError(
              tRef.current(
                'audioNetworkError'
              )
            );
          }
        }
      },
      []
    );

    // ------------------------------------------------------------
    // Stop
    // ------------------------------------------------------------

    const stop = useCallback(
      async () => {
        const sound =
          soundRef.current;

        if (!sound) {
          return;
        }

        try {
          await sound.stopAsync();

          if (mountedRef.current) {
            isPlayingRef.current = false;

            setIsPlaying(false);
            setPosition(0);
          }
        } catch (error) {
          console.error(
            '[QuranAudio] Stop error:',
            error
          );
        }
      },
      []
    );

    // ------------------------------------------------------------
    // Stop + clear
    // ------------------------------------------------------------

    const stopAndClear =
      useCallback(async () => {
        // Invalidate all previous async operations.
        ++operationIdRef.current;

        try {
          await cleanupPlayer();

          isLoadingRef.current = false;
          isPlayingRef.current = false;

          if (!mountedRef.current) {
            return;
          }

          setIsLoading(false);
          setIsPlaying(false);

          setPosition(0);
          setDuration(0);

          setCurrentSurah(null);

          setError(null);
        } catch (error) {
          console.error(
            '[QuranAudio] Stop and clear error:',
            error
          );
        }
      }, [cleanupPlayer]);

    // ------------------------------------------------------------
    // Seek
    // ------------------------------------------------------------

    const seekTo = useCallback(
      async (millis: number) => {
        const sound =
          soundRef.current;

        if (!sound) {
          return;
        }

        try {
          const status =
            await sound.getStatusAsync();

          if (!status.isLoaded) {
            return;
          }

          const maxPosition =
            status.durationMillis ??
            duration;

          const requestedPosition =
            Number.isFinite(millis)
              ? millis
              : 0;

          const safePosition =
            Math.max(
              0,
              Math.min(
                requestedPosition,
                maxPosition
              )
            );

          isSeekingRef.current = true;

          setPosition(safePosition);

          await sound.setPositionAsync(
            safePosition
          );
        } catch (error) {
          console.error(
            '[QuranAudio] Seek error:',
            error
          );
        } finally {
          isSeekingRef.current = false;
        }
      },
      [duration]
    );

    // ------------------------------------------------------------
    // Toggle repeat
    // ------------------------------------------------------------

    const toggleRepeat =
      useCallback(async () => {
        const newMode: RepeatMode =
          repeatModeRef.current === 'none'
            ? 'surah'
            : 'none';

        repeatModeRef.current =
          newMode;

        if (mountedRef.current) {
          setRepeatMode(newMode);
        }

        try {
          await saveRepeatMode(
            newMode
          );
        } catch (error) {
          console.log(
            '[QuranAudio] Save repeat error:',
            error
          );
        }

        if (Platform.OS !== 'web') {
          void Haptics.impactAsync(
            Haptics.ImpactFeedbackStyle.Light
          ).catch(() => {});
        }
      }, []);

    // ------------------------------------------------------------
    // Current Surah
    // ------------------------------------------------------------

    const isCurrentSurah =
      useCallback(
        (surahNumber: number) => {
          return (
            currentSurahRef.current
              ?.number === surahNumber
          );
        },
        []
      );

    // ------------------------------------------------------------
    // Dismiss error
    // ------------------------------------------------------------

    const dismissError =
      useCallback(() => {
        if (mountedRef.current) {
          setError(null);
        }
      }, []);

    // ------------------------------------------------------------
    // Load repeat mode
    // ------------------------------------------------------------

    useEffect(() => {
      let mounted = true;

      const loadRepeatMode =
        async () => {
          try {
            const saved =
              await getStoredRepeatMode();

            if (
              !mounted ||
              !saved
            ) {
              return;
            }

            repeatModeRef.current =
              saved;

            setRepeatMode(saved);
          } catch (error) {
            console.log(
              '[QuranAudio] Load repeat mode error:',
              error
            );
          }
        };

      void loadRepeatMode();

      return () => {
        mounted = false;
      };
    }, []);

    // ------------------------------------------------------------
    // Provider cleanup
    // ------------------------------------------------------------

    useEffect(() => {
      mountedRef.current = true;

      return () => {
        mountedRef.current = false;

        // Invalidate pending operations.
        ++operationIdRef.current;

        clearLoadingTimeout();

        const sound =
          soundRef.current;

        soundRef.current = null;

        if (sound) {
          void sound.unloadAsync()
            .catch(() => {});
        }
      };
    }, [clearLoadingTimeout]);

    // ------------------------------------------------------------
    // Context value
    // ------------------------------------------------------------

    return useMemo(
      () => ({
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
      }),
      [
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
      ]
    );
  });

// ============================================================
// AsyncStorage
// ============================================================

async function getStoredRepeatMode(): Promise<RepeatMode | null> {
  try {
    const {
      default: AsyncStorage,
    } = await import(
      '@react-native-async-storage/async-storage'
    );

    const saved =
      await AsyncStorage.getItem(
        REPEAT_STORAGE_KEY
      );

    if (
      saved === 'none' ||
      saved === 'surah'
    ) {
      return saved;
    }

    return null;
  } catch (error) {
    console.log(
      '[QuranAudio] Error reading repeat mode:',
      error
    );

    return null;
  }
}

async function saveRepeatMode(
  mode: RepeatMode
): Promise<void> {
  try {
    const {
      default: AsyncStorage,
    } = await import(
      '@react-native-async-storage/async-storage'
    );

    await AsyncStorage.setItem(
      REPEAT_STORAGE_KEY,
      mode
    );
  } catch (error) {
    console.log(
      '[QuranAudio] Error saving repeat mode:',
      error
    );
  }
}