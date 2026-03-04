import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { ar } from './ar';
import { en } from './en';
import { fr } from './fr';
import { es } from './es';
import { ur } from './ur';
import { id } from './id';
import { tr } from './tr';
import { ms } from './ms';
import { bn } from './bn';

export type { TranslationKeys } from './types';

const i18n = new I18n({
  ar,
  en,
  fr,
  es,
  ur,
  id,
  tr,
  ms,
  bn,
});

try {
  const deviceLocale = Localization.getLocales()[0]?.languageTag || 'en-US';
  i18n.locale = deviceLocale;
} catch (error) {
  console.error('Error setting initial locale:', error);
  i18n.locale = 'en-US';
}

i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;

export const getCurrentLanguage = () => {
  try {
    const locale = i18n.locale || 'en-US';
    if (typeof locale !== 'string') {
      console.error('Invalid locale type:', typeof locale, locale);
      return 'en';
    }
    
    if (locale.startsWith('ar')) return 'ar';
    if (locale.startsWith('ur')) return 'ur';
    if (locale.startsWith('fr')) return 'fr';
    if (locale.startsWith('es')) return 'es';
    if (locale.startsWith('id')) return 'id';
    if (locale.startsWith('tr')) return 'tr';
    if (locale.startsWith('ms')) return 'ms';
    if (locale.startsWith('bn')) return 'bn';
    return 'en';
  } catch (error) {
    console.error('Error getting current language:', error);
    return 'en';
  }
};

export const isRTL = () => {
  try {
    const lang = getCurrentLanguage();
    return ['ar', 'ur'].includes(lang);
  } catch (error) {
    console.error('Error checking RTL:', error);
    return false;
  }
};

export const AVAILABLE_LANGUAGES = [
  { code: 'ar', name: 'العربية', nativeName: 'العربية' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'Français', nativeName: 'Français' },
  { code: 'es', name: 'Español', nativeName: 'Español' },
  { code: 'ur', name: 'اردو', nativeName: 'اردو' },
  { code: 'id', name: 'Bahasa Indonesia', nativeName: 'Bahasa Indonesia' },
  { code: 'tr', name: 'Türkçe', nativeName: 'Türkçe' },
  { code: 'ms', name: 'Bahasa Melayu', nativeName: 'Bahasa Melayu' },
  { code: 'bn', name: 'বাংলা', nativeName: 'বাংলা' },
];
