import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
  LayoutChangeEvent,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Play,
  Pause,
  Square,
  ChevronLeft,
  Volume2,
  RotateCcw,
  Repeat,
  Repeat1,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useReciterStore } from '@/hooks/useReciterStore';
import { useQuranStore } from '@/hooks/useQuranStore';
import { useQuranAudio } from '@/hooks/useQuranAudio';
import { RECITER_NAMES, type ReciterId } from '@/utils/ttsService';
import { getSurahByNumber, TOTAL_PAGES } from '@/utils/quranData';
import FullSurahDisplay from '@/components/FullSurahDisplay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { androidTextFix } from '@/utils/androidOptimizations';
import { createShadow } from '@/utils/shadowUtils';

// ثيم «القرآن» المرجعي (أخضر مريمي فاتح)
const GREEN_DARK = '#3E6B54';
const GREEN_MUTED = '#8FA892';
const READER_BG = '#F7F5EE';
const CARD_WHITE = '#FFFFFF';
const CARD_BORDER = 'rgba(62,107,84,0.15)';
const TEXT_DARK = '#2F3B33';
const TEXT_DISABLED = '#B9C4BA';

export default function QuranReaderScreen() {
  const params = useLocalSearchParams<{ surah?: string; ayah?: string; page?: string }>();
  const router = useRouter();
  const { t } = useLanguageStore();
  const { currentReciter, changeReciter } = useReciterStore();
  const { saveLastRead } = useQuranStore();
  const {
    isPlaying,
    isLoading: isLoadingAudio,
    position,
    duration,
    repeatMode,
    error: audioError,
    playSurah,
    togglePlayPause,
    stop,
    seekTo,
    toggleRepeat,
    isCurrentSurah,
    dismissError,
    surahText,
  } = useQuranAudio();
  const insets = useSafeAreaInsets();

  const pageNumber = params.page ? parseInt(params.page, 10) : undefined;
  const isPageMode = pageNumber !== undefined && !isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= TOTAL_PAGES;
  const surahNumber = Math.min(Math.max(parseInt(params.surah ?? '1', 10) || 1, 1), 114);
  const ayahNumber = params.ayah ? parseInt(params.ayah, 10) : undefined;
  const surahMeta = useMemo(() => getSurahByNumber(surahNumber), [surahNumber]);

  const [showReciterPicker, setShowReciterPicker] = useState<boolean>(false);
  const [progressBarWidth, setProgressBarWidth] = useState<number>(Dimensions.get('window').width - 40);

  // النص يأتي من useQuranAudio (الجسر الوحيد) — العرض في FullSurahDisplay
  const verses = surahText?.verses ?? null;
  const displaySurahName = surahText?.surahName ?? surahMeta?.name ?? t('quranKareem');

  useEffect(() => {
    if (!isPageMode && surahMeta) {
      void saveLastRead({
        surahNumber,
        surahName: surahMeta.name,
        surahEnglishName: surahMeta.englishName,
        ayahNumber: ayahNumber ?? 1,
        timestamp: Date.now(),
      });
    }
  }, [surahNumber, surahMeta, ayahNumber, saveLastRead, isPageMode]);

  const audioErrorRef = useRef<string | null>(null);
  const tRef = useRef(t);
  useEffect(() => { tRef.current = t; }, [t]);
  useEffect(() => {
    if (audioError && audioError !== audioErrorRef.current) {
      audioErrorRef.current = audioError;
      Alert.alert(tRef.current('error'), audioError, [
        { text: tRef.current('ok'), onPress: () => {
          audioErrorRef.current = null;
          dismissError();
        } },
      ]);
    }
  }, [audioError, dismissError]);

  const isThisSurahPlaying = isPageMode
    ? (verses?.[0] ? isCurrentSurah(verses[0].surahNumber) : false)
    : isCurrentSurah(surahNumber);

  const handlePlayPause = useCallback(async () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (isPageMode) {
      const firstSurahMeta = verses?.[0] ? getSurahByNumber(verses[0].surahNumber) : null;
      if (firstSurahMeta) {
        await playSurah(firstSurahMeta);
      }
    } else if (!isThisSurahPlaying && surahMeta) {
      await playSurah(surahMeta);
    } else {
      await togglePlayPause();
    }
  }, [isPageMode, isThisSurahPlaying, surahMeta, playSurah, togglePlayPause, verses]);

  const handleStop = useCallback(async () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    await stop();
  }, [stop]);

  const handleRestart = useCallback(async () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    const targetSurah = isPageMode
      ? (verses?.[0] ? getSurahByNumber(verses[0].surahNumber) : null)
      : surahMeta;
    if (!targetSurah) return;
    if (isCurrentSurah(targetSurah.number)) {
      await seekTo(0);
      if (!isPlaying) await togglePlayPause();
    } else {
      await playSurah(targetSurah);
    }
  }, [isPageMode, surahMeta, verses, isCurrentSurah, seekTo, isPlaying, togglePlayPause, playSurah]);

  const handleReciterSelect = useCallback(async (reciter: ReciterId) => {
    setShowReciterPicker(false);
    await changeReciter(reciter);
    if (isPageMode) {
      const firstSurahMeta = verses?.[0] ? getSurahByNumber(verses[0].surahNumber) : null;
      if (firstSurahMeta && (isPlaying || isThisSurahPlaying)) {
        await playSurah(firstSurahMeta, reciter);
      }
    } else if (isThisSurahPlaying && surahMeta) {
      await playSurah(surahMeta, reciter);
    }
  }, [changeReciter, isThisSurahPlaying, isPlaying, surahMeta, playSurah, isPageMode, verses]);

  const handleBack = useCallback(() => {
    try {
      if (Platform.OS !== 'web' && router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/quran');
      }
    } catch {
      router.replace('/(tabs)/quran');
    }
  }, [router]);

  const handleSeek = useCallback((millis: number) => {
    void seekTo(millis);
  }, [seekTo]);

  const handleProgressBarLayout = useCallback((e: LayoutChangeEvent) => {
    setProgressBarWidth(e.nativeEvent.layout.width);
  }, []);

  const formatTime = useCallback((millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const progressPercentage = useMemo(() => {
    return duration > 0 ? (position / duration) * 100 : 0;
  }, [position, duration]);

  return (
    <View style={styles.container} testID="quran-reader-screen">
      <ReaderHeader title={displaySurahName} onBack={handleBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.quranPageContainer,
          { paddingBottom: 200 + insets.bottom },
        ]}
      >
        <FullSurahDisplay
          surahNumber={isPageMode ? undefined : surahNumber}
          pageNumber={pageNumber}
        />
      </ScrollView>

      {/* Audio Player Bar */}
      <View style={[styles.audioBar, { paddingBottom: 16 + insets.bottom }]}>
        <View style={styles.audioBarTop}>
          <TouchableOpacity
            style={styles.reciterButton}
            onPress={() => setShowReciterPicker(true)}
          >
            <Volume2 size={16} color={GREEN_DARK} />
            <Text style={[styles.reciterButtonText, androidTextFix]} numberOfLines={1}>
              {RECITER_NAMES[currentReciter]}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.surahLabel, androidTextFix]} numberOfLines={1}>
            {isPageMode ? `${t('page')} ${pageNumber}` : surahMeta?.name}
          </Text>
        </View>

        {isThisSurahPlaying && duration > 0 && (
          <View style={styles.progressContainer}>
            <TouchableOpacity
              style={styles.progressBar}
              activeOpacity={1}
              onLayout={handleProgressBarLayout}
              onPress={(e) => {
                const { locationX } = e.nativeEvent;
                if (progressBarWidth > 0 && duration > 0) {
                  const pct = Math.max(0, Math.min(1, locationX / progressBarWidth));
                  void handleSeek(pct * duration);
                }
              }}
            >
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </TouchableOpacity>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        )}

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              repeatMode === 'surah' && styles.controlButtonActive,
            ]}
            onPress={toggleRepeat}
          >
            {repeatMode === 'surah' ? (
              <Repeat1 size={18} color={GREEN_DARK} />
            ) : (
              <Repeat size={18} color={GREEN_MUTED} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleStop}
            disabled={!isThisSurahPlaying && !isLoadingAudio}
          >
            <Square
              size={18}
              color={(!isThisSurahPlaying && !isLoadingAudio) ? TEXT_DISABLED : GREEN_DARK}
              fill={(!isThisSurahPlaying && !isLoadingAudio) ? TEXT_DISABLED : GREEN_DARK}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playButton, isLoadingAudio && styles.playButtonDisabled]}
            onPress={handlePlayPause}
            disabled={isLoadingAudio}
          >
            {isLoadingAudio ? (
              <ActivityIndicator size="small" color={CARD_WHITE} />
            ) : (isThisSurahPlaying && isPlaying) ? (
              <Pause size={26} color={CARD_WHITE} fill={CARD_WHITE} />
            ) : (
              <Play size={26} color={CARD_WHITE} fill={CARD_WHITE} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleRestart}
            disabled={isLoadingAudio}
          >
            <RotateCcw size={18} color={isLoadingAudio ? TEXT_DISABLED : GREEN_DARK} />
          </TouchableOpacity>

          <View style={styles.controlButtonSpacer} />
        </View>
      </View>

      {/* Reciter Picker Modal */}
      <Modal
        visible={showReciterPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReciterPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, androidTextFix]}>{t('selectReciterTitle')}</Text>
              <TouchableOpacity onPress={() => setShowReciterPicker(false)}>
                <Text style={[styles.modalClose, androidTextFix]}>{t('close')}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {(Object.keys(RECITER_NAMES) as ReciterId[]).map((id) => (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.reciterOption,
                    currentReciter === id && styles.reciterOptionActive,
                  ]}
                  onPress={() => handleReciterSelect(id)}
                >
                  <Text
                    style={[
                      styles.reciterOptionText,
                      currentReciter === id && styles.reciterOptionTextActive,
                      androidTextFix,
                    ]}
                  >
                    {RECITER_NAMES[id]}
                  </Text>
                  {currentReciter === id ? (
                    <Text style={styles.checkMark}>✓</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ReaderHeader({ title, onBack }: { title: string; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[readerHeaderStyles.header, { paddingTop: insets.top }]}>
      <View style={readerHeaderStyles.content}>
        <TouchableOpacity
          style={readerHeaderStyles.backButton}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <ChevronLeft size={24} color={GREEN_DARK} />
        </TouchableOpacity>
        <View style={readerHeaderStyles.titleContainer}>
          <Text style={[readerHeaderStyles.title, androidTextFix]} numberOfLines={1}>
            {title}
          </Text>
          <View style={readerHeaderStyles.ornament}>
            <View style={readerHeaderStyles.ornamentLine} />
            <View style={readerHeaderStyles.ornamentDiamond} />
            <View style={readerHeaderStyles.ornamentLine} />
          </View>
        </View>
        <View style={readerHeaderStyles.spacer} />
      </View>
    </View>
  );
}

const readerHeaderStyles = StyleSheet.create({
  header: {
    backgroundColor: CARD_WHITE,
    paddingBottom: 12,
    paddingHorizontal: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...createShadow({ offsetY: 2, opacity: 0.08, blur: 4, elevation: 3 }),
  },
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(62,107,84,0.1)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center' as const,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: TEXT_DARK,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  ornament: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center',
    marginTop: 6,
    gap: 6,
  },
  ornamentLine: {
    width: 24,
    height: 1,
    backgroundColor: GREEN_DARK,
    opacity: 0.5,
  },
  ornamentDiamond: {
    width: 5,
    height: 5,
    backgroundColor: GREEN_DARK,
    transform: [{ rotate: '45deg' }],
  },
  spacer: {
    width: 40,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: READER_BG,
  },
  quranPageContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  audioBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CARD_WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    ...createShadow({ offsetY: -2, opacity: 0.12, blur: 10, elevation: 10 }),
  },
  audioBarTop: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 12,
  },
  reciterButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(62,107,84,0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    maxWidth: 180,
  },
  reciterButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: GREEN_DARK,
  },
  surahLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: TEXT_DARK,
    writingDirection: 'rtl',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(47,59,51,0.12)',
    borderRadius: 2,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: GREEN_DARK,
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  timeText: {
    color: 'rgba(47,59,51,0.6)',
    fontSize: 11,
  },
  controlsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: 16,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(62,107,84,0.08)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(62,107,84,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(62,107,84,0.4)',
  },
  controlButtonSpacer: {
    width: 44,
    height: 44,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GREEN_DARK,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  playButtonDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(47,59,51,0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 24,
  },
  modalContent: {
    backgroundColor: CARD_WHITE,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    maxHeight: 400,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.07)',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: TEXT_DARK,
  },
  modalClose: {
    fontSize: 14,
    color: GREEN_DARK,
    fontWeight: '600' as const,
  },
  reciterOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  reciterOptionActive: {
    backgroundColor: 'rgba(62,107,84,0.1)',
  },
  reciterOptionText: {
    fontSize: 15,
    color: TEXT_DARK,
    writingDirection: 'rtl',
  },
  reciterOptionTextActive: {
    color: GREEN_DARK,
    fontWeight: '700' as const,
  },
  checkMark: {
    color: GREEN_DARK,
    fontSize: 18,
    fontWeight: '700' as const,
  },
});