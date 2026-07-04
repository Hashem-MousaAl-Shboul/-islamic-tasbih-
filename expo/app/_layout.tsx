import '@/utils/polyfills';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native'; // <-- Added Platform import

import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTheme } from '@/theme/ThemeProvider';
import { AppProviders } from '@/components/AppProviders';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// --- 1. SAFELY IMPORT GOOGLE MOBILE ADS ---
let mobileAds: any = null;
if (Platform.OS !== 'web') {
  try {
    mobileAds = require('react-native-google-mobile-ads').default;
  } catch (e) {
    console.log('[RootLayout] react-native-google-mobile-ads not available');
  }
}
// ------------------------------------------

void SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { t } = useLanguageStore();
  const tokens = useTheme();

  const statusStyle = tokens.mode === 'dark' ? 'light' : 'dark';
  const headerBg = tokens.background;
  const headerTint = tokens.mode === 'dark' ? '#FFFFFF' : '#1B4332';

  console.log('[RootLayoutNav] Rendering with mode:', tokens.mode);

  return (
    <>
      <StatusBar style={statusStyle} />
      <Stack
        screenOptions={{
          headerBackTitle: t('back') || 'Back',
          headerStyle: {
            backgroundColor: headerBg,
          },
          headerTintColor: headerTint,
          animation: 'none',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="privacy-policy" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="terms-of-use" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const hideSplash = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
      console.log('[RootLayout] Splash screen hidden');
    } catch (e) {
      console.log('[RootLayout] hide splash error:', e);
    }
  }, []);

  // --- 2. INITIALIZE ADS ONCE AT LAUNCH ---
  useEffect(() => {
    if (mobileAds && Platform.OS !== 'web') {
      mobileAds()
        .initialize()
        .then((adapterStatuses: any) => {
          console.log('[RootLayout] Google Mobile Ads SDK Initialized!', adapterStatuses);
        })
        .catch((err: any) => {
          console.log('[RootLayout] AdMob initialization failed:', err);
        });
    }
  }, []);
  // -----------------------------------------

  useEffect(() => {
    console.log('[RootLayout] Mounting root layout');
    void hideSplash();

    const timer = setTimeout(() => {
      console.log('[RootLayout] Force hiding splash screen (fallback)');
      void SplashScreen.hideAsync().catch(() => {});
    }, 500);

    return () => clearTimeout(timer);
  }, [hideSplash]);

  return (
    <AppProviders>
      <ErrorBoundary>
        <RootLayoutNav />
      </ErrorBoundary>
    </AppProviders>
  );
}
