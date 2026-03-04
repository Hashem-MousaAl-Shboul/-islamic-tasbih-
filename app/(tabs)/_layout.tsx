import { Tabs } from "expo-router";
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Book, Circle, BarChart3 } from "lucide-react-native";
import { useLanguageStore } from "@/hooks/useLanguageStore";
import { StyleSheet, Platform, View } from "react-native";
import { Colors } from "@/constants/colors";
import { AudioProgressBar } from "@/components/AudioProgressBar";
import { yasAI } from "@/utils/yasAI";
import OptimizedTabBar from "@/components/OptimizedTabBar";


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
    const handlePlaybackChange = (state: { isPlaying: boolean; currentId: string | null }) => {
      if (mounted) {
        setIsBarVisible(state.isPlaying);
      }
    };

    unsubscribeRef.current = yasAI.addListener(handlePlaybackChange);
    
    const initialState = yasAI.getPlaybackState();
    if (mounted) {
      setIsBarVisible(initialState.isPlaying);
    }

    return () => {
      mounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  const handleCloseBar = useCallback(async () => {
    try {
      await yasAI.stop();
    } catch (e) {
      console.log('[TabsLayout] stop error', e);
    } finally {
      setIsBarVisible(false);
    }
  }, []);

  return (
    <View style={styles.root} testID="tabs-root">
      <Tabs screenOptions={screenOptions}>

          <Tabs.Screen
            name="tasbih"
            options={{
              title: t("tasbih") || "التسبيح",
              tabBarIcon: ({ color }) => <Circle size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="adhkar"
            options={{
              title: t("adhkar") || "الأذكار",
              tabBarIcon: ({ color }) => <Book size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="statistics"
            options={{
              title: t("statistics") || "الإحصائيات",
              tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} />,
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
  },
});