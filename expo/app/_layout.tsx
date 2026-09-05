import "@/utils/polyfills";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import React, { useEffect, useCallback } from "react";

import { ActivityIndicator, View } from "react-native";

import { StatusBar } from "expo-status-bar";

import { useTheme } from "@/theme/ThemeProvider";
import { useLanguageStore } from "@/hooks/useLanguageStore";
import { AppProviders } from "@/components/AppProviders";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useImmersiveMode } from "@/hooks/useImmersiveMode";
import { useAuthStore } from "@/hooks/useAuthStore";

void SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const tokens = useTheme();
  const { isRTL } = useLanguageStore();
  const { isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: tokens.background,
          direction: isRTL ? "rtl" : "ltr",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={tokens.primary} />
      </View>
    );
  }

  const statusStyle = tokens.mode === "dark" ? "light" : "dark";
  const headerBg = tokens.background;
  // لون العميل المخصص
  const headerTint = tokens.mode === "dark" ? "#FFFFFF" : "#1B4332";

  return (
    <>
      <StatusBar style={statusStyle} />

      <View style={{ flex: 1, direction: isRTL ? "rtl" : "ltr" }}>
        <Stack
          screenOptions={{
            headerShown: false,
            headerStyle: {
              backgroundColor: headerBg,
            },
            headerTintColor: headerTint,
            animation: "none",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen
            name="welcome"
            options={{
              animation: "fade",
            }}
          />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="statistics"
            options={{
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="quran-reader"
            options={{
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="privacy-policy"
            options={{
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="terms-of-use"
            options={{
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="+not-found"
            options={{
              title: "غير موجود",
            }}
          />
        </Stack>
      </View>
    </>
  );
}

export default function RootLayout() {
  useImmersiveMode();

  const hideSplash = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch (e) {
      console.log("[RootLayout] hide splash error:", e);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void SplashScreen.hideAsync().catch(() => {});
    }, 500);

    return () => clearTimeout(timer);
  }, [hideSplash]);

  return (
    <ErrorBoundary>
      <AppProviders>
        <RootLayoutNav />
      </AppProviders>
    </ErrorBoundary>
  );
}