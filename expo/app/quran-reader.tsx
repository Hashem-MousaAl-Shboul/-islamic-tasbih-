import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
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
import { useQuery } from '@tanstack/react-query';

import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useReciterStore } from '@/hooks/useReciterStore';
import { useQuranStore } from '@/hooks/useQuranStore';
import { useQuranAudio } from '@/hooks/useQuranAudio';
import { RECITER_NAMES, type ReciterId } from '@/utils/ttsService';
import { getSurahByNumber, getSurahTypeLabel, TOTAL_PAGES } from '@/utils/quranData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { androidTextFix } from '@/utils/androidOptimizations';

const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';
const DARK_BG = '#1B1F2E';
const CARD_BG = '#232838';
const CARD_BORDER = 'rgba(212,168,83,0.15)';
const TEXT_MUTED = '#8A9B91';
const IVORY = '#F7F4EE';

interface Verse {
  number: number;
  arabicText: string;
  translation: string;
  numberInSurah: number;
  surahNumber: number;
  surahName: string;
}

interface SurahApiResponse {
  code: number;
  status: string;
  data: Array<{
    ayahs: Array<{
      numberInSurah: number;
      text: string;
    }>;
  }>;
}

interface PageApiResponse {
  code: number;
  status: string;
  data: {
    ayahs: Array<{
      number: number;
      numberInSurah: number;
      text: string;
      surah: { number: number; name: string; englishName: string };
    }>;
  };
}

/** Strip BOM (U+FEFF) and trim whitespace from API-returned Arabic text */
function cleanArabicText(text: string): string {
  return text.replace(/^\uFEFF/, '').trim();
}

async function fetchSurahVerses(surahNumber: number): Promise<{ verses: Verse[]; surahName: string }> {
  const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const json: SurahApiResponse = await response.json();

  const arabicData = json.data?.[0]?.ayahs ?? [];
  const translationData = json.data?.[1]?.ayahs ?? [];
  const surahName = getSurahByNumber(surahNumber)?.name ?? `سورة ${surahNumber}`;

  const verses: Verse[] = arabicData.map((ayah, index) => ({
    number: ayah.numberInSurah,
    numberInSurah: ayah.numberInSurah,
    arabicText: cleanArabicText(ayah.text),
    translation: translationData[index]?.text ?? '',
    surahNumber,
    surahName,
  }));

  return { verses, surahName };
}

async function fetchPageVerses(pageNumber: number): Promise<{ verses: Verse[]; surahName: string }> {
  const url = `https://api.alquran.cloud/v1/page/${pageNumber}/editions/quran-uthmani,en.sahih`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const json: PageApiResponse = await response.json();

  const arabicAyahs = json.data?.ayahs ?? [];
  const verses: Verse[] = arabicAyahs.map((ayah, index) => ({
    number: ayah.numberInSurah,
    numberInSurah: ayah.numberInSurah,
    arabicText: cleanArabicText(ayah.text),
    translation: '', // Page endpoint with editions returns both but structure differs
    surahNumber: ayah.surah?.number ?? 0,
    surahName: ayah.surah?.name ?? '',
  }));

  // Fetch translations for the page separately
  try {
    const transUrl = `https://api.alquran.cloud/v1/page/${pageNumber}/en.sahih`;
    const transRes = await fetch(transUrl);
    if (transRes.ok) {
      const transJson = await transRes.json();
      const transAyahs = transJson?.data?.ayahs ?? [];
      transAyahs.forEach((ayah: { text: string }, i: number) => {
        if (verses[i]) verses[i].translation = ayah.text ?? '';
      });
    }
  } catch {
    // Translation is optional — don't fail the whole page
  }

  const firstName = verses[0]?.surahName ?? `صفحة ${pageNumber}`;
  return { verses, surahName: firstName };
}

/** Whether a surah should show Bismillah as a header before the first ayah.
 *  Surah 1 (Al-Fatiha): Bismillah IS the first ayah — don't show as header.
 *  Surah 9 (At-Tawba): No Bismillah at all.
 *  All others: Show Bismillah header. */
function shouldShowBismillah(surahNumber: number, isPageMode: boolean): boolean {
  if (isPageMode) return false;
  return surahNumber !== 1 && surahNumber !== 9;
}

export default function QuranReaderScreen() {
  const params = useLocalSearchParams<{ surah?: string; ayah?: string; page?: string }>();
  const router = useRouter();
  const { t } = useLanguageStore();
  const { currentReciter, changeReciter } = useReciterStore();
  const { saveLastRead } = useQuranStore();
  const {
    currentSurah: audioSurah,
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
  } = useQuranAudio();
  const insets = useSafeAreaInsets();

  const pageNumber = params.page ? parseInt(params.page, 10) : undefined;
  const isPageMode = pageNumber !== undefined && !isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= TOTAL_PAGES;
  const surahNumber = Math.min(Math.max(parseInt(params.surah ?? '1', 10) || 1, 1), 114);
  const ayahNumber = params.ayah ? parseInt(params.ayah, 10) : undefined;
  const surahMeta = useMemo(() => getSurahByNumber(surahNumber), [surahNumber]);

  const [showReciterPicker, setShowReciterPicker] = useState<boolean>(false);
  const [progressBarWidth, setProgressBarWidth] = useState<number>(Dimensions.get('window').width - 40);
  const flatListRef = useRef<FlatList<Verse>>(null);

  const { data: surahData, isLoading, isError, refetch } = useQuery<{
    verses: Verse[];
    surahName: string;
  }>({
    queryKey: isPageMode
      ? ['quran-page', pageNumber]
      : ['quran-verses', surahNumber],
    queryFn: () =>
      isPageMode
        ? fetchPageVerses(pageNumber!)
        : fetchSurahVerses(surahNumber),
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });

  const verses = surahData?.verses ?? null;
  const displaySurahName = surahData?.surahName ?? surahMeta?.name ?? t('quranKareem');

  // Save last read position when surah changes
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

  // Show audio error alert
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

  // Scroll to specific ayah when verses are loaded
  useEffect(() => {
    if (ayahNumber && verses && verses.length > 0 && flatListRef.current) {
      const ayahIndex = verses.findIndex(v => v.numberInSurah === ayahNumber);
      if (ayahIndex >= 0) {
        const timer = setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: ayahIndex,
            animated: true,
            viewPosition: 0.3,
          });
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [ayahNumber, verses]);

  const isThisSurahPlaying = isPageMode
    ? (verses?.[0] ? isCurrentSurah(verses[0].surahNumber) : false)
    : isCurrentSurah(surahNumber);

  const handlePlayPause = useCallback(async () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (isPageMode) {
      // In page mode, play the first surah on the page
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
    if (isPageMode) {
      const firstSurahMeta = verses?.[0] ? getSurahByNumber(verses[0].surahNumber) : null;
      if (firstSurahMeta) {
        await playSurah(firstSurahMeta);
      }
    } else if (surahMeta) {
      await playSurah(surahMeta);
    }
  }, [isPageMode, surahMeta, playSurah, verses]);

  const handleReciterSelect = useCallback(async (reciter: ReciterId) => {
    setShowReciterPicker(false);
    await changeReciter(reciter);
    if (isPageMode) {
      const firstSurahMeta = verses?.[0] ? getSurahByNumber(verses[0].surahNumber) : null;
      if (firstSurahMeta && (isPlaying || isThisSurahPlaying)) {
        await playSurah(firstSurahMeta, reciter);
      }
    } else if ((isThisSurahPlaying || isPlaying) && surahMeta) {
      await playSurah(surahMeta, reciter);
    }
  }, [changeReciter, isThisSurahPlaying, isPlaying, surahMeta, playSurah, isPageMode, verses]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
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

  const renderVerse = useCallback(({ item, index }: { item: Verse; index: number }) => (
    <View style={styles.verseCard}>
      <View style={styles.verseHeader}>
        <View style={styles.ayahBadge}>
          <Text style={[styles.ayahBadgeText, androidTextFix]}>{item.numberInSurah}</Text>
        </View>
        {isPageMode && item.surahName ? (
          <Text style={[styles.verseSurahName, androidTextFix]} numberOfLines={1}>
            {item.surahName}
          </Text>
        ) : null}
        <Text style={[styles.verseIndex, androidTextFix]}>
          {index + 1} / {verses?.length ?? 0}
        </Text>
      </View>
      <Text style={[styles.arabicText, androidTextFix]}>
        {item.arabicText}
      </Text>
      {item.translation ? (
        <Text style={[styles.translationText, androidTextFix]}>
          {item.translation}
        </Text>
      ) : null}
    </View>
  ), [verses, isPageMode]);

  const keyExtractor = useCallback((item: Verse, index: number) =>
    isPageMode
      ? `verse-${index}-${item.surahNumber}-${item.numberInSurah}`
      : `verse-${item.number}`,
  [isPageMode]);

  const headerComponent = useMemo(() => {
    if (isPageMode) {
      return (
        <View style={styles.surahHeader}>
          <View style={styles.surahMetaRow}>
            <View style={styles.metaPill}>
              <Text style={[styles.metaPillText, androidTextFix]}>
                {t('page')} {pageNumber}
              </Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={[styles.metaPillText, androidTextFix]}>
                {pageNumber} / {TOTAL_PAGES}
              </Text>
            </View>
          </View>
        </View>
      );
    }
    if (!surahMeta) return null;
    const showBismillah = shouldShowBismillah(surahNumber, false);
    return (
      <View style={styles.surahHeader}>
        {showBismillah && (
          <Text style={[styles.bismillah, androidTextFix]}>
            {t('bismillah')}
          </Text>
        )}
        <View style={styles.surahMetaRow}>
          <View style={styles.metaPill}>
            <Text style={[styles.metaPillText, androidTextFix]}>
              {surahMeta.englishName}
            </Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={[styles.metaPillText, androidTextFix]}>
              {getSurahTypeLabel(surahMeta.revelationType)}
            </Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={[styles.metaPillText, androidTextFix]}>
              {surahMeta.numberOfAyahs} {t('ayahs')}
            </Text>
          </View>
        </View>
      </View>
    );
  }, [surahMeta, t, isPageMode, pageNumber, surahNumber]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ReaderHeader title={displaySurahName} onBack={handleBack} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={[styles.loadingText, androidTextFix]}>{t('loadingVerses')}</Text>
        </View>
      </View>
    );
  }

  if (isError || !verses) {
    return (
      <View style={styles.container}>
        <ReaderHeader title={displaySurahName} onBack={handleBack} />
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, androidTextFix]}>{t('errorLoadingVerses')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={[styles.retryButtonText, androidTextFix]}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="quran-reader-screen">
      <ReaderHeader title={displaySurahName} onBack={handleBack} />

      <FlatList
        ref={flatListRef}
        data={verses}
        renderItem={renderVerse}
        keyExtractor={keyExtractor}
        ListHeaderComponent={headerComponent}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 200 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={8}
        onScrollToIndexFailed={(info) => {
          console.log('[QuranReader] scrollToIndex failed:', info);
          flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
        }}
      />

      {/* Audio Player Bar */}
      <View style={[styles.audioBar, { paddingBottom: 16 + insets.bottom }]}>
        <View style={styles.audioBarTop}>
          <TouchableOpacity
            style={styles.reciterButton}
            onPress={() => setShowReciterPicker(true)}
          >
            <Volume2 size={16} color={GOLD} />
            <Text style={[styles.reciterButtonText, androidTextFix]} numberOfLines={1}>
              {RECITER_NAMES[currentReciter]}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.surahLabel, androidTextFix]} numberOfLines={1}>
            {isPageMode ? `${t('page')} ${pageNumber}` : surahMeta?.name}
          </Text>
        </View>

        {duration > 0 && (
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
          {/* Repeat button */}
          <TouchableOpacity
            style={[
              styles.controlButton,
              repeatMode === 'surah' && styles.controlButtonActive,
            ]}
            onPress={toggleRepeat}
          >
            {repeatMode === 'surah' ? (
              <Repeat1 size={18} color={GOLD} />
            ) : (
              <Repeat size={18} color={IVORY} />
            )}
          </TouchableOpacity>

          {/* Stop button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleStop}
            disabled={!isThisSurahPlaying && position === 0}
          >
            <Square
              size={18}
              color={(!isThisSurahPlaying && position === 0) ? '#555' : IVORY}
              fill={(!isThisSurahPlaying && position === 0) ? '#555' : IVORY}
            />
          </TouchableOpacity>

          {/* Play/Pause button */}
          <TouchableOpacity
            style={[styles.playButton, isLoadingAudio && styles.playButtonDisabled]}
            onPress={handlePlayPause}
            disabled={isLoadingAudio}
          >
            {isLoadingAudio ? (
              <ActivityIndicator size="small" color={DARK_BG} />
            ) : (isThisSurahPlaying && isPlaying) ? (
              <Pause size={26} color={DARK_BG} fill={DARK_BG} />
            ) : (
              <Play size={26} color={DARK_BG} fill={DARK_BG} />
            )}
          </TouchableOpacity>

          {/* Restart button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleRestart}
            disabled={isLoadingAudio}
          >
            <RotateCcw size={18} color={isLoadingAudio ? '#555' : IVORY} />
          </TouchableOpacity>

          {/* Spacer for symmetry */}
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
          <ChevronLeft size={24} color="#FFFFFF" />
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
    backgroundColor: DEEP_GREEN,
    paddingBottom: 18,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    color: '#FFFFFF',
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
    backgroundColor: GOLD,
    opacity: 0.6,
  },
  ornamentDiamond: {
    width: 5,
    height: 5,
    backgroundColor: GOLD,
    transform: [{ rotate: '45deg' }],
  },
  spacer: {
    width: 40,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 32,
  },
  loadingText: {
    color: TEXT_MUTED,
    fontSize: 15,
    marginTop: 16,
  },
  errorText: {
    color: '#E57373',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: GOLD,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryButtonText: {
    color: DARK_BG,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  surahHeader: {
    alignItems: 'center' as const,
    paddingVertical: 24,
    marginBottom: 8,
  },
  bismillah: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: GOLD,
    writingDirection: 'rtl',
    textAlign: 'center',
    marginBottom: 20,
  },
  surahMetaRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  metaPill: {
    backgroundColor: 'rgba(212,168,83,0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(212,168,83,0.2)',
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: GOLD,
  },
  verseCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  verseHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 16,
  },
  ayahBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(212,168,83,0.15)',
    borderWidth: 1.5,
    borderColor: GOLD,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  ayahBadgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: GOLD,
  },
  verseSurahName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: GOLD,
    flex: 1,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  verseIndex: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: TEXT_MUTED,
  },
  arabicText: {
    fontSize: 24,
    fontWeight: '400' as const,
    color: '#FFFFFF',
    writingDirection: 'rtl',
    textAlign: 'right',
    lineHeight: 42,
    marginBottom: 14,
  },
  translationText: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: TEXT_MUTED,
    lineHeight: 24,
    textAlign: 'left',
  },
  audioBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DEEP_GREEN,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
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
    backgroundColor: 'rgba(212,168,83,0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    maxWidth: 180,
  },
  reciterButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: GOLD,
  },
  surahLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    writingDirection: 'rtl',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  timeText: {
    color: 'rgba(255,255,255,0.6)',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  controlButtonActive: {
    backgroundColor: 'rgba(212,168,83,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(212,168,83,0.4)',
  },
  controlButtonSpacer: {
    width: 44,
    height: 44,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GOLD,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  playButtonDisabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 24,
  },
  modalContent: {
    backgroundColor: CARD_BG,
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
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: 14,
    color: GOLD,
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
    backgroundColor: 'rgba(212,168,83,0.15)',
  },
  reciterOptionText: {
    fontSize: 15,
    color: '#FFFFFF',
    writingDirection: 'rtl',
  },
  reciterOptionTextActive: {
    color: GOLD,
    fontWeight: '700' as const,
  },
  checkMark: {
    color: GOLD,
    fontSize: 18,
    fontWeight: '700' as const,
  },
});
