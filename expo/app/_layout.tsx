import '@/utils/polyfills';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';

import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTheme } from '@/theme/ThemeProvider';
import { AppProviders } from '@/components/AppProviders';
import { ErrorBoundary } from '@/components/ErrorBoundary';

void SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { t } = useLanguageStore();
  const tokens = useTheme();

  const statusStyle = tokens.mode === 'dark' ? 'light' : 'dark';
  const headerBg = tokens.background;
  const headerTint = tokens.mode === 'dark' ? '#FFFFFF' : '#1B4332';

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

  useEffect(() => {
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
