import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useQuranAudio } from '@/hooks/useQuranAudio';
import { getSurahByNumber, getSurahTypeLabel, TOTAL_PAGES } from '@/utils/quranData';
import { toArabicDigits, type Verse } from '@/utils/quranApi';
import { androidTextFix } from '@/utils/androidOptimizations';

const GOLD = '#D4A853';
const DARK_BG = '#1B1F2E';
const CARD_BG = '#232838';
const CARD_BORDER = 'rgba(212,168,83,0.15)';
const TEXT_MUTED = '#8A9B91';

interface FullSurahDisplayProps {
  /** رقم السورة (1-114) — يُتجاهل إذا مُرّرت صفحة */
  surahNumber?: number;
  /** رقم الصفحة المصحفية (1-604) */
  pageNumber?: number;
}

/**
 * شاشة عرض السورة/الصفحة كاملة: تطلب النص من useQuranAudio (الجسر الوحيد)،
 * وتعرض: جارٍ التحميل → اسم السورة وعدد الآيات والنص كاملًا، أو فشل + إعادة محاولة.
 * الآيات متصلة جنب بعض بأسلوب المصحف، ورقم كل آية داخل علامة ۝.
 */
export default function FullSurahDisplay({ surahNumber, pageNumber }: FullSurahDisplayProps) {
  const { t } = useLanguageStore();
  const {
    surahText,
    isLoadingText,
    isTextError,
    isTextFetching,
    loadSurahText,
    loadPageText,
    retryText,
  } = useQuranAudio();

  const safePageNumber =
    typeof pageNumber === 'number' && pageNumber >= 1 && pageNumber <= TOTAL_PAGES
      ? pageNumber
      : undefined;
  const isPageMode = safePageNumber !== undefined;
  const safeSurahNumber = Math.min(Math.max(surahNumber ?? 1, 1), 114);

  // طلب البيانات من المخزن عند تغيّر الهدف
  useEffect(() => {
    if (isPageMode) {
      loadPageText(safePageNumber);
    } else {
      loadSurahText(safeSurahNumber);
    }
  }, [isPageMode, safePageNumber, safeSurahNumber, loadPageText, loadSurahText]);

  const surahMeta = useMemo(
    () => (isPageMode ? null : getSurahByNumber(safeSurahNumber)),
    [isPageMode, safeSurahNumber]
  );

  if (isLoadingText) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={[styles.loadingText, androidTextFix]}>{t('loadingVerses')}</Text>
      </View>
    );
  }

  if (isTextError || !surahText) {
    return (
      <View style={styles.centerContent}>
        <Text style={[styles.errorText, androidTextFix]}>{t('errorLoadingVerses')}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={retryText}
          disabled={isTextFetching}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('retry')}
        >
          {isTextFetching ? (
            <ActivityIndicator size="small" color={DARK_BG} />
          ) : (
            <Text style={[styles.retryButtonText, androidTextFix]}>{t('retry')}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  const verses = surahText.verses;

  return (
    <View>
      <View style={styles.surahHeader}>
        <View style={styles.surahMetaRow}>
          {isPageMode ? (
            <>
              <View style={styles.metaPill}>
                <Text style={[styles.metaPillText, androidTextFix]}>
                  {t('page')} {safePageNumber}
                </Text>
              </View>
              <View style={styles.metaPill}>
                <Text style={[styles.metaPillText, androidTextFix]}>
                  {safePageNumber} / {TOTAL_PAGES}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.metaPill}>
                <Text style={[styles.metaPillText, androidTextFix]}>
                  {surahMeta?.name ?? surahText.surahName}
                </Text>
              </View>
              {surahMeta ? (
                <View style={styles.metaPill}>
                  <Text style={[styles.metaPillText, androidTextFix]}>
                    {getSurahTypeLabel(surahMeta.revelationType)}
                  </Text>
                </View>
              ) : null}
              <View style={styles.metaPill}>
                <Text style={[styles.metaPillText, androidTextFix]}>
                  {surahMeta?.numberOfAyahs ?? verses.length} {t('ayahs')}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.mushafCard}>
        <Text style={[styles.quranParagraphText, androidTextFix]}>
          {verses.map((item: Verse) => (
            <React.Fragment key={`verse-${item.surahNumber}-${item.numberInSurah}`}>
              <Text>{item.arabicText} </Text>
              <Text style={styles.ayahSymbolText}>
                {` ۝${toArabicDigits(item.numberInSurah)} `}
              </Text>
              <Text> </Text>
            </React.Fragment>
          ))}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
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
    minHeight: 44,
    justifyContent: 'center',
  },
  retryButtonText: {
    color: DARK_BG,
    fontSize: 15,
    fontWeight: '700',
  },
  surahHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  surahMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
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
    fontWeight: '600',
    color: GOLD,
  },
  mushafCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  quranParagraphText: {
    fontSize: 23,
    color: '#FFFFFF',
    writingDirection: 'rtl',
    textAlign: 'right',
    lineHeight: 52,
  },
  ayahSymbolText: {
    color: GOLD,
    fontSize: 20,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
});
