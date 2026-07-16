import '@/utils/polyfills';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';

import { useTheme } from '@/theme/ThemeProvider';
import { AppProviders } from '@/components/AppProviders';
import { ErrorBoundary } from '@/components/ErrorBoundary';

void SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
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
          headerShown: false,
          headerStyle: {
            backgroundColor: headerBg,
          },
          headerTintColor: headerTint,
          animation: 'none',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="statistics" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="privacy-policy" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="terms-of-use" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="quran" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="+not-found" options={{ title: 'غير موجود' }} />
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
