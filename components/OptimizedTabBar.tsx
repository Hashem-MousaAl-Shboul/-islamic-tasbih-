import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import * as Haptics from 'expo-haptics';


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
  const activeColor = theme.primary;
  const inactiveColor = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.32)';

  const staticIconColor = isFocused ? activeColor : inactiveColor;

  const icon = descriptor.options.tabBarIcon
    ? descriptor.options.tabBarIcon({ color: staticIconColor, size: 24 })
    : null;

  const pillBg = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', isDark ? `${activeColor}20` : `${activeColor}14`],
  });

  const pillWidth = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [48, 72],
  });

  const pillHeight = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [48, 36],
  });

  const labelOpacity = focusAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.55, 0.8, 1],
  });

  const labelTranslateY = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -1],
  });

  const iconScale = focusAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.15, 1.1],
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
          {
            transform: [{ scale: scaleAnim }],
          },
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
              fontWeight: isFocused ? '700' as const : '400' as const,
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
    const bgColor = isDark ? 'rgba(15,20,36,0.96)' : 'rgba(255,255,255,0.97)';
    const borderColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

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
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
      web: {
        boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
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
    borderRadius: 18,
  },
  tabLabel: {
    fontSize: 11,
    textAlign: 'center' as const,
    letterSpacing: 0.15,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: 'center' as const,
      },
    }),
  },
});
