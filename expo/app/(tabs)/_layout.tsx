import { Tabs } from "expo-router";
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { BookOpen, Fingerprint, TrendingUp, SlidersHorizontal } from "lucide-react-native";
import { useLanguageStore } from "@/hooks/useLanguageStore";
import { StyleSheet, Platform, View } from "react-native";
import { Colors } from "@/constants/colors";
import { AudioProgressBar } from "@/components/AudioProgressBar";
import { yasAI } from "@/utils/yasAI";
import OptimizedTabBar from "@/components/OptimizedTabBar";

const TAB_TAG = '[TabLayout]';

export default function TabLayout() {
  const { t } = useLanguageStore();
  const [isBarVisible, setIsBarVisible] = useState<boolean>(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const screenOptions = useMemo(() => ({
    headerShown: false,
    tabBarActiveTintColor: Colors.primary,
    tabBarInactiveTintColor: Colors.dark.textSecondary,
    tabBarShowLabel: true,
    tabBarHideOnKeyboard: Platform.OS === 'ios',
    lazy: true,
    tabBarAllowFontScaling: false,
    tabBar: (props: any) => <OptimizedTabBar {...props} />,
  }), []);

  useEffect(() => {
    let mounted = true;
    console.log(TAB_TAG, 'Mounting tab layout, initializing audio listener');

    const handlePlaybackChange = (state: { isPlaying: boolean; currentId: string | null }) => {
      if (mounted) {
        setIsBarVisible(state.isPlaying);
      }
    };

    const timer = setTimeout(() => {
      if (!mounted) return;
      try {
        unsubscribeRef.current = yasAI.addListener(handlePlaybackChange);
        const initialState = yasAI.getPlaybackState();
        if (mounted) {
          setIsBarVisible(initialState.isPlaying);
          console.log(TAB_TAG, 'Audio listener ready, playing:', initialState.isPlaying);
        }
      } catch (e) {
        console.log(TAB_TAG, 'Error setting up audio listener:', e);
      }
    }, 1000);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      console.log(TAB_TAG, 'Tab layout unmounted, cleaned up listeners');
    };
  }, []);

  const handleCloseBar = useCallback(async () => {
    try {
      await yasAI.stop();
      console.log(TAB_TAG, 'Audio bar closed');
    } catch (e) {
      console.log(TAB_TAG, 'stop error', e);
    } finally {
      setIsBarVisible(false);
    }
  }, []);

  return (
    <View style={styles.root} testID="tabs-root">
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen
          name="settings"
          options={{
            title: t("settings") || "الإعدادات",
            tabBarIcon: ({ color, size }) => (
              <SlidersHorizontal size={size} color={color} strokeWidth={1.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="adhkar"
          options={{
            title: t("adhkar") || "الأذكار",
            tabBarIcon: ({ color, size }) => (
              <BookOpen size={size} color={color} strokeWidth={1.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            title: t("statistics") || "الإحصائيات",
            tabBarIcon: ({ color, size }) => (
              <TrendingUp size={size} color={color} strokeWidth={1.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="tasbih"
          options={{
            title: t("tasbih") || "التسبيح",
            tabBarIcon: ({ color, size }) => (
              <Fingerprint size={size} color={color} strokeWidth={1.8} />
            ),
          }}
        />
      </Tabs>
      <AudioProgressBar isVisible={isBarVisible} onClose={handleCloseBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F4EE',
  },
});
