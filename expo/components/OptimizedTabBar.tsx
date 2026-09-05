import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ParamListBase, Route } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { Colors, Layout } from '@/constants/colors';
import { useTheme } from '@/theme/ThemeProvider';
import { androidRipple, androidTextFix } from '@/utils/androidOptimizations';

const ICON_SIZE = 21;

type TabRoute = Route<string> & { key: string; name: string };
type TabDescriptor = BottomTabBarProps['descriptors'][string];

interface TabItemProps {
  route: TabRoute;
  descriptor: TabDescriptor;
  navigation: BottomTabBarProps['navigation'];
  isFocused: boolean;
}

const TabItem = memo(function TabItem({ route, descriptor, navigation, isFocused }: TabItemProps): React.ReactElement {
  const scale = useRef<Animated.Value>(new Animated.Value(1)).current;
  const focus = useRef<Animated.Value>(new Animated.Value(isFocused ? 1 : 0)).current;
  const options = descriptor.options;
  const label = typeof options.tabBarLabel === 'string'
    ? options.tabBarLabel
    : typeof options.title === 'string'
      ? options.title
      : route.name;

  useEffect(() => {
    Animated.spring(focus, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: true,
      tension: 90,
      friction: 11,
    }).start();
  }, [focus, isFocused]);

  const onPress = useCallback((): void => {
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (isFocused || event.defaultPrevented) return;
    if (Platform.OS !== 'web') void Haptics.selectionAsync().catch(() => {});
    navigation.navigate(route.name as keyof ParamListBase);
  }, [isFocused, navigation, route.key, route.name]);

  const onLongPress = useCallback((): void => {
    navigation.emit({ type: 'tabLongPress', target: route.key });
  }, [navigation, route.key]);

  const iconColor = isFocused ? Colors.secondary : Colors.light.textSecondary;
  const icon = options.tabBarIcon?.({ focused: isFocused, color: iconColor, size: ICON_SIZE });
  const iconScale = focus.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.92, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
      android_ripple={androidRipple('rgba(212,168,83,0.14)', true, 28)}
      style={styles.tabItem}
      testID={`tab-${route.name}`}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
    >
      <Animated.View style={[styles.tabContent, { transform: [{ scale }] }]}>
        <Animated.View style={[styles.iconShell, isFocused && styles.iconShellActive, { transform: [{ scale: iconScale }] }]}>
          {icon}
        </Animated.View>
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
          style={[styles.label, isFocused && styles.labelActive, androidTextFix]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

const OptimizedTabBar = memo(function OptimizedTabBar({ state, descriptors, navigation }: BottomTabBarProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const barStyle = useMemo(() => ({
    backgroundColor: theme.mode === 'dark' ? 'rgba(23,28,41,0.98)' : 'rgba(255,253,249,0.98)',
    borderColor: theme.mode === 'dark' ? Colors.dark.border : Colors.light.border,
    marginBottom: Math.max(insets.bottom, 8),
  }), [insets.bottom, theme.mode]);

  return (
    <View style={styles.wrapper} testID="optimized-tab-bar">
      <View style={[styles.tabBar, barStyle]} testID="tab-bar-shell">
        {state.routes.map((route, index) => (
          <TabItem
            key={route.key}
            route={route}
            descriptor={descriptors[route.key]}
            navigation={navigation}
            isFocused={state.index === index}
          />
        ))}
      </View>
    </View>
  );
});

export default OptimizedTabBar;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingTop: 4,
  },
  tabBar: {
    width: '94%',
    maxWidth: 480,
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 5,
    paddingVertical: 5,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 22,
      },
      android: { elevation: 14 },
      web: { boxShadow: '0 8px 28px rgba(27,67,50,0.14)' },
    }),
  },
  tabItem: {
    flex: 1,
    minHeight: Layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    overflow: 'hidden',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconShell: {
    width: 30,
    height: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconShellActive: {
    backgroundColor: 'rgba(212,168,83,0.14)',
  },
  label: {
    maxWidth: 64,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  labelActive: {
    color: Colors.secondary,
    fontWeight: '800',
  },
});