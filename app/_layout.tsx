import '@/utils/polyfills';
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Platform, UIManager } from "react-native";
import { useLanguageStore } from "@/hooks/useLanguageStore";
import { useTheme } from "@/theme/ThemeProvider";
import { AppProviders } from "@/components/AppProviders";
import { ErrorBoundary } from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

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
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = React.useState<boolean>(false);

  useEffect(() => {
    let hidden = false;
    
    const safeHide = async () => {
      if (!hidden) {
        hidden = true;
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.log('[RootLayout] hide splash error', e);
        }
      }
    };

    const initApp = () => {
      setIsReady(true);
      requestAnimationFrame(() => {
        safeHide();
      });
    };
    
    const timeout = setTimeout(() => {
      initApp();
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <AppProviders>
      <ErrorBoundary>
        <RootLayoutNav />
      </ErrorBoundary>
    </AppProviders>
  );
}
