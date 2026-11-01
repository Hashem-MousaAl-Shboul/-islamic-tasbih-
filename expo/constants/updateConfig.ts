/**
 * إعدادات نظام التحديث داخل التطبيق — المصدر الوحيد لرابط الإعدادات البعيدة.
 *
 * صيغة ملف JSON البعيد (يستضيفه المطوّر في أي مكان ويحدّثه دون إصدار نسخة جديدة):
 * {
 *   "androidMinVersionCode": 129,   // أدنى versionCode مسموح (من app.json → android.versionCode)
 *   "iosMinVersion": "1.13.0",      // أدنى إصدار iOS مسموح (مقارنة semver)
 *   "mandatory": false,             // true = إخفاء زر «لاحقًا»
 *   "message": ""                   // رسالة اختيارية تظهر في التنبيه (فارغة = النص الافتراضي)
 * }
 *
 * يمكن تخصيص الرابط عبر متغير البيئة EXPO_PUBLIC_UPDATE_CONFIG_URL.
 */
const DEFAULT_UPDATE_CONFIG_URL =
  'https://y6fnt30m8wxs9ylhkjcut.rork.app/update-config.json';

export const UPDATE_CONFIG_URL: string =
  process.env.EXPO_PUBLIC_UPDATE_CONFIG_URL ?? DEFAULT_UPDATE_CONFIG_URL;

export interface UpdateRemoteConfig {
  androidMinVersionCode: number;
  iosMinVersion: string;
  mandatory: boolean;
  message: string;
}

export const DEFAULT_REMOTE_CONFIG: UpdateRemoteConfig = {
  androidMinVersionCode: 0,
  iosMinVersion: '0.0.0',
  mandatory: false,
  message: '',
};

/** صفحة التطبيق في متجر Play — مشتقة من اسم الحزمة في app.json */
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.islamicdhikr.sabbah';

/** رابط المتجر الأصلي لأندرويد (يفتح تطبيق Play مباشرة) */
export const PLAY_MARKET_URL = 'market://details?id=app.islamicdhikr.sabbah';

/** مقارنة semver: ترجع 1 إذا a > b، و -1 إذا a < b، و 0 إذا متساويان */
export function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}
