import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Play,
  BookOpen,
  ChevronLeft,
  Octagon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useLanguageStore } from '@/hooks/useLanguageStore';
import { androidTextFix } from '@/utils/androidOptimizations';
import AdBanner from '@/components/AdBanner';

// TODO: Replace with real API data
interface Surah {
  id: number;
  number: number;
  nameArabic: string;
  nameTransliteration: string;
  verses: number;
  type: 'meccan' | 'medinan';
  audioUrl?: string;
}

interface LastRead {
  surahNumber: number;
  surahNameArabic: string;
  surahNameTransliteration: string;
  ayahNumber: number;
  page?: number;
}

type QuranViewMode = 'surah' | 'juz' | 'page' | 'hizb';

const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';
const DARK_BG = '#1B1F2E';
const CARD_BG = '#232838';
const GOLD_CARD_BG = '#F5D088';
const GOLD_CARD_TEXT = '#1B1F2E';
const TEXT_MUTED = '#8A9B91';
const IVORY = '#F7F4EE';

const MOCK_LAST_READ: LastRead = {
  surahNumber: 1,
  surahNameArabic: 'الفاتحة',
  surahNameTransliteration: 'Al - Fatihah',
  ayahNumber: 1,
  page: 1,
};

const MOCK_SURAHS: Surah[] = [
  { id: 1, number: 1, nameArabic: 'الفاتحة', nameTransliteration: 'Al - Fatihah', verses: 7, type: 'meccan' },
  { id: 2, number: 2, nameArabic: 'البقرة', nameTransliteration: 'Al - Baqarah', verses: 286, type: 'medinan' },
  { id: 3, number: 3, nameArabic: 'آل عمران', nameTransliteration: 'Al - Imran', verses: 200, type: 'medinan' },
  { id: 4, number: 4, nameArabic: 'النساء', nameTransliteration: 'An - Nisa', verses: 176, type: 'medinan' },
  { id: 5, number: 5, nameArabic: 'المائدة', nameTransliteration: 'Al - Ma\'idah', verses: 120, type: 'medinan' },
  { id: 6, number: 6, nameArabic: 'الأنعام', nameTransliteration: 'Al - An\'am', verses: 165, type: 'meccan' },
  { id: 7, number: 7, nameArabic: 'الأعراف', nameTransliteration: 'Al - A\'raf', verses: 206, type: 'meccan' },
  { id: 8, number: 8, nameArabic: 'الأنفال', nameTransliteration: 'Al - Anfal', verses: 75, type: 'medinan' },
  { id: 9, number: 9, nameArabic: 'التوبة', nameTransliteration: 'At - Tawbah', verses: 129, type: 'medinan' },
  { id: 10, number: 10, nameArabic: 'يونس', nameTransliteration: 'Yunus', verses: 109, type: 'meccan' },
  { id: 11, number: 11, nameArabic: 'هود', nameTransliteration: 'Hud', verses: 123, type: 'meccan' },
  { id: 12, number: 12, nameArabic: 'يوسف', nameTransliteration: 'Yusuf', verses: 111, type: 'meccan' },
  { id: 13, number: 13, nameArabic: 'الرعد', nameTransliteration: 'Ar - Ra\'d', verses: 43, type: 'medinan' },
  { id: 14, number: 14, nameArabic: 'إبراهيم', nameTransliteration: 'Ibrahim', verses: 52, type: 'meccan' },
  { id: 15, number: 15, nameArabic: 'الحجر', nameTransliteration: 'Al - Hijr', verses: 99, type: 'meccan' },
];

function QuranBookIllustration() {
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
}

function LastReadCard({ lastRead, onContinue }: { lastRead: LastRead; onContinue: () => void }) {
  const { t } = useLanguageStore();

  return (
    <View style={lastReadStyles.container}>
      <View style={lastReadStyles.content}>
        <View style={lastReadStyles.textSection}>
          <View style={lastReadStyles.badge}>
            <BookOpen size={14} color={GOLD_CARD_TEXT} />
            <Text style={[lastReadStyles.badgeText, androidTextFix]}>
              {t('lastRead') || 'Last Read'}
            </Text>
          </View>
          <Text style={[lastReadStyles.surahLabel, androidTextFix]}>
            {t('surah') || 'Surah'}
          </Text>
          <Text style={[lastReadStyles.surahName, androidTextFix]}>
            {lastRead.surahNameArabic}
          </Text>
          <Text style={[lastReadStyles.surahNameTransliteration, androidTextFix]}>
            {lastRead.surahNameTransliteration}
          </Text>
          <TouchableOpacity
            style={lastReadStyles.button}
            onPress={onContinue}
            activeOpacity={0.8}
            testID="quran-continue-reading-button"
          >
            <Text style={[lastReadStyles.buttonText, androidTextFix]}>
              {t('backToReading') || 'Back to reading'}
            </Text>
            <ChevronLeft size={16} color={GOLD_CARD_TEXT} />
          </TouchableOpacity>
        </View>
        <QuranBookIllustration />
      </View>
    </View>
  );
}

function ViewModeTabs({
  activeMode,
  onChange,
}: {
  activeMode: QuranViewMode;
  onChange: (mode: QuranViewMode) => void;
}) {
  const { t } = useLanguageStore();

  const modes: { key: QuranViewMode; label: string }[] = useMemo(
    () => [
      { key: 'surah', label: t('surahTab') || 'Surah' },
      { key: 'juz', label: t('juzTab') || 'Para' },
      { key: 'page', label: t('pageTab') || 'Page' },
      { key: 'hizb', label: t('hizbTab') || 'Hizb' },
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
            {isActive ? <View style={tabsStyles.activeIndicator} /> : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function SurahItem({
  surah,
  onPlay,
  isPlaying,
}: {
  surah: Surah;
  onPlay: (surah: Surah) => void;
  isPlaying: boolean;
}) {
  const { t } = useLanguageStore();

  return (
    <View style={surahStyles.container}>
      <View style={surahStyles.numberBadge}>
        <Text style={[surahStyles.numberText, androidTextFix]}>{surah.number}</Text>
      </View>
      <View style={surahStyles.textSection}>
        <Text style={[surahStyles.arabicName, androidTextFix]}>{surah.nameArabic}</Text>
        <Text style={[surahStyles.transliterationName, androidTextFix]}>
          {surah.nameTransliteration}
        </Text>
      </View>
      <TouchableOpacity
        style={[surahStyles.playButton, isPlaying && surahStyles.playButtonActive]}
        onPress={() => onPlay(surah)}
        activeOpacity={0.8}
        testID={`quran-play-surah-${surah.number}`}
        accessibilityLabel={`${t('playSurah')} ${surah.nameArabic}`}
      >
        <Play size={18} color={DARK_BG} fill={DARK_BG} />
      </TouchableOpacity>
    </View>
  );
}

export default function QuranScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguageStore();
  const [activeMode, setActiveMode] = useState<QuranViewMode>('surah');
  const [playingSurahId, setPlayingSurahId] = useState<number | null>(null);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleContinueReading = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    console.log('[QuranScreen] Continue reading tapped:', MOCK_LAST_READ);
    // TODO: Navigate to reader screen with last read position
  }, []);

  const handlePlaySurah = useCallback((surah: Surah) => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setPlayingSurahId((prev) => (prev === surah.id ? null : surah.id));
    console.log('[QuranScreen] Play surah tapped:', surah.number, surah.nameArabic);
    // TODO: Connect to Quran audio service / reciter store
  }, []);

  const renderSurahItem = useCallback(
    ({ item }: { item: Surah }) => (
      <SurahItem
        surah={item}
        onPlay={handlePlaySurah}
        isPlaying={playingSurahId === item.id}
      />
    ),
    [handlePlaySurah, playingSurahId]
  );

  const keyExtractor = useCallback((item: Surah) => `surah-${item.id}`, []);

  const itemSeparator = useCallback(() => <View style={surahStyles.separator} />, []);

  return (
    <View style={styles.container} testID="quran-screen" accessibilityLabel="Quran Screen">
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            testID="quran-back-button"
          >
            <ArrowRight size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, androidTextFix]}>
            {t('quranKareem') || 'القرآن الكريم'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <FlatList
        data={MOCK_SURAHS}
        renderItem={renderSurahItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={itemSeparator}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <LastReadCard lastRead={MOCK_LAST_READ} onContinue={handleContinueReading} />
            <ViewModeTabs activeMode={activeMode} onChange={setActiveMode} />
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        initialNumToRender={12}
        maxToRenderPerBatch={20}
        windowSize={10}
      />

      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  header: {
    backgroundColor: DEEP_GREEN,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    writingDirection: 'rtl',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 40,
  },
  listHeader: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
});

const lastReadStyles = StyleSheet.create({
  container: {
    backgroundColor: GOLD_CARD_BG,
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
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
    fontWeight: '600' as const,
    color: GOLD_CARD_TEXT,
  },
  surahLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: GOLD_CARD_TEXT,
    opacity: 0.7,
    marginBottom: 2,
  },
  surahName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: GOLD_CARD_TEXT,
    writingDirection: 'rtl',
    textAlign: 'left',
    marginBottom: 4,
  },
  surahNameTransliteration: {
    fontSize: 14,
    fontWeight: '500' as const,
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
    fontWeight: '600' as const,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
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
    fontWeight: '600' as const,
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
  activeTab: {
    // No background, just indicator below
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: TEXT_MUTED,
  },
  activeTabText: {
    color: GOLD,
    fontWeight: '700' as const,
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
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  numberBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: GOLD,
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
  },
  arabicName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    writingDirection: 'rtl',
    textAlign: 'left',
    marginBottom: 4,
  },
  transliterationName: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: TEXT_MUTED,
    textAlign: 'left',
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GOLD,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  playButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});
