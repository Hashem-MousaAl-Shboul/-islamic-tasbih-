import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import i18n, { getCurrentLanguage, isRTL, AVAILABLE_LANGUAGES } from '@/constants/translations';
import { I18nManager, Platform } from 'react-native';

const LANGUAGE_STORAGE_KEY = 'app_language';

export const [LanguageProvider, useLanguageStore] = createContextHook(() => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    try {
      return getCurrentLanguage() || 'en';
    } catch (error) {
      console.error('Error getting initial language:', error);
      return 'en';
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const loadSavedLanguage = async () => {
      try {
        let languageToSet = 'ar';
        
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        
        if (!mounted) return;
        
        if (savedLanguage && AVAILABLE_LANGUAGES.find(lang => lang.code === savedLanguage)) {
          languageToSet = savedLanguage;
        } else {
          const defaultLang = getCurrentLanguage();
          if (defaultLang) {
            languageToSet = defaultLang;
          }
        }
        
        if (mounted) {
          i18n.locale = languageToSet;
          setCurrentLanguage(languageToSet);
          setIsLoading(false);
          console.log('[LanguageStore] Language loaded:', languageToSet);
        }
      } catch (error) {
        console.error('Error loading saved language:', error);
        if (mounted) {
          i18n.locale = 'ar';
          setCurrentLanguage('ar');
          setIsLoading(false);
        }
      }
    };
    
    loadSavedLanguage();
    
    return () => {
      mounted = false;
    };
  }, []);

  const changeLanguage = useCallback(async (languageCode: string) => {
    try {
      let validatedCode = languageCode;
      
      if (!validatedCode || typeof validatedCode !== 'string') {
        console.error('Invalid language code:', validatedCode);
        validatedCode = 'en';
      }
      
      const validLanguage = AVAILABLE_LANGUAGES.find(lang => lang.code === validatedCode);
      if (!validLanguage) {
        console.error('Language not found:', validatedCode);
        validatedCode = 'en';
      }
      
      i18n.locale = validatedCode;
      setCurrentLanguage(validatedCode);
      
      if (Platform.OS !== 'web') {
        AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, validatedCode).catch(err => {
          console.error('Error saving language:', err);
        });
      } else {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(LANGUAGE_STORAGE_KEY, validatedCode);
          }
        } catch (err) {
          console.error('Error saving language to localStorage:', err);
        }
      }
      
      const shouldBeRTL = ['ar', 'ur'].includes(validatedCode);
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
      }
      
      console.log(`Language changed to: ${validatedCode}`);
    } catch (error) {
      console.error('Error changing language:', error);
      try {
        i18n.locale = 'en';
        setCurrentLanguage('en');
      } catch (fallbackError) {
        console.error('Error setting fallback language:', fallbackError);
      }
    }
  }, []);

  const t = useCallback((key: string, options?: any) => {
    try {
      return i18n.t(key, options);
    } catch (error) {
      console.error('Translation error:', error, 'key:', key);
      return key;
    }
  }, [currentLanguage]);

  const getCurrentLanguageInfo = useCallback(() => {
    const languageInfo = AVAILABLE_LANGUAGES.find(lang => lang.code === currentLanguage);
    return languageInfo || AVAILABLE_LANGUAGES.find(lang => lang.code === 'en') || AVAILABLE_LANGUAGES[0];
  }, [currentLanguage]);

  const isRTLValue = useMemo(() => isRTL(), [currentLanguage]);

  return useMemo(() => ({
    currentLanguage,
    isLoading,
    isRTL: isRTLValue,
    availableLanguages: AVAILABLE_LANGUAGES,
    changeLanguage,
    t,
    getCurrentLanguageInfo,
  }), [currentLanguage, isLoading, isRTLValue, changeLanguage, t, getCurrentLanguageInfo]);
});