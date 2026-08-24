import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Tabs } from 'expo-router';

import {
  BookOpen,
  BookOpenCheck,
  CircleDot,
  Compass,
  SlidersHorizontal,
} from 'lucide-react-native';

import {
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { useLanguageStore } from '@/hooks/useLanguageStore';
import { Colors } from '@/constants/colors';

import { AudioProgressBar } from '@/components/AudioProgressBar';
import OptimizedTabBar from '@/components/OptimizedTabBar';

import { yasAI } from '@/utils/yasAI';

/* ==========================================================================
   Constants
   ========================================================================== */

const TAB_TAG = '[واجهة التبويبات]';

/* ==========================================================================
   Types
   ========================================================================== */

type PlaybackState = {
  isPlaying: boolean;
  currentId: string | null;
};

/* ==========================================================================
   Debug Logger
   ========================================================================== */

const log = (...args: unknown[]) => {
  if (__DEV__) {
    console.log(TAB_TAG, ...args);
  }
};

const logError = (...args: unknown[]) => {
  if (__DEV__) {
    console.error(TAB_TAG, ...args);
  }
};

/* ==========================================================================
   Component
   ========================================================================== */

export default function TabLayout() {
  const { t } = useLanguageStore();

  /**
   * يظهر شريط الصوت عندما يكون هناك Audio ID.
   *
   * ملاحظة:
   * الشريط يبقى ظاهراً أثناء Pause لأن currentId
   * يبقى موجوداً.
   */
  const [isBarVisible, setIsBarVisible] =
    useState(false);

  /**
   * حفظ دالة unsubscribe لمنع Memory Leak.
   */
  const unsubscribeRef =
    useRef<(() => void) | null>(null);

  /**
   * منع تحديث State بعد unmount.
   */
  const mountedRef = useRef(false);

  /* ==========================================================================
     Tab Configuration
     ========================================================================== */

  const screenOptions = useMemo(
    () => ({
      headerShown: false,

      tabBarActiveTintColor:
        Colors.primary,

      tabBarInactiveTintColor:
        Colors.dark.textSecondary,

      tabBarShowLabel: true,

      tabBarHideOnKeyboard:
        Platform.OS === 'ios',

      lazy: true,

      tabBarAllowFontScaling: false,

      tabBar: (
        props: BottomTabBarProps
      ) => (
        <OptimizedTabBar {...props} />
      ),
    }),
    []
  );

  /* ==========================================================================
     Audio Listener
     ========================================================================== */

  useEffect(() => {
    mountedRef.current = true;

    log(
      'جاري تهيئة مستمع الصوت'
    );

    /**
     * استقبال أي تغيير في حالة التشغيل.
     *
     * currentId !== null:
     * - Playing  → الشريط ظاهر
     * - Paused   → الشريط ظاهر
     *
     * currentId === null:
     * - Stopped  → الشريط مخفي
     */
    const handlePlaybackChange = (
      state: PlaybackState
    ) => {
      if (!mountedRef.current) {
        return;
      }

      const visible =
        state.currentId !== null;

      setIsBarVisible(visible);

      log(
        'تغيرت حالة الصوت:',
        {
          isPlaying: state.isPlaying,
          currentId: state.currentId,
          barVisible: visible,
        }
      );
    };

    try {
      /**
       * تسجيل listener مباشرة.
       *
       * لا نستخدم setTimeout هنا لأن التأخير
       * قد يؤدي إلى فقدان أحداث الصوت.
       */
      const unsubscribe =
        yasAI.addListener(
          handlePlaybackChange
        );

      /**
       * حفظ unsubscribe للتنظيف.
       */
      if (
        typeof unsubscribe ===
        'function'
      ) {
        unsubscribeRef.current =
          unsubscribe;
      }

      /**
       * الحصول على الحالة الحالية بعد
       * تسجيل listener.
       */
      const initialState =
        yasAI.getPlaybackState();

      if (mountedRef.current) {
        setIsBarVisible(
          initialState.currentId !== null
        );

        log(
          'الحالة الأولية للصوت:',
          initialState
        );
      }
    } catch (error) {
      logError(
        'فشل إعداد مستمع الصوت:',
        error
      );

      /**
       * في حالة فشل إعداد listener،
       * نتأكد أن الشريط مخفي.
       */
      if (mountedRef.current) {
        setIsBarVisible(false);
      }
    }

    /* ------------------------------------------------------------------------
       Cleanup
       ------------------------------------------------------------------------ */

    return () => {
      mountedRef.current = false;

      /**
       * إزالة listener عند مغادرة TabLayout.
       */
      if (unsubscribeRef.current) {
        try {
          unsubscribeRef.current();
        } catch (error) {
          logError(
            'حدث خطأ أثناء إزالة مستمع الصوت:',
            error
          );
        } finally {
          unsubscribeRef.current = null;
        }
      }

      log(
        'تم تنظيف مستمع الصوت بنجاح'
      );
    };
  }, []);

  /* ==========================================================================
     Close Audio Bar
     ========================================================================== */

  const handleCloseBar =
    useCallback(async () => {
      log(
        'طلب إغلاق شريط الصوت'
      );

      try {
        /**
         * إيقاف الصوت من المصدر الأساسي.
         *
         * yasAI يجب أن يرسل بعدها حالة:
         * currentId = null
         *
         * وبالتالي listener سيخفي الشريط
         * أيضاً.
         */
        await yasAI.stop();

        /**
         * تحديث فوري للواجهة.
         *
         * هذا يجعل الشريط يختفي مباشرة حتى
         * لو تأخر listener قليلاً.
         */
        if (mountedRef.current) {
          setIsBarVisible(false);
        }

        log(
          'تم إيقاف الصوت وإغلاق الشريط بنجاح'
        );
      } catch (error) {
        /**
         * لا نخفي الشريط عند حدوث خطأ.
         *
         * السبب:
         * إذا فشل stop() فقد يكون الصوت ما زال يعمل.
         */
        logError(
          'فشل إيقاف الصوت:',
          error
        );
      }
    }, []);

  /* ==========================================================================
     Render
     ========================================================================== */

  return (
    <View
      style={styles.root}
      testID="tabs-root"
    >
      <Tabs
        screenOptions={screenOptions}
      >
        {/* ==================================================================
            Settings
            ================================================================== */}

        <Tabs.Screen
          name="settings"
          options={{
            title:
              t('settings') ||
              'الإعدادات',

            tabBarIcon: ({
              color,
              size,
            }) => (
              <SlidersHorizontal
                size={size}
                color={color}
                strokeWidth={1.8}
              />
            ),
          }}
        />

        {/* ==================================================================
            Adhkar
            ================================================================== */}

        <Tabs.Screen
          name="adhkar"
          options={{
            title:
              t('adhkar') ||
              'الأذكار',

            tabBarIcon: ({
              color,
              size,
            }) => (
              <BookOpen
                size={size}
                color={color}
                strokeWidth={1.8}
              />
            ),
          }}
        />

        {/* ==================================================================
            Quran
            ================================================================== */}

        <Tabs.Screen
          name="quran"
          options={{
            title:
              t('quranKareem') ||
              'القرآن الكريم',

            tabBarIcon: ({
              color,
              size,
            }) => (
              <BookOpenCheck
                size={size}
                color={color}
                strokeWidth={1.8}
              />
            ),
          }}
        />

        {/* ==================================================================
            Qibla
            ================================================================== */}

        <Tabs.Screen
          name="qibla"
          options={{
            title:
              t('qibla') ||
              'القبلة',

            tabBarIcon: ({
              color,
              size,
            }) => (
              <Compass
                size={size}
                color={color}
                strokeWidth={1.8}
              />
            ),
          }}
        />

        {/* ==================================================================
            Tasbih
            ================================================================== */}

        <Tabs.Screen
          name="tasbih"
          options={{
            title:
              t('tasbih') ||
              'التسبيح',

            tabBarIcon: ({
              color,
              size,
            }) => (
              <CircleDot
                size={size}
                color={color}
                strokeWidth={2.2}
                fill={color}
              />
            ),
          }}
        />
      </Tabs>

      {/* ======================================================================
          Audio Progress Bar
          ====================================================================== */}

      <AudioProgressBar
        isVisible={isBarVisible}
        onClose={handleCloseBar}
      />
    </View>
  );
}

/* ==========================================================================
   Styles
   ========================================================================== */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F4EE',
  },
});