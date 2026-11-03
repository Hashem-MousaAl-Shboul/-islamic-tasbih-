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
import { fetchSurahList } from '@/utils/quranApi';
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
import { useTheme } from '@/theme/ThemeProvider';

// Colors & Design System — هوية التطبيق الموحدة (أخضر داكن / ذهبي / كريمي)
const GREEN_DARK = '#1B4332';
const GOLD = '#D4A853';
const CREAM = '#FBFAF3';

type QuranViewMode = 'surah' | 'juz' | 'page' | 'hizb';

interface ScreenPalette {
  bg: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  /** لون بارز للعناصر التفاعلية والنصوص المميزة */
  accent: string;
  /** لون المحتوى فوق العنصر البارز */
  onAccent: string;
  /** خلفية شفافة للعناصر النشطة */
  accentSoft: string;
  /** لون الذهبي ولون المحتوى فوقه */
  gold: string;
  onGold: string;
}

const LIGHT_PALETTE: ScreenPalette = {
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#D9E1DC',
  text: '#173B2D',
  muted: '#5D6F66',
  accent: '#1B4332',
  onAccent: '#FFFFFF',
  accentSoft: 'rgba(27,67,50,0.08)',
  gold: '#D4A853',
  onGold: '#1B4332',
};

const DARK_PALETTE: ScreenPalette = {
  bg: '#14251D',
  card: '#232838',
  border: '#353B4E',
  text: '#FFFFFF',
  muted: '#B9C3BD',
  accent: '#D4A853',
  onAccent: '#14251D',
  accentSoft: 'rgba(212,168,83,0.12)',
  gold: '#D4A853',
  onGold: '#14251D',
};

// جلب السور من المصدر الموحّد (utils/quranApi.ts) — الرابط محفوظ هناك فقط

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
            <BookOpen size={14} color="#FFFFFF" />
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
            <ChevronLeft size={16} color={GREEN_DARK} />
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
  palette,
}: {
  activeMode: QuranViewMode;
  onChange: (mode: QuranViewMode) => void;
  palette: ScreenPalette;
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
    <View
      style={[
        tabsStyles.container,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
    >
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
                { color: palette.muted },
                isActive && { color: palette.accent },
                androidTextFix,
              ]}
            >
              {mode.label}
            </Text>
            {isActive && (
              <View style={[tabsStyles.activeIndicator, { backgroundColor: palette.accent }]} />
            )}
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
  palette,
}: {
  surah: SurahMeta;
  onPlay: (surah: SurahMeta) => void;
  onOpenReader: (surah: SurahMeta) => void;
  isPlaying: boolean;
  isLoadingAudio: boolean;
  palette: ScreenPalette;
}) {
  const { t } = useLanguageStore();

  const buttonBg = isPlaying ? palette.gold : palette.accent;
  const buttonFg = isPlaying ? palette.onGold : palette.onAccent;

  return (
    <TouchableOpacity
      style={[surahStyles.container, { backgroundColor: palette.card }]}
      onPress={() => onOpenReader(surah)}
      activeOpacity={0.7}
      testID={`quran-surah-${surah.number}`}
    >
      <View style={surahStyles.numberBadge}>
        <Octagon size={38} color={palette.accent} strokeWidth={1.3} style={StyleSheet.absoluteFill} />
        <Text style={[surahStyles.numberText, { color: palette.accent }, androidTextFix]}>
          {surah.number}
        </Text>
      </View>
      <View style={surahStyles.textSection}>
        <Text style={[surahStyles.arabicName, { color: palette.text }, androidTextFix]}>
          {surah.name}
        </Text>
        <View style={surahStyles.metaRow}>
          <Text style={[surahStyles.transliterationName, { color: palette.muted }, androidTextFix]}>
            {surah.englishName}
          </Text>
          <Text style={[surahStyles.dot, { color: palette.muted }]}>•</Text>
          <Text style={[surahStyles.ayahCount, { color: palette.muted }, androidTextFix]}>
            {surah.numberOfAyahs} {t('ayahs')}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[surahStyles.playButton, { backgroundColor: buttonBg }]}
        onPress={() => onPlay(surah)}
        activeOpacity={0.8}
        testID={`quran-play-surah-${surah.number}`}
        accessibilityLabel={`${t('playSurah')} ${surah.name}`}
      >
        {isLoadingAudio ? (
          <ActivityIndicator size="small" color={buttonFg} />
        ) : isPlaying ? (
          <Pause size={18} color={buttonFg} fill={buttonFg} />
        ) : (
          <Play size={18} color={buttonFg} fill={buttonFg} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const JuzItem = React.memo(function JuzItem({
  juz,
  onOpen,
  palette,
}: {
  juz: { number: number; startSurah: number; startAyah: number };
  onOpen: (surahNumber: number, ayahNumber?: number) => void;
  palette: ScreenPalette;
}) {
  const { t } = useLanguageStore();
  const surah = getSurahByNumber(juz.startSurah);

  return (
    <TouchableOpacity
      style={[surahStyles.container, { backgroundColor: palette.card }]}
      onPress={() => onOpen(juz.startSurah, juz.startAyah)}
      activeOpacity={0.7}
    >
      <View style={surahStyles.numberBadge}>
        <Octagon size={38} color={palette.accent} strokeWidth={1.3} style={StyleSheet.absoluteFill} />
        <Text style={[surahStyles.numberText, { color: palette.accent }, androidTextFix]}>
          {juz.number}
        </Text>
      </View>
      <View style={surahStyles.textSection}>
        <Text style={[surahStyles.arabicName, { color: palette.text }, androidTextFix]}>
          {t('juzNumber')} {juz.number}
        </Text>
        <Text style={[surahStyles.transliterationName, { color: palette.muted }, androidTextFix]}>
          {surah?.name ?? ''} - {t('ayah')} {juz.startAyah}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const HizbItem = React.memo(function HizbItem({
  hizb,
  onOpen,
  palette,
}: {
  hizb: { number: number; startSurah: number; startAyah: number };
  onOpen: (surahNumber: number, ayahNumber?: number) => void;
  palette: ScreenPalette;
}) {
  const { t } = useLanguageStore();
  const surah = getSurahByNumber(hizb.startSurah);

  return (
    <TouchableOpacity
      style={[surahStyles.container, { backgroundColor: palette.card }]}
      onPress={() => onOpen(hizb.startSurah, hizb.startAyah)}
      activeOpacity={0.7}
    >
      <View style={surahStyles.numberBadge}>
        <Octagon size={38} color={palette.accent} strokeWidth={1.3} style={StyleSheet.absoluteFill} />
        <Text style={[surahStyles.numberText, { color: palette.accent }, androidTextFix]}>
          {hizb.number}
        </Text>
      </View>
      <View style={surahStyles.textSection}>
        <Text style={[surahStyles.arabicName, { color: palette.text }, androidTextFix]}>
          {t('hizbNumber')} {hizb.number}
        </Text>
        <Text style={[surahStyles.transliterationName, { color: palette.muted }, androidTextFix]}>
          {surah?.name ?? ''} - {t('ayah')} {hizb.startAyah}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const PageItem = React.memo(function PageItem({
  pageNum,
  onOpenPage,
  palette,
}: {
  pageNum: number;
  onOpenPage: (page: number) => void;
  palette: ScreenPalette;
}) {
  const { t } = useLanguageStore();
  return (
    <TouchableOpacity
      style={[surahStyles.container, { backgroundColor: palette.card }]}
      onPress={() => onOpenPage(pageNum)}
      activeOpacity={0.7}
    >
      <View style={surahStyles.numberBadge}>
        <Octagon size={38} color={palette.accent} strokeWidth={1.3} style={StyleSheet.absoluteFill} />
        <Text style={[surahStyles.numberText, { color: palette.accent }, androidTextFix]}>
          {pageNum}
        </Text>
      </View>
      <View style={surahStyles.textSection}>
        <Text style={[surahStyles.arabicName, { color: palette.text }, androidTextFix]}>
          {t('page')} {pageNum}
        </Text>
        <Text style={[surahStyles.transliterationName, { color: palette.muted }, androidTextFix]}>
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
  const { mode } = useTheme();
  const { currentReciter, changeReciter } = useReciterStore();
  const { lastRead } = useQuranStore();
  const {
    currentSurah,
    isPlaying,
    isLoading,
    playSurah,
    isCurrentSurah,
  } = useQuranAudio();

  const palette = useMemo(
    () => (mode === 'dark' ? DARK_PALETTE : LIGHT_PALETTE),
    [mode]
  );

  const [activeMode, setActiveMode] = useState<QuranViewMode>('surah');
  const [showReciterPicker, setShowReciterPicker] = useState<boolean>(false);

  const { data: surahs, isLoading: surahsLoading, isError: surahsError } = useQuery<SurahMeta[]>({
    queryKey: ['quran-surahs'],
    queryFn: fetchSurahList,
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
    const surah = getSurahByNumber(surahNum);
    if (!surah) return;
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
          palette={palette}
        />
      );
    }
    if (activeMode === 'juz') {
      return <JuzItem juz={item} onOpen={handleOpenSurahByNumber} palette={palette} />;
    }
    if (activeMode === 'hizb') {
      return <HizbItem hizb={item} onOpen={handleOpenSurahByNumber} palette={palette} />;
    }
    return <PageItem pageNum={item} onOpenPage={handleOpenPageReader} palette={palette} />;
  }, [activeMode, handlePlaySurah, handleOpenReader, handleOpenSurahByNumber, handleOpenPageReader, isCurrentSurah, isPlaying, isLoading, palette]);

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
      <ViewModeTabs activeMode={activeMode} onChange={setActiveMode} palette={palette} />
      <TouchableOpacity
        style={[
          styles.reciterBar,
          { backgroundColor: palette.card, borderColor: palette.border },
        ]}
        onPress={() => setShowReciterPicker(true)}
        activeOpacity={0.7}
        testID="quran-reciter-bar"
      >
        <Volume2 size={16} color={palette.accent} />
        <Text
          style={[styles.reciterBarText, { color: palette.accent }, androidTextFix]}
          numberOfLines={1}
        >
          {RECITER_NAMES[currentReciter]}
        </Text>
      </TouchableOpacity>
    </View>
  ), [lastRead, handleContinueReading, activeMode, currentReciter, palette]);

  return (
    <View
      style={[styles.container, { backgroundColor: palette.bg }]}
      testID="quran-screen"
      accessibilityLabel="Quran Screen"
    >
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
              <Text style={[styles.loadingText, { color: palette.muted }, androidTextFix]}>
                {t('loading')}
              </Text>
            </View>
          ) : surahsError ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.errorText, { color: palette.muted }, androidTextFix]}>
                {t('errorLoadingVerses')}
              </Text>
            </View>
          ) : undefined
        }
        contentContainerStyle={[
          styles.listContent,
          hasMiniPlayer ? { paddingBottom: 192 } : { paddingBottom: 112 },
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
          <View
            style={[
              styles.modalContent,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.text }, androidTextFix]}>
                {t('selectReciterTitle')}
              </Text>
              <TouchableOpacity onPress={() => setShowReciterPicker(false)}>
                <Text style={[styles.modalClose, { color: palette.accent }, androidTextFix]}>
                  {t('close')}
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {(Object.keys(RECITER_NAMES) as ReciterId[]).map((id) => (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.reciterOption,
                    currentReciter === id && { backgroundColor: palette.accentSoft },
                  ]}
                  onPress={() => handleReciterSelect(id)}
                >
                  <Text
                    style={[
                      styles.reciterOptionText,
                      { color: palette.text },
                      currentReciter === id && { color: palette.accent },
                      androidTextFix,
                    ]}
                  >
                    {RECITER_NAMES[id]}
                  </Text>
                  {currentReciter === id && (
                    <Text style={[styles.checkMark, { color: palette.accent }]}>✓</Text>
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
    backgroundColor: '#F7F4EE',
  },
  listHeader: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 112,
  },
  reciterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  reciterBarText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20,37,29,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    maxHeight: 400,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.07)',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalClose: {
    fontSize: 14,
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
  reciterOptionText: {
    fontSize: 15,
    writingDirection: 'rtl',
  },
  checkMark: {
    fontSize: 18,
    fontWeight: '700',
  },
});

const lastReadStyles = StyleSheet.create({
  container: {
    backgroundColor: GREEN_DARK,
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    ...createShadow({ offsetY: 4, opacity: 0.18, blur: 14, elevation: 6 }),
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
    backgroundColor: 'rgba(212,168,83,0.25)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F2E4C0',
  },
  surahLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.85,
    marginBottom: 2,
  },
  surahName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    writingDirection: 'rtl',
    textAlign: 'left',
    marginBottom: 4,
  },
  surahNameTransliteration: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CREAM,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
    color: GREEN_DARK,
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
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    ...createShadow({ offsetY: 2, opacity: 0.08, blur: 10, elevation: 3 }),
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
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 24,
    height: 3,
    borderRadius: 1.5,
  },
});

const surahStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 4,
    ...createShadow({ offsetY: 2, opacity: 0.06, blur: 8, elevation: 2 }),
  },
  numberBadge: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: {
    fontSize: 13,
    fontWeight: '700',
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
  },
  arabicName: {
    fontSize: 16,
    fontWeight: '700',
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
    textAlign: 'left',
  },
  dot: {
    fontSize: 13,
  },
  ayahCount: {
    fontSize: 12,
    fontWeight: '400',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  separator: {
    height: 0,
  },
});
