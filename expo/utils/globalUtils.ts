import { Platform, Linking, Share, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as StoreReview from 'expo-store-review';
import Constants from 'expo-constants';
import i18n from '@/constants/translations';

// App Store URLs for different platforms
const APP_STORE_URLS = {
  ios: 'https://apps.apple.com/app/sabbah-tasbih/id6744919498',
  android: 'https://play.google.com/store/apps/details?id=app.islamicdhikr.sabbah',
  web: 'https://subbah.app',
};

// Social media and contact information
const CONTACT_INFO = {
  whatsapp: '+962788625580',
  email: 'support@sabbah-app.com',
  website: 'https://subbah.app',
  facebook: 'https://facebook.com/sabbahapp',
  twitter: 'https://twitter.com/sabbahapp',
  instagram: 'https://instagram.com/sabbahapp',
};

// Web clipboard copy with multiple fallbacks
const webCopyToClipboard = async (text: string): Promise<boolean> => {
  if (Platform.OS !== 'web') return false;

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    console.warn('Modern Clipboard API blocked:', e);
  }

  try {
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (success) return true;
    }
  } catch (e) {
    console.warn('Legacy execCommand copy failed:', e);
  }

  return false;
};

const webShareOrCopy = async (title: string, text: string): Promise<void> => {
  if (Platform.OS !== 'web') return;

  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title, text });
      console.log('Shared via Web Share API');
      return;
    }
  } catch (webError: any) {
    if (webError?.name === 'AbortError') return;
    console.warn('Web Share API failed:', webError);
  }

  const copied = await webCopyToClipboard(text);
  if (copied) {
    Alert.alert('', i18n.t('copiedToClipboard') || 'تم النسخ إلى الحافظة');
  } else {
    Alert.alert(i18n.t('shareApp') || 'مشاركة', text);
  }
};

export const shareApp = async () => {
  try {
    const shareMessage = i18n.t('shareMessage');
    const appUrl = Platform.select({
      ios: APP_STORE_URLS.ios,
      android: APP_STORE_URLS.android,
      default: APP_STORE_URLS.web,
    });
    const fullMessage = `${shareMessage}\n\n${appUrl}`;

    if (Platform.OS === 'web') {
      await webShareOrCopy(i18n.t('appName'), fullMessage);
      return;
    }

    const result = await Share.share({
      message: fullMessage,
      url: appUrl,
      title: i18n.t('appName'),
    });

    if (result.action === Share.sharedAction) {
      console.log('App shared successfully');
    }
  } catch (error) {
    console.error('Error sharing app:', error);
    Alert.alert(i18n.t('error'), 'Failed to share app');
  }
};

// Rate app functionality — opens the store listing directly
export const rateApp = async () => {
  try {
    if (Platform.OS === 'web') {
      const url = APP_STORE_URLS.web;
      await WebBrowser.openBrowserAsync(url);
      return;
    }

    const url = Platform.select({
      ios: APP_STORE_URLS.ios,
      android: APP_STORE_URLS.android,
      default: APP_STORE_URLS.web,
    });

    console.log('[RateApp] Opening store URL:', url);
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      await WebBrowser.openBrowserAsync(url);
    }
  } catch (error) {
    console.error('[RateApp] Error:', error);
    Alert.alert(i18n.t('error'), i18n.t('cantOpenStore'));
  }
};

// Contact us via WhatsApp
export const contactViaWhatsApp = async () => {
  try {
    const contactMessage = i18n.t('contactMessage') || 'مرحباً، أحتاج مساعدة في تطبيق التسبيح';
    const message = encodeURIComponent(contactMessage);
    const whatsappUrl = `whatsapp://send?phone=${CONTACT_INFO.whatsapp}&text=${message}`;
    const webWhatsappUrl = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${message}`;

    // Try to open WhatsApp app first
    const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);
    
    if (canOpenWhatsApp) {
      await Linking.openURL(whatsappUrl);
    } else {
      // Fallback to web WhatsApp
      await WebBrowser.openBrowserAsync(webWhatsappUrl);
    }
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
    Alert.alert(i18n.t('error') || 'خطأ', 'Failed to open WhatsApp');
  }
};

// Contact us via Email
export const contactViaEmail = async () => {
  try {
    const subject = encodeURIComponent(`${i18n.t('appName')} - Contact`);
    const body = encodeURIComponent(i18n.t('contactMessage'));
    const emailUrl = `mailto:${CONTACT_INFO.email}?subject=${subject}&body=${body}`;

    const canOpenEmail = await Linking.canOpenURL(emailUrl);
    if (canOpenEmail) {
      await Linking.openURL(emailUrl);
    } else {
      Alert.alert(i18n.t('error'), 'No email app found');
    }
  } catch (error) {
    console.error('Error opening email:', error);
    Alert.alert(i18n.t('error'), 'Failed to open email');
  }
};

// Open website
export const openWebsite = async () => {
  try {
    await WebBrowser.openBrowserAsync(CONTACT_INFO.website);
  } catch (error) {
    console.error('Error opening website:', error);
    Alert.alert(i18n.t('error'), 'Failed to open website');
  }
};

// Open social media links
export const openSocialMedia = async (platform: 'facebook' | 'twitter' | 'instagram') => {
  try {
    const url = CONTACT_INFO[platform];
    await WebBrowser.openBrowserAsync(url);
  } catch (error) {
    console.error(`Error opening ${platform}:`, error);
    Alert.alert(i18n.t('error'), `Failed to open ${platform}`);
  }
};

// Privacy policy
export const openPrivacyPolicy = async () => {
  try {
    const privacyUrl = `${CONTACT_INFO.website}/privacy`;
    await WebBrowser.openBrowserAsync(privacyUrl);
  } catch (error) {
    console.error('Error opening privacy policy:', error);
    Alert.alert(i18n.t('error'), 'Failed to open privacy policy');
  }
};

// Terms of service
export const openTermsOfService = async () => {
  try {
    const termsUrl = `${CONTACT_INFO.website}/terms`;
    await WebBrowser.openBrowserAsync(termsUrl);
  } catch (error) {
    console.error('Error opening terms of service:', error);
    Alert.alert(i18n.t('error'), 'Failed to open terms of service');
  }
};

// Get app version
export const getAppVersion = (): string => {
  return Constants.expoConfig?.version ?? '1.0.0';
};

// Analytics tracking for global distribution
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // In a real app, you would integrate with analytics services like:
  // - Google Analytics
  // - Firebase Analytics
  // - Mixpanel
  // - Amplitude
  
  console.log('Analytics Event:', eventName, properties);
  
  // Example implementation:
  // Analytics.track(eventName, {
  //   ...properties,
  //   language: i18n.locale,
  //   platform: Platform.OS,
  //   timestamp: new Date().toISOString(),
  // });
};

// Language-specific app store URLs
export const getLocalizedAppStoreUrl = () => {
  const language = i18n.locale;
  const baseUrl = Platform.select({
    ios: APP_STORE_URLS.ios,
    android: APP_STORE_URLS.android,
    default: APP_STORE_URLS.web,
  });
  
  // Add language parameter for localized store pages
  return `${baseUrl}?hl=${language}`;
};

// Currency and region-specific features
export const getRegionInfo = () => {
  const language = i18n.locale;
  
  // Map languages to regions for potential future features
  const regionMap: Record<string, { currency: string; region: string; rtl: boolean }> = {
    'ar': { currency: 'USD', region: 'MENA', rtl: true },
    'en': { currency: 'USD', region: 'Global', rtl: false },
    'fr': { currency: 'EUR', region: 'Europe', rtl: false },
    'es': { currency: 'EUR', region: 'Europe', rtl: false },
    'ur': { currency: 'PKR', region: 'South Asia', rtl: true },
    'id': { currency: 'IDR', region: 'Southeast Asia', rtl: false },
    'tr': { currency: 'TRY', region: 'Turkey', rtl: false },
    'ms': { currency: 'MYR', region: 'Southeast Asia', rtl: false },
    'bn': { currency: 'BDT', region: 'South Asia', rtl: false },
  };
  
  return regionMap[language] || regionMap['en'];
};

// Time zone and prayer time integration helpers
export const getLocalizedTimeFormat = () => {
  const language = i18n.locale;
  
  // Return appropriate time format for each region
  const timeFormats: Record<string, { format: '12h' | '24h'; locale: string }> = {
    'ar': { format: '12h', locale: 'ar-SA' },
    'en': { format: '12h', locale: 'en-US' },
    'fr': { format: '24h', locale: 'fr-FR' },
    'es': { format: '24h', locale: 'es-ES' },
    'ur': { format: '12h', locale: 'ur-PK' },
    'id': { format: '24h', locale: 'id-ID' },
    'tr': { format: '24h', locale: 'tr-TR' },
    'ms': { format: '12h', locale: 'ms-MY' },
    'bn': { format: '12h', locale: 'bn-BD' },
  };
  
  return timeFormats[language] || timeFormats['en'];
};

// Performance optimization utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memory optimization
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Platform-specific optimizations
export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Animation optimization
export const getOptimizedDuration = (baseDuration: number): number => {
  if (isWeb) return Math.min(baseDuration * 0.7, 120);
  return Math.min(baseDuration, 150);
};

export const getOptimizedDelay = (baseDelay: number): number => {
  if (isWeb) return Math.min(baseDelay * 0.5, 30);
  return Math.min(baseDelay, 50);
};

// Performance monitoring
export const performanceLog = (label: string, fn: () => void) => {
  if (__DEV__) {
    const start = Date.now();
    fn();
    const end = Date.now();
    console.log(`[Performance] ${label}: ${end - start}ms`);
  } else {
    fn();
  }
};

// Memory cleanup utilities
export const cleanupAnimations = (animations: any[]) => {
  animations.forEach(animation => {
    if (animation && typeof animation.stop === 'function') {
      animation.stop();
    }
  });
};

// Optimized array operations
export const fastArrayUpdate = <T>(
  array: T[],
  index: number,
  updater: (item: T) => T
): T[] => {
  return array.map((item, i) => i === index ? updater(item) : item);
};

export const fastArrayFilter = <T>(
  array: T[],
  predicate: (item: T) => boolean
): T[] => {
  const result: T[] = [];
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      result.push(array[i]);
    }
  }
  return result;
};