import React, { useState, useCallback, useMemo } from 'react';
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
  ListRenderItemInfo,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Play,
  Pause,
  BookOpen,
  ChevronLeft,
  Octagon,
  Volume2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';

import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useReciterStore } from '@/hooks/useReciterStore';
import { useQuranStore, type LastReadPosition } from '@/hooks/useQuranStore';
import { useQuranAudio } from '@/hooks/useQuranAudio';
import { RECITER_NAMES, type ReciterId } from '@/utils/ttsService';
import {
  SURAHS,
  JUZ_STARTS,
  HIZB_STARTS,
  TOTAL_PAGES,
  getSurahByNumber,
  type SurahMeta,
} from '@/utils/quranData';
import { androidTextFix } from '@/utils/androidOptimizations';
import { createShadow } from '@/utils/shadowUtils';
import AdBanner from '@/components/AdBanner';
import UnifiedHeader from '@/components/UnifiedHeader';
import QuranMiniPlayer from '@/components/QuranMiniPlayer';

// Colors & Design System
const GOLD = '#D4A853';
const DARK_BG = '#1B1F2E';
const CARD_BG = '#232838';
const GOLD_CARD_BG = '#F5D088';
const GOLD_CARD_TEXT = '#1B1F2E';
const TEXT_MUTED = '#8A9B91';
const IVORY = '#F7F4EE';

type QuranViewMode = 'surah' | 'juz' | 'page' | 'hizb';

interface ApiSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

// API Fetching
async function fetchAllSurahs(): Promise<SurahMeta[]> {
  const response = await fetch('https://api.alquran.cloud/v1/surah');
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const json = await response.json();
  return (json.data as ApiSurah[]).map((s) => ({
    number: s.number,
    name: s.name,
    englishName: s.englishName,
    englishTranslation: s.englishNameTranslation,
    revelationType: s.revelationType === 'Medinan' ? 'Medinan' : 'Meccan',
    numberOfAyahs: s.numberOfAyahs,
  }));
}

// Sub-components
const QuranBookIllustration = React.memo(function QuranBookIllustration() {
  return (
    <View style={illustrationStyles.container}>
      <View style={illustrationStyles.bookCover}>
        <View style={illustrationStyles.bookSpine} />
        <View style={illustrationStyles.bookPageStack}>
          <View style={illustrationStyles.page} />
          <View style={[illustrationStyles.page, illustrationStyles.pageOffset]} />
        </View>
        <View style={illustrationStyles.coverCenter}>
          <Octagon size={32} color={GOLD} strokeWidth={1.5} />
          <Text style={illustrationStyles.bismillah}>
            {String.fromCharCode(0x0628, 0x0633, 0x0645, 0x0020, 0x0627, 0x0644, 0x0644, 0x0647)}
          </Text>
        </View>
      </View>
    </View>
  );
});

const LastReadCard = React.memo(function LastReadCard({
  lastRead,
  onContinue,
}: {
  lastRead: LastReadPosition | null;
  onContinue: () => void;
}) {
  const { t } = useLanguageStore();

  if (!lastRead) return null;

  return (
    <View style={lastReadStyles.container}>
      <View style={lastReadStyles.content}>
        <View style={lastReadStyles.textSection}>
          <View style={lastReadStyles.badge}>
            <BookOpen size={14} color={GOLD_CARD_TEXT} />
            <Text style={[lastReadStyles.badgeText, androidTextFix]}>
              {t('lastRead')}
            </Text>
          </View>
          <Text style={[lastReadStyles.surahLabel, androidTextFix]}>
            {t('surah')}
          </Text>
          <Text style={[lastReadStyles.surahName, androidTextFix]}>
            {lastRead.surahName}
          </Text>
          <Text style={[lastReadStyles.surahNameTransliteration, androidTextFix]}>
            {lastRead.surahEnglishName}
          </Text>
          <TouchableOpacity
            style={lastReadStyles.button}
            onPress={onContinue}
            activeOpacity={0.8}
            testID="quran-continue-reading-button"
          >
            <Text style={[lastReadStyles.buttonText, androidTextFix]}>
              {t('backToReading')}
            </Text>
            <ChevronLeft size={16} color={IVORY} />
          </TouchableOpacity>
        </View>
        <QuranBookIllustration />
      </View>
    </View>
  );
});

const ViewModeTabs = React.memo(function ViewModeTabs({
  activeMode,
  onChange,
}: {
  activeMode: QuranViewMode;
  onChange: (mode: QuranViewMode) => void;
}) {
  const { t } = useLanguageStore();

  const modes: { key: QuranViewMode; label: string }[] = useMemo(
    () => [
      { key: 'surah', label: t('surahTab') },
      { key: 'juz', label: t('juzTab') },
      { key: 'page', label: t('pageTab') },
      { key: 'hizb', label: t('hizbTab') },
    ],
    [t]
  );

  return (
    <View style={tabsStyles.container}>
      {modes.map((mode) => {
        const isActive = activeMode === mode.key;
        return (
          <TouchableOpacity
            key={mode.key}
            style={[tabsStyles.tab, isActive && tabsStyles.activeTab]}
            onPress={() => onChange(mode.key)}
            activeOpacity={0.7}
            testID={`quran-tab-${mode.key}`}
          >
            <Text
              style={[
                tabsStyles.tabText,
                isActive && tabsStyles.activeTabText,
                androidTextFix,
              ]}
            >
              {mode.label}
            </Text>
            {isActive && <View style={tabsStyles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const SurahItem = React.memo(function SurahItem({
  surah,
  onPlay,
  onOpenReader,
  isPlaying,
  isLoadingAudio,
}: {
  surah: SurahMeta;
  onPlay: (surah: SurahMeta) => void;
  onOpenReader: (surah: SurahMeta) => void;
  isPlaying: boolean;
  isLoadingAudio: boolean;
}) {
  const { t } = useLanguageStore();

  return (
    <TouchableOpacity
      style={surahStyles.container}
      onPress={() => onOpenReader(surah)}
      activeOpacity={0.7}
      testID={`quran-surah-${surah.number}`}
    >
      <View style={surahStyles.numberBadge}>
        <Text style={[surahStyles.numberText, androidTextFix]}>{surah.number}</Text>
      </View>
      <View style={surahStyles.textSection}>
        <Text style={[surahStyles.arabicName, androidTextFix]}>{surah.name}</Text>
        <View style={surahStyles.metaRow}>
          <Text style={[surahStyles.transliterationName, androidTextFix]}>
            {surah.englishName}
          </Text>
          <Text style={surahStyles.dot}>•</Text>
          <Text style={[surahStyles.ayahCount, androidTextFix]}>
            {surah.numberOfAyahs} {t('ayahs')}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[surahStyles.playButton, isPlaying && surahStyles.playButtonActive]}
        onPress={() => onPlay(surah)}
        activeOpacity={0.8}
        testID={`quran-play-surah-${surah.number}`}
        accessibilityLabel={`${t('playSurah')} ${surah.name}`}
      >
        {isLoadingAudio ? (
          <ActivityIndicator size="small" color={DARK_BG} />
        ) : isPlaying ? (
          <Pause size={18} color={DARK_BG} fill={DARK_BG} />
        ) : (
          <Play size={18} color={DARK_BG} fill={DARK_BG} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const JuzItem = React.memo(function JuzItem({
  juz,
  onOpen,
}: {
  juz: { number: number; startSurah: number; startAyah: number };
  onOpen: (surahNumber: number, ayahNumber?: number) => void;
}) {
  const { t } = useLanguageStore();
  const surah = getSurahByNumber(juz.startSurah);

  return (
    <TouchableOpacity
      style={surahStyles.container}
      onPress={() => onOpen(juz.startSurah, juz.startAyah)}
      activeOpacity={0.7}
    >
      <View style={surahStyles.numberBadge}>
        <Text style={[surahStyles.numberText, androidTextFix]}>{juz.number}</Text>
      </View>
      <View style={surahStyles.textSection}>
        <Text style={[surahStyles.arabicName, androidTextFix]}>
          {t('juzNumber')} {juz.number}
        </Text>
        <Text style={[surahStyles.transliterationName, androidTextFix]}>
          {surah?.name ?? ''} - {t('ayah')} {juz.startAyah}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const HizbItem = React.memo(function HizbItem({
  hizb,
  onOpen,
}: {
  hizb: { number: number; startSurah: number; startAyah: number };
  onOpen: (surahNumber: number, ayahNumber?: number) => void;
}) {
  const { t } = useLanguageStore();
  const surah = getSurahByNumber(hizb.startSurah);

  return (
    <TouchableOpacity
      style={surahStyles.container}
      onPress={() => onOpen(hizb.startSurah, hizb.startAyah)}
      activeOpacity={0.7}
    >
      <View style={surahStyles.numberBadge}>
        <Text style={[surahStyles.numberText, androidTextFix]}>{hizb.number}</Text>
      </View>
      <View style={surahStyles.textSection}>
        <Text style={[surahStyles.arabicName, androidTextFix]}>
          {t('hizbNumber')} {hizb.number}
        </Text>
        <Text style={[surahStyles.transliterationName, androidTextFix]}>
          {surah?.name ?? ''} - {t('ayah')} {hizb.startAyah}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const PageItem = React.memo(function PageItem({
  pageNum,
  onOpenPage,
}: {
  pageNum: number;
  onOpenPage: (page: number) => void;
}) {
  const { t } = useLanguageStore();
  return (
    <TouchableOpacity
      style={surahStyles.container}
      onPress={() => onOpenPage(pageNum)}
      activeOpacity={0.7}
    >
      <View style={surahStyles.numberBadge}>
        <Text style={[surahStyles.numberText, androidTextFix]}>{pageNum}</Text>
      </View>
      <View style={surahStyles.textSection}>
        <Text style={[surahStyles.arabicName, androidTextFix]}>
          {t('page')} {pageNum}
        </Text>
        <Text style={[surahStyles.transliterationName, androidTextFix]}>
          {t('pageTab')} {pageNum} / {TOTAL_PAGES}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// Main Screen Component
export default function QuranScreen() {
  const { t } = useLanguageStore();
  const router = useRouter();
  const { currentReciter, changeReciter } = useReciterStore();
  const { lastRead } = useQuranStore();
  const {
    currentSurah,
    isPlaying,
    isLoading,
    playSurah,
    isCurrentSurah,
  } = useQuranAudio();

  const [activeMode, setActiveMode] = useState<QuranViewMode>('surah');
  const [showReciterPicker, setShowReciterPicker] = useState<boolean>(false);

  const { data: surahs, isLoading: surahsLoading, isError: surahsError } = useQuery<SurahMeta[]>({
    queryKey: ['quran-surahs'],
    queryFn: fetchAllSurahs,
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,
    retry: 2,
  });

  const surahList = useMemo(() => surahs ?? SURAHS, [surahs]);

  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, []);

  const handlePlaySurah = useCallback((surah: SurahMeta) => {
    triggerHaptic();
    void playSurah(surah);
  }, [playSurah, triggerHaptic]);

  const handleOpenReader = useCallback((surah: SurahMeta, ayahNumber?: number) => {
    triggerHaptic();
    const ayahParam = ayahNumber ? `&ayah=${ayahNumber}` : '';
    router.push(`/quran-reader?surah=${surah.number}${ayahParam}`);
  }, [router, triggerHaptic]);

  const handleOpenPageReader = useCallback((page: number) => {
    triggerHaptic();
    router.push(`/quran-reader?page=${page}`);
  }, [router, triggerHaptic]);

  const handleContinueReading = useCallback(() => {
    triggerHaptic();
    const surahNum = lastRead?.surahNumber ?? 1;
    const ayahNum = lastRead?.ayahNumber ? `&ayah=${lastRead.ayahNumber}` : '';
    router.push(`/quran-reader?surah=${surahNum}${ayahNum}`);
  }, [router, lastRead, triggerHaptic]);

  const handleReciterSelect = useCallback(async (reciter: ReciterId) => {
    setShowReciterPicker(false);
    await changeReciter(reciter);
  }, [changeReciter]);

  const listData = useMemo(() => {
    if (activeMode === 'surah') return surahList;
    if (activeMode === 'juz') return JUZ_STARTS;
    if (activeMode === 'hizb') return HIZB_STARTS;
    return Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);
  }, [activeMode, surahList]);

  const handleOpenSurahByNumber = useCallback((surahNum: number, ayahNum?: number) => {
    const surah = getSurahByNumber(surahNum) ?? SURAHS[0];
    handleOpenReader(surah, ayahNum);
  }, [handleOpenReader]);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<any>) => {
    if (activeMode === 'surah') {
      const surah = item as SurahMeta;
      const isThisPlaying = isCurrentSurah(surah.number) && isPlaying;
      const isThisLoading = isCurrentSurah(surah.number) && isLoading;
      return (
        <SurahItem
          surah={surah}
          onPlay={handlePlaySurah}
          onOpenReader={handleOpenReader}
          isPlaying={isThisPlaying}
          isLoadingAudio={isThisLoading}
        />
      );
    }
    if (activeMode === 'juz') {
      return <JuzItem juz={item} onOpen={handleOpenSurahByNumber} />;
    }
    if (activeMode === 'hizb') {
      return <HizbItem hizb={item} onOpen={handleOpenSurahByNumber} />;
    }
    return <PageItem pageNum={item} onOpenPage={handleOpenPageReader} />;
  }, [activeMode, handlePlaySurah, handleOpenReader, handleOpenSurahByNumber, handleOpenPageReader, isCurrentSurah, isPlaying, isLoading]);

  const keyExtractor = useCallback((item: any) => {
    if (activeMode === 'surah') return `surah-${item.number}`;
    if (activeMode === 'juz') return `juz-${item.number}`;
    if (activeMode === 'hizb') return `hizb-${item.number}`;
    return `page-${item}`;
  }, [activeMode]);

  const itemSeparator = useCallback(() => <View style={surahStyles.separator} />, []);

  const hasMiniPlayer = currentSurah !== null;

  const listHeader = useMemo(() => (
    <View style={styles.listHeader}>
      <LastReadCard lastRead={lastRead} onContinue={handleContinueReading} />
      <ViewModeTabs activeMode={activeMode} onChange={setActiveMode} />
      {activeMode === 'surah' && (
        <TouchableOpacity
          style={styles.reciterBar}
          onPress={() => setShowReciterPicker(true)}
          activeOpacity={0.7}
        >
          <Volume2 size={16} color={GOLD} />
          <Text style={[styles.reciterBarText, androidTextFix]} numberOfLines={1}>
            {RECITER_NAMES[currentReciter]}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  ), [lastRead, handleContinueReading, activeMode, currentReciter]);

  return (
    <View style={styles.container} testID="quran-screen" accessibilityLabel="Quran Screen">
      <UnifiedHeader title={t('quranKareem')} testID="quran-header" />

      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={itemSeparator}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          surahsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={GOLD} />
              <Text style={[styles.loadingText, androidTextFix]}>{t('loading')}</Text>
            </View>
          ) : surahsError ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.errorText, androidTextFix]}>{t('errorLoadingVerses')}</Text>
            </View>
          ) : null
        }
        contentContainerStyle={[
          styles.listContent,
          hasMiniPlayer && { paddingBottom: 180 },
        ]}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        initialNumToRender={12}
        maxToRenderPerBatch={20}
        windowSize={10}
      />

      {hasMiniPlayer ? <QuranMiniPlayer /> : <AdBanner />}

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
                  {currentReciter === id && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  listHeader: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  reciterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,168,83,0.1)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,168,83,0.2)',
  },
  reciterBarText: {
    fontSize: 13,
    fontWeight: '600',
    color: GOLD,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: TEXT_MUTED,
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    color: '#E57373',
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderColor: 'rgba(212,168,83,0.15)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: 14,
    color: GOLD,
    fontWeight: '600',
  },
  reciterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontWeight: '700',
  },
  checkMark: {
    color: GOLD,
    fontSize: 18,
    fontWeight: '700',
  },
});

const lastReadStyles = StyleSheet.create({
  container: {
    backgroundColor: GOLD_CARD_BG,
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    ...createShadow({ offsetY: 4, opacity: 0.12, blur: 12, elevation: 5 }),
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27,31,46,0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: GOLD_CARD_TEXT,
  },
  surahLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: GOLD_CARD_TEXT,
    opacity: 0.7,
    marginBottom: 2,
  },
  surahName: {
    fontSize: 24,
    fontWeight: '700',
    color: GOLD_CARD_TEXT,
    writingDirection: 'rtl',
    textAlign: 'left',
    marginBottom: 4,
  },
  surahNameTransliteration: {
    fontSize: 14,
    fontWeight: '500',
    color: GOLD_CARD_TEXT,
    opacity: 0.8,
    marginBottom: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27,31,46,0.85)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: IVORY,
  },
});

const illustrationStyles = StyleSheet.create({
  container: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookCover: {
    width: 84,
    height: 96,
    backgroundColor: '#E8C87A',
    borderRadius: 8,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    ...createShadow({ offsetY: 4, opacity: 0.15, blur: 8, elevation: 4 }),
    transform: [{ perspective: 600 }, { rotateY: '-12deg' }],
  },
  bookSpine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: '#D4A040',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  bookPageStack: {
    position: 'absolute',
    right: -6,
    top: 4,
    bottom: 4,
    width: 14,
    justifyContent: 'center',
  },
  page: {
    position: 'absolute',
    right: 0,
    width: 14,
    height: '100%',
    backgroundColor: '#FFFDF5',
    borderRadius: 2,
  },
  pageOffset: {
    right: -4,
    width: 12,
    backgroundColor: '#F5EED6',
  },
  coverCenter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  bismillah: {
    fontSize: 10,
    fontWeight: '600',
    color: GOLD,
    writingDirection: 'rtl',
  },
});

const tabsStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  activeTab: {},
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  activeTabText: {
    color: GOLD,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 24,
    height: 3,
    backgroundColor: GOLD,
    borderRadius: 1.5,
  },
});

const surahStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 4,
  },
  numberBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: {
    fontSize: 13,
    fontWeight: '700',
    color: GOLD,
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
  },
  arabicName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    writingDirection: 'rtl',
    textAlign: 'left',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transliterationName: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_MUTED,
    textAlign: 'left',
  },
  dot: {
    color: TEXT_MUTED,
    fontSize: 13,
  },
  ayahCount: {
    fontSize: 12,
    fontWeight: '400',
    color: TEXT_MUTED,
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  playButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});