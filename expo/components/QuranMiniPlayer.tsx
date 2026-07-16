import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Play,
  Pause,
  Square,
  X,
  Repeat,
  Repeat1,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useQuranAudio } from '@/hooks/useQuranAudio';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { androidTextFix } from '@/utils/androidOptimizations';

const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';
const DARK_BG = '#1B1F2E';
const IVORY = '#F7F4EE';

/**
 * Mini audio player bar shown at the bottom of the Quran screen.
 * Shows current surah name, progress bar, play/pause, stop, and repeat controls.
 * Audio continues playing when navigating between tabs.
 */
export default function QuranMiniPlayer() {
  const {
    currentSurah,
    isPlaying,
    isLoading,
    position,
    duration,
    repeatMode,
    error,
    togglePlayPause,
    stop,
    stopAndClear,
    toggleRepeat,
    dismissError,
  } = useQuranAudio();
  const { t } = useLanguageStore();

  const progressPercentage = useMemo(() => {
    return duration > 0 ? (position / duration) * 100 : 0;
  }, [position, duration]);

  const formatTime = useCallback((millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const handleStop = useCallback(async () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    await stopAndClear();
  }, [stopAndClear]);

  const handlePauseStop = useCallback(async () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    await stop();
  }, [stop]);

  // Show error alert when there's an audio error
  React.useEffect(() => {
    if (error) {
      Alert.alert(t('error'), error, [
        { text: t('ok'), onPress: dismissError },
      ]);
    }
  }, [error, t, dismissError]);

  if (!currentSurah) return null;

  return (
    <View style={styles.container} testID="quran-mini-player">
      {/* Progress bar at top edge */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
      </View>

      <View style={styles.content}>
        {/* Surah info section */}
        <View style={styles.infoSection}>
          <View style={styles.surahIcon}>
            <Text style={[styles.surahNumber, androidTextFix]}>
              {currentSurah.number}
            </Text>
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[styles.surahName, androidTextFix]}
              numberOfLines={1}
            >
              {currentSurah.name}
            </Text>
            <Text style={[styles.statusText, androidTextFix]}>
              {isLoading ? t('loading') : isPlaying ? t('nowPlaying') : ''}
            </Text>
          </View>
        </View>

        {/* Controls section */}
        <View style={styles.controlsRow}>
          {/* Repeat button */}
          <TouchableOpacity
            style={[
              styles.auxButton,
              repeatMode === 'surah' && styles.auxButtonActive,
            ]}
            onPress={toggleRepeat}
            activeOpacity={0.7}
            accessibilityLabel={t('repeatSurah')}
            testID="mini-player-repeat"
          >
            {repeatMode === 'surah' ? (
              <Repeat1
                size={18}
                color={repeatMode === 'surah' ? GOLD : IVORY}
              />
            ) : (
              <Repeat size={18} color={IVORY} />
            )}
          </TouchableOpacity>

          {/* Play/Pause button */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayPause}
            activeOpacity={0.8}
            disabled={isLoading}
            accessibilityLabel={isPlaying ? t('stopRecitation') : t('reciteSurah')}
            testID="mini-player-play"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={DARK_BG} />
            ) : isPlaying ? (
              <Pause size={22} color={DARK_BG} fill={DARK_BG} />
            ) : (
              <Play size={22} color={DARK_BG} fill={DARK_BG} />
            )}
          </TouchableOpacity>

          {/* Stop button */}
          <TouchableOpacity
            style={styles.auxButton}
            onPress={handlePauseStop}
            activeOpacity={0.7}
            disabled={!isPlaying && position === 0}
            accessibilityLabel={t('stopRecitation')}
            testID="mini-player-stop"
          >
            <Square
              size={16}
              color={(!isPlaying && position === 0) ? '#555' : IVORY}
              fill={(!isPlaying && position === 0) ? '#555' : IVORY}
            />
          </TouchableOpacity>

          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleStop}
            activeOpacity={0.7}
            accessibilityLabel={t('closePlayer')}
            testID="mini-player-close"
          >
            <X size={18} color="#888" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Time row */}
      {(duration > 0 || position > 0) && (
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DEEP_GREEN,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1.5,
    marginBottom: 10,
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 1.5,
  },
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  infoSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
    gap: 10,
  },
  surahIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: GOLD,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  surahNumber: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: GOLD,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  surahName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    writingDirection: 'rtl',
    textAlign: 'left',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  auxButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  auxButtonActive: {
    backgroundColor: 'rgba(212,168,83,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(212,168,83,0.4)',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GOLD,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  timeRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginTop: 6,
    paddingHorizontal: 2,
  },
  timeText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '500' as const,
  },
});
