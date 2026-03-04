import '@/utils/polyfills';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTheme } from '@/theme/ThemeProvider';
import { AppProviders } from '@/components/AppProviders';
import { ErrorBoundary } from '@/components/ErrorBoundary';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { t } = useLanguageStore();
  const tokens = useTheme();
  
  return (
    <>
      <StatusBar style={tokens.mode === 'dark' ? 'light' : 'dark'} />
      <Stack 
        screenOptions={{ 
          headerBackTitle: t('back') || "Back",
          headerStyle: {
            backgroundColor: tokens.background,
          },
          headerTintColor: tokens.mode === 'dark' ? '#FFFFFF' : '#000000',
          animation: 'none',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(e => {
      console.log('[RootLayout] hide splash error', e);
    });
  }, []);

  return (
    <AppProviders>
      <ErrorBoundary>
        <RootLayoutNav />
      </ErrorBoundary>
    </AppProviders>
  );
}
