import '@/utils/polyfills';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import { ErrorBoundary } from '@/components/ErrorBoundary';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync().catch((error) => {
      console.warn('[RootLayout] Could not hide splash screen:', error);
    });
  }, []);

  return (
    <ErrorBoundary>
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: '#0A1A14',
          },
          headerTintColor: '#FFFFFF',
          animation: 'none',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="statistics" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="quran-reader" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="privacy-policy" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="terms-of-use" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="+not-found" options={{ title: 'غير موجود' }} />
      </Stack>
    </ErrorBoundary>
  );
}