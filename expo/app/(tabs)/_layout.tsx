import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  BookOpen,
  BookOpenCheck,
  CircleDot,
  Compass,
  SlidersHorizontal,
} from 'lucide-react-native';

import OptimizedTabBar from '@/components/OptimizedTabBar';
import { Colors } from '@/constants/colors';
import { useLanguageStore } from '@/hooks/useLanguageStore';

export default function TabLayout(): React.ReactElement {
  const { t } = useLanguageStore();
  const screenOptions = useMemo(() => ({
    headerShown: false,
    tabBarActiveTintColor: Colors.secondary,
    tabBarInactiveTintColor: Colors.dark.textSecondary,
    tabBarShowLabel: true,
    tabBarHideOnKeyboard: Platform.OS === 'android',
    lazy: true,
    tabBarAllowFontScaling: true,
    tabBar: (props: BottomTabBarProps): React.ReactElement => <OptimizedTabBar {...props} />,
  }), []);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings') || 'الإعدادات',
          tabBarIcon: ({ color, size }) => <SlidersHorizontal size={size} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="adhkar"
        options={{
          title: t('adhkar') || 'الأذكار',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: t('quranKareem') || 'القرآن',
          tabBarIcon: ({ color, size }) => <BookOpenCheck size={size} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: t('qibla') || 'القبلة',
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="tasbih"
        options={{
          title: t('tasbih') || 'التسبيح',
          tabBarIcon: ({ color, size }) => <CircleDot size={size} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
