import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import * as Haptics from 'expo-haptics';

const DEEP_GREEN = '#1B4332';
const GOLD = '#D4A853';
const BAR_RADIUS = 28;
const ICON_SIZE = 24;

interface TabItemProps {
  route: any;
  descriptor: any;
  navigation: any;
  isFocused: boolean;
  index: number;
  totalTabs: number;
}

const TabItem = memo<TabItemProps>(function TabItem({ route, descriptor, navigation, isFocused }) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const focusAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(focusAnim, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [isFocused, focusAnim]);

  const onPressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.82,
      useNativeDriver: true,
      tension: 300,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const onPressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  }, [scaleAnim]);

  const onPress = useCallback(() => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      navigation.navigate(route.name);
    }
  }, [isFocused, navigation, route.name, route.key]);

  const isDark = theme.mode === 'dark';
  const activeColor = isFocused ? DEEP_GREEN : (isDark ? 'rgba(255,255,255,0.32)' : 'rgba(27,67,50,0.3)');

  const icon = descriptor.options.tabBarIcon
    ? descriptor.options.tabBarIcon({ color: activeColor, size: ICON_SIZE })
    : null;

  const iconScale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const iconTranslateY = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  const dotScale = focusAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 0.5, 1],
  });

  const dotOpacity = focusAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.tabItem}
      testID={`tab-${route.name}`}
    >
      <Animated.View
        style={[
          styles.tabContent,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Animated.View
          style={{
            transform: [
              { scale: iconScale },
              { translateY: iconTranslateY },
            ],
          }}
        >
          {icon}
        </Animated.View>

        <Animated.View
          style={[
            styles.activeDot,
            {
              backgroundColor: GOLD,
              transform: [{ scale: dotScale }],
              opacity: dotOpacity,
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
});

interface OptimizedTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const OptimizedTabBar = memo<OptimizedTabBarProps>(function OptimizedTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const isDark = theme.mode === 'dark';

  const bottomPad = Math.max(insets.bottom, 12);

  const barStyle = useMemo(() => {
    const bgColor = isDark ? 'rgba(20,25,35,0.96)' : 'rgba(253,251,247,0.97)';

    return {
      backgroundColor: bgColor,
      marginBottom: bottomPad,
    };
  }, [isDark, bottomPad]);

  const tabs = useMemo(() => {
    return state.routes.map((route: any, index: number) => ({
      route,
      isFocused: state.index === index,
      key: route.key,
      index,
    }));
  }, [state.routes, state.index]);

  return (
    <View style={[styles.wrapper, { paddingBottom: 0 }]} testID="optimized-tab-bar">
      <View style={[styles.tabBar, barStyle]} testID="tab-bar-shell">
        <View style={styles.tabContainer}>
          {tabs.map(({ route, isFocused, key, index: idx }: any) => (
            <TabItem
              key={key}
              route={route}
              descriptor={descriptors[route.key]}
              navigation={navigation}
              isFocused={isFocused}
              index={idx}
              totalTabs={state.routes.length}
            />
          ))}
        </View>
      </View>
    </View>
  );
});

export default OptimizedTabBar;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center' as const,
    paddingTop: 6,
    paddingBottom: 2,
  },
  tabBar: {
    borderRadius: BAR_RADIUS,
    paddingVertical: 14,
    width: '86%' as any,
    maxWidth: 360,
    ...Platform.select({
      ios: {
        shadowColor: '#1B4332',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
      },
      web: {
        boxShadow: '0 8px 32px rgba(27,67,50,0.10), 0 2px 8px rgba(0,0,0,0.06)',
      } as any,
    }),
  },
  tabContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-evenly' as const,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 4,
  },
  tabContent: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
