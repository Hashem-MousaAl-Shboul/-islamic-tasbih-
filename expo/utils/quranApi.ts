/**
 * المصدر الوحيد للاتصال بواجهة القرآن الكريم (api.alquran.cloud).
 *
 * العنوان الأساسي يُقرأ من متغير البيئة `EXPO_PUBLIC_QURAN_API_URL` هنا مرة واحدة فقط —
 * لا يجوز تكرار الرابط في أي ملف آخر؛ استورد الدوال من هذا الملف.
 *
 * الدوال المتاحة:
 * - fetchSurahList(): قائمة السور الـ114
 * - fetchSurahVerses(n): نص سورة كاملة (رسم عثماني)
 * - fetchPageVerses(n): نص صفحة مصحفية (604 صفحات)
 */

import { TOTAL_PAGES, getSurahByNumber, type SurahMeta } from '@/utils/quranData';

export const QURAN_API_URL: string =
  process.env.EXPO_PUBLIC_QURAN_API_URL ?? 'https://api.alquran.cloud/v1';

export const TOTAL_SURAHS = 114;

/** مهلة الشبكة: إلغاء الطلب فعليًا عبر AbortController عند التعليق */
const REQUEST_TIMEOUT_MS = 15_000;

export interface Verse {
  numberInSurah: number;
  arabicText: string;
  surahNumber: number;
  surahName: string;
}

export interface SurahTextResult {
  verses: Verse[];
  surahName: string;
}

interface SurahEditionResponse {
  code: number;
  status: string;
  data: {
    ayahs: Array<{ numberInSurah: number; text: string }>;
  };
}

interface PageResponse {
  code: number;
  status: string;
  data: {
    ayahs: Array<{
      numberInSurah: number;
      text: string;
      surah?: { number: number; name?: string };
    }>;
  };
}

interface SurahListResponse {
  code: number;
  status: string;
  data: Array<{
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
  }>;
}

function buildUrl(path: string): string {
  return `${QURAN_API_URL}${path}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Quran API error: ${response.status}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

/** تنظيف النص من رمز BOM والمسافات الزائدة */
function cleanArabicText(text: string): string {
  return text.replace(/^\uFEFF/, '').trim();
}

/** تحويل رقم إلى الأرقام العربية (٠-٩) لعرض أرقام الآيات */
export function toArabicDigits(num: number): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .split('')
    .map((digit) => digits[parseInt(digit, 10)] || digit)
    .join('');
}

export function clampSurahNumber(surahNumber: number): number {
  return Math.min(Math.max(Math.round(surahNumber) || 1, 1), TOTAL_SURAHS);
}

export function clampPageNumber(pageNumber: number): number {
  return Math.min(Math.max(Math.round(pageNumber) || 1, 1), TOTAL_PAGES);
}

/** جلب قائمة السور الـ114 مع رجوع لأسماء قابلة للعرض عند فشل الرد */
export async function fetchSurahList(): Promise<SurahMeta[]> {
  const json = await fetchJson<SurahListResponse>(buildUrl('/surah'));
  const list = json.data ?? [];
  return list.map((s) => ({
    number: s.number,
    name: s.name,
    englishName: s.englishName,
    englishTranslation: s.englishNameTranslation,
    revelationType: s.revelationType === 'Medinan' ? 'Medinan' : 'Meccan',
    numberOfAyahs: s.numberOfAyahs,
  }));
}

/** جلب نص سورة كاملة بالرسم العثماني */
export async function fetchSurahVerses(surahNumber: number): Promise<SurahTextResult> {
  const safeNumber = clampSurahNumber(surahNumber);
  const json = await fetchJson<SurahEditionResponse>(
    buildUrl(`/surah/${safeNumber}/quran-uthmani`)
  );

  const ayahs = json.data?.ayahs ?? [];
  const surahName = getSurahByNumber(safeNumber)?.name ?? `سورة ${safeNumber}`;

  const verses: Verse[] = ayahs.map((ayah) => ({
    numberInSurah: ayah.numberInSurah,
    arabicText: cleanArabicText(ayah.text),
    surahNumber: safeNumber,
    surahName,
  }));

  return { verses, surahName };
}

/** جلب نص صفحة مصحفية (قد تضم بداية عدة سور) */
export async function fetchPageVerses(pageNumber: number): Promise<SurahTextResult> {
  const safeNumber = clampPageNumber(pageNumber);
  const json = await fetchJson<PageResponse>(
    buildUrl(`/page/${safeNumber}/quran-uthmani`)
  );

  const ayahs = json.data?.ayahs ?? [];
  const verses: Verse[] = ayahs.map((ayah) => ({
    numberInSurah: ayah.numberInSurah,
    arabicText: cleanArabicText(ayah.text),
    surahNumber: ayah.surah?.number ?? 0,
    surahName: ayah.surah?.name ?? '',
  }));

  const firstName = verses[0]?.surahName ?? `صفحة ${safeNumber}`;
  return { verses, surahName: firstName };
}
