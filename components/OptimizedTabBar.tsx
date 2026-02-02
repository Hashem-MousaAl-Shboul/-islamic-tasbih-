import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/theme/ThemeProvider';

interface TabItemProps {
  route: any;
  descriptor: any;
  navigation: any;
  isFocused: boolean;
  isCenter: boolean;
}

const TabItem = memo<TabItemProps>(function TabItem({ route, descriptor, navigation, isFocused, isCenter }) {
  const label = descriptor.options.tabBarLabel || descriptor.options.title || route.name;
  const theme = useTheme();

  const inactiveColor = theme.textSecondary;
  const activeColor = theme.primary;
  const labelColor = isFocused ? activeColor : inactiveColor;

  const onPress = useCallback(() => {
    console.log('[OptimizedTabBar] tab press', { routeName: route.name, isFocused, isCenter });
    if (!isFocused) {
      navigation.navigate(route.name);
    }
  }, [isFocused, navigation, route.name, isCenter]);

  const renderIcon = () => {
    if (descriptor.options.tabBarIcon) {
      const iconColor = isCenter ? '#FFFFFF' : (isFocused ? activeColor : inactiveColor);
      return descriptor.options.tabBarIcon({ color: iconColor, size: 24 });
    }
    return null;
  };

  const icon = renderIcon();

  if (isCenter) {
    return (
      <Pressable
        onPress={onPress}
        style={styles.centerItem}
        testID={`tab-${route.name}`}
      >
        <View style={[styles.centerButton, { backgroundColor: theme.primary }]} testID={`tab-${route.name}-centerButton`}>
          {icon !== null ? icon : null}
        </View>
        <Text
          style={[styles.tabLabel, { color: labelColor, marginTop: 8 }]}
          numberOfLines={1}
          allowFontScaling={false}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={styles.tabItem}
      testID={`tab-${route.name}`}
    >
      <View style={styles.tabContent}>
        {icon !== null && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.tabLabel, { color: labelColor }]} numberOfLines={1} allowFontScaling={false}>
          {label}
        </Text>
      </View>
      {isFocused && <View style={[styles.indicator, { backgroundColor: theme.text }]} />}
    </Pressable>
  );
}, (prev, next) =>
  prev.isFocused === next.isFocused &&
  prev.route.key === next.route.key
);

interface OptimizedTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const OptimizedTabBar = memo<OptimizedTabBarProps>(function OptimizedTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const tabBarDynamicStyle = useMemo(() => {
    const bottom = Math.max(insets.bottom, 8);
    return {
      paddingBottom: bottom,
      height: 70 + bottom,
      backgroundColor: theme.tabBar,
    };
  }, [insets.bottom, theme.tabBar]);

  const tabs = useMemo(() => {
    const middleIndex = Math.floor(state.routes.length / 2);
    return state.routes.map((route: any, index: number) => ({
      route,
      descriptor: descriptors[route.key],
      isFocused: state.index === index,
      key: route.key,
      isCenter: index === middleIndex,
    }));
  }, [state.routes, state.index, descriptors]);

  return (
    <View style={styles.wrapper} testID="optimized-tab-bar">
      <View style={[styles.tabBar, tabBarDynamicStyle]} testID="tab-bar-shell">
        <View style={styles.tabContainer}>
          {tabs.map(({ route, descriptor, isFocused, key, isCenter }: any) => (
            <TabItem
              key={key}
              route={route}
              descriptor={descriptor}
              navigation={navigation}
              isFocused={isFocused}
              isCenter={isCenter}
            />
          ))}
        </View>
      </View>
    </View>
  );
}, (prev, next) => 
  prev.state.index === next.state.index &&
  prev.state.routes.length === next.state.routes.length
);

export default OptimizedTabBar;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 0,
    paddingTop: 8,
    paddingHorizontal: 0,
  },
  tabContainer: {
    flexDirection: 'row' as const,
    flex: 1,
    justifyContent: 'space-around' as const,
    alignItems: 'flex-end' as const,
  },
  tabItem: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 4,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    minHeight: 60,
    position: 'relative' as const,
  },
  tabContent: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  centerItem: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 4,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    minHeight: 60,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: -28,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: `0 4px 12px ${Colors.primary}66`,
      } as any,
    }),
  },
  iconContainer: {
    marginBottom: 4,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: 'center' as const,
      },
    }),
  },
  indicator: {
    position: 'absolute' as const,
    bottom: 0,
    width: 40,
    height: 3,
    borderRadius: 2,
  },
});
