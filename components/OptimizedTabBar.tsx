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
  const bgAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const iconTranslate = useRef(new Animated.Value(isFocused ? -2 : 0)).current;

  const label = descriptor.options.tabBarLabel || descriptor.options.title || route.name;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bgAnim, {
        toValue: isFocused ? 1 : 0,
        useNativeDriver: false,
        tension: 80,
        friction: 12,
      }),
      Animated.spring(iconTranslate, {
        toValue: isFocused ? -2 : 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }),
    ]).start();
  }, [isFocused, bgAnim, iconTranslate]);

  const onPressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
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
  const activeColor = theme.primary;
  const inactiveColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';
  const iconColor = isFocused ? activeColor : inactiveColor;

  const icon = descriptor.options.tabBarIcon
    ? descriptor.options.tabBarIcon({ color: iconColor, size: 22 })
    : null;

  const activeBg = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', isDark ? `${activeColor}18` : `${activeColor}12`],
  });

  const labelOpacity = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
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
          styles.tabPill,
          {
            backgroundColor: activeBg,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ translateY: iconTranslate }] }}>
          {icon}
        </Animated.View>
        <Animated.Text
          style={[
            styles.tabLabel,
            {
              color: isFocused ? activeColor : inactiveColor,
              opacity: labelOpacity,
              fontWeight: isFocused ? '700' as const : '500' as const,
            },
          ]}
          numberOfLines={1}
          allowFontScaling={false}
        >
          {label}
        </Animated.Text>
        {isFocused && (
          <View style={[styles.activeDot, { backgroundColor: activeColor }]} />
        )}
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

  const bottomPad = Math.max(insets.bottom, 6);

  const barStyle = useMemo(() => {
    const bgColor = isDark ? 'rgba(20,27,45,0.92)' : 'rgba(255,255,255,0.94)';
    const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

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
    paddingTop: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
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
    justifyContent: 'space-around' as const,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tabPill: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    minWidth: 64,
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    textAlign: 'center' as const,
    letterSpacing: 0.2,
    marginTop: 2,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: 'center' as const,
      },
    }),
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});
