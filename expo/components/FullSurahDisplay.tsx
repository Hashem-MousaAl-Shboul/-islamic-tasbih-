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

// ثيم «القرآن» المرجعي (أخضر مريمي فاتح)
const GREEN_DARK = '#3E6B54';
const AYAH_CARD_BG = '#F1F5EB';
const AYAH_CARD_BORDER = 'rgba(62,107,84,0.12)';
const CARD_WHITE = '#FFFFFF';
const TEXT_DARK = '#2F3B33';
const TEXT_MUTED = '#7C8A7E';

interface FullSurahDisplayProps {
  /** رقم السورة (1-114) — يُتجاهل إذا مُرّرت صفحة */
  surahNumber?: number;
  /** رقم الصفحة المصحفية (1-604) */
  pageNumber?: number;
}

/**
 * شاشة عرض السورة/الصفحة كاملة: تطلب النص من useQuranAudio (الجسر الوحيد)،
 * وتعرض: جارٍ التحميل → اسم السورة وعدد الآيات، ثم كل آية في بطاقة مستقلة
 * (بطاقة خضراء فاتحة + شارة رقم الآية الدائرية) على طراز تصميم Al-Quran Pro.
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

  const verses = surahText?.verses;

  // فواصل أسماء السور في وضع الصفحة: تظهر عند تغيّر السورة داخل الصفحة
  const surahChangeIndices = useMemo(() => {
    if (!verses) return new Set<number>();
    const changed = new Set<number>();
    let prev = 0;
    verses.forEach((v: Verse, i: number) => {
      if (v.surahNumber !== prev) {
        changed.add(i);
        prev = v.surahNumber;
      }
    });
    return changed;
  }, [verses]);

  if (isLoadingText) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={GREEN_DARK} />
        <Text style={[styles.loadingText, androidTextFix]}>{t('loadingVerses')}</Text>
      </View>
    );
  }

  if (isTextError || surahText === null || !surahText.verses) {
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
            <ActivityIndicator size="small" color={CARD_WHITE} />
          ) : (
            <Text style={[styles.retryButtonText, androidTextFix]}>{t('retry')}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  const verseList = surahText.verses;

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
                  {surahMeta?.numberOfAyahs ?? verseList.length} {t('ayahs')}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      {verseList.map((item: Verse, index: number) => (
        <React.Fragment key={`verse-${item.surahNumber}-${item.numberInSurah}`}>
          {isPageMode && surahChangeIndices.has(index) && index > 0 && (
            <View style={styles.surahDivider}>
              <View style={styles.surahDividerLine} />
              <View style={styles.surahDividerPill}>
                <Text style={[styles.surahDividerText, androidTextFix]} numberOfLines={1}>
                  {item.surahName}
                </Text>
              </View>
              <View style={styles.surahDividerLine} />
            </View>
          )}
          <View style={styles.ayahCard}>
            <View style={styles.ayahBadge}>
              <Text style={[styles.ayahBadgeText, androidTextFix]}>
                {toArabicDigits(item.numberInSurah)}
              </Text>
            </View>
            <Text style={[styles.ayahArabicText, androidTextFix]}>{item.arabicText}</Text>
          </View>
        </React.Fragment>
      ))}
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
    color: '#C0504D',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: GREEN_DARK,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  retryButtonText: {
    color: CARD_WHITE,
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
    backgroundColor: 'rgba(62,107,84,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(62,107,84,0.2)',
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: GREEN_DARK,
  },
  surahDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 14,
  },
  surahDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(62,107,84,0.2)',
  },
  surahDividerPill: {
    backgroundColor: GREEN_DARK,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    maxWidth: '70%',
  },
  surahDividerText: {
    fontSize: 14,
    fontWeight: '700',
    color: CARD_WHITE,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  ayahCard: {
    backgroundColor: AYAH_CARD_BG,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AYAH_CARD_BORDER,
  },
  ayahBadge: {
    alignSelf: 'flex-end',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: GREEN_DARK,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  ayahBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: GREEN_DARK,
  },
  ayahArabicText: {
    fontSize: 24,
    color: TEXT_DARK,
    writingDirection: 'rtl',
    textAlign: 'right',
    lineHeight: 48,
  },
});
