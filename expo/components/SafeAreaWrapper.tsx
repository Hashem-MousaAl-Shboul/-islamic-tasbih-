import React, { memo, ReactNode } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';

interface SafeAreaWrapperProps {
  children: ReactNode;
  title?: string;
  showOrnament?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

/**
 * SafeAreaWrapper - مغلف آمن للمناطق الآمنة
 * يوفر حماية تلقائية من notches والمناطق غير الآمنة
 * على جميع الأجهزة المختلفة
 */
const SafeAreaWrapper = memo(function SafeAreaWrapper({
  children,
  title,
  showOrnament = true,
  testID = 'safe-area-wrapper',
  accessibilityLabel,
}: SafeAreaWrapperProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
      testID={testID}
      accessible
      accessibilityLabel={accessibilityLabel}
    >
      {title && (
        <View
          style={styles.headerContainer}
          accessible
          accessibilityRole="header"
          accessibilityLabel={title}
        >
          <View style={styles.headerContent}>
            <Text
              style={styles.headerTitle}
              numberOfLines={1}
              allowFontScaling={false}
            >
              {title}
            </Text>
            {showOrnament && (
              <View style={styles.ornament}>
                <View style={styles.ornamentLine} />
                <View style={styles.ornamentDiamond} />
                <View style={styles.ornamentLine} />
              </View>
            )}
          </View>
        </View>
      )}
      {children}
    </View>
  );
});

SafeAreaWrapper.displayName = 'SafeAreaWrapper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EE',
  },
  headerContainer: {
    backgroundColor: DEEP_GREEN,
    paddingHorizontal: 20,
    paddingBottom: 18,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 0,
  },
  headerContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    writingDirection: 'rtl',
    letterSpacing: 1,
    textAlign: 'center',
  },
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  ornamentLine: {
    width: 32,
    height: 1,
    backgroundColor: GOLD,
    opacity: 0.6,
  },
  ornamentDiamond: {
    width: 6,
    height: 6,
    backgroundColor: GOLD,
    transform: [{ rotate: '45deg' }],
  },
});

export default SafeAreaWrapper;
