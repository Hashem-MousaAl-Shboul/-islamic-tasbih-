import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import * as Haptics from 'expo-haptics';

const DEEP_GREEN = '#1B4332';
const GOLD = '#D4A853';

interface TabItemProps {
  route: any;
  descriptor: any;
  navigation: any;
  isFocused: boolean;
  index: number;
  totalTabs: number;
}

const TabItem = memo<TabItemProps>(function TabItem({ route, descriptor, navigation, isFocused, index, totalTabs }) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const focusAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  const label = descriptor.options.tabBarLabel || descriptor.options.title || route.name;

  useEffect(() => {
    Animated.spring(focusAnim, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: false,
      tension: 65,
      friction: 11,
    }).start();
  }, [isFocused, focusAnim]);

  const onPressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
      tension: 250,
      friction: 8,
    }).start();
  }, [scaleAnim]);

  const onPressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 180,
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
  const activeColor = DEEP_GREEN;
  const inactiveColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.28)';

  const staticIconColor = isFocused ? activeColor : inactiveColor;

  const icon = descriptor.options.tabBarIcon
    ? descriptor.options.tabBarIcon({ color: staticIconColor, size: 22 })
    : null;

  const pillBg = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', GOLD + '20'],
  });

  const pillWidth = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [44, 64],
  });

  const pillHeight = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [44, 34],
  });

  const labelOpacity = focusAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 0.75, 1],
  });

  const labelTranslateY = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -1],
  });

  const iconScale = focusAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.12, 1.08],
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
          style={[
            styles.iconPill,
            {
              backgroundColor: pillBg,
              width: pillWidth,
              height: pillHeight,
            },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            {icon}
          </Animated.View>
        </Animated.View>

        <Animated.Text
          style={[
            styles.tabLabel,
            {
              color: isFocused ? activeColor : inactiveColor,
              opacity: labelOpacity,
              fontWeight: isFocused ? '600' as const : '400' as const,
              transform: [{ translateY: labelTranslateY }],
            },
          ]}
          numberOfLines={1}
          allowFontScaling={false}
        >
          {label}
        </Animated.Text>
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

  const bottomPad = Math.max(insets.bottom, 8);

  const barStyle = useMemo(() => {
    const bgColor = isDark ? 'rgba(15,20,30,0.97)' : 'rgba(255,255,255,0.98)';
    const borderColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';

    return {
      backgroundColor: bgColor,
      paddingBottom: bottomPad,
      borderTopColor: borderColor,
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
    <View style={styles.wrapper} testID="optimized-tab-bar">
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
    backgroundColor: 'transparent',
  },
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 -3px 12px rgba(0,0,0,0.06)',
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
    paddingVertical: 2,
  },
  tabContent: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 3,
  },
  iconPill: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 16,
  },
  tabLabel: {
    fontSize: 11,
    textAlign: 'center' as const,
    letterSpacing: 0.1,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: 'center' as const,
      },
    }),
  },
});
