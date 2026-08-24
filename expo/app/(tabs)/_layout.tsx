import { Tabs } from "expo-router";
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { BookOpen, CircleDot, SlidersHorizontal, BookOpenCheck, Compass } from "lucide-react-native";
import { useLanguageStore } from "@/hooks/useLanguageStore";
import { StyleSheet, Platform, View } from "react-native";
import { Colors } from "@/constants/colors";
import { AudioProgressBar } from "@/components/AudioProgressBar";
import { yasAI } from "@/utils/yasAI";
import OptimizedTabBar from "@/components/OptimizedTabBar";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"; // استيراد النوع الصحيح هنا

const TAB_TAG = '[واجهة التبويبات]';

export default function TabLayout() {
  const { t } = useLanguageStore();
  const [isBarVisible, setIsBarVisible] = useState<boolean>(false); // جعلها false افتراضياً حتى نتأكد من حالة مستمع الصوت
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // إعدادات الشاشة محسنة مع كتابة الأنواع البرمجية الصحيحة
  const screenOptions = useMemo(() => ({
    headerShown: false,
    tabBarActiveTintColor: Colors.primary,
    tabBarInactiveTintColor: Colors.dark.textSecondary,
    tabBarShowLabel: true,
    tabBarHideOnKeyboard: Platform.OS === 'ios',
    lazy: true,
    tabBarAllowFontScaling: false,
    tabBar: (props: BottomTabBarProps) => <OptimizedTabBar {...props} />, // تم إصلاح نوع any هنا
  }), []);

  useEffect(() => {
    let mounted = true;
    console.log(TAB_TAG, 'جاري تحميل واجهة التبويبات وإعداد مستمع الصوت');

    const handlePlaybackChange = (state: { isPlaying: boolean; currentId: string | null }) => {
      if (mounted) {
        // تم التعديل: يبقى الشريط ظاهراً طالما هناك ملف صوتي مفعّل حتى لو تم عمل إيقاف مؤقت (Pause)
        setIsBarVisible(state.currentId !== null);
      }
    };

    const timer = setTimeout(() => {
      if (!mounted) return;
      try {
        unsubscribeRef.current = yasAI.addListener(handlePlaybackChange);
        const initialState = yasAI.getPlaybackState();
        if (mounted) {
          setIsBarVisible(initialState.currentId !== null);
          console.log(TAB_TAG, 'مستمع الصوت جاهز، معرف الصوت الحالي:', initialState.currentId);
        }
      } catch (e) {
        console.log(TAB_TAG, 'خطأ أثناء إعداد مستمع الصوت:', e);
      }
    }, 1000);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      console.log(TAB_TAG, 'تم إغلاق الواجهة وتنظيف المستمعات لعدم تسريب الذاكرة');
    };
  }, []);

  const handleCloseBar = useCallback(async () => {
    try {
      await yasAI.stop();
      console.log(TAB_TAG, 'تم إغلاق شريط الصوت وإيقاف التشغيل');
    } catch (e) {
      console.log(TAB_TAG, 'خطأ أثناء إيقاف الصوت:', e);
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
          name="quran"
          options={{
            title: t("quranKareem") || "القرآن الكريم",
            tabBarIcon: ({ color, size }) => (
              <BookOpenCheck size={size} color={color} strokeWidth={1.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="qibla"
          options={{
            title: t("qibla") || "القبلة",
            tabBarIcon: ({ color, size }) => (
              <Compass size={size} color={color} strokeWidth={1.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="tasbih"
          options={{
            title: t("tasbih") || "التسبيح",
            tabBarIcon: ({ color, size }) => (
              <CircleDot size={size} color={color} strokeWidth={2.2} fill={color} />
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
