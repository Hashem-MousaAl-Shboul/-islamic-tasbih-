import React, { memo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { androidTextFix } from '@/utils/androidOptimizations';

const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';

interface UnifiedHeaderProps {
  title: string;
  testID?: string;
  accessibilityLabel?: string;
}

/**
 * UnifiedHeader - موحد رأس التطبيق لجميع الشاشات
 * - لون أخضر داكن موحد (#1B4332)
 * - ارتفاع موحد (56px من الأسفل)
 * - حواف سفلية موحدة (24px)
 * - توج محمي بـ SafeAreaView
 * - محاذاة موحدة للعنوان
 */
const UnifiedHeader = memo(function UnifiedHeader({
  title,
  testID = 'unified-header',
  accessibilityLabel,
}: UnifiedHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top,
          marginBottom: 1,
        },
      ]}
      testID={testID}
      accessible
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="header"
    >
      <View style={styles.headerContent}>
        <Text
          style={[styles.headerTitle, androidTextFix]}
          numberOfLines={1}
          allowFontScaling={false}
        >
          {title}
        </Text>
        <View style={styles.ornament}>
          <View style={styles.ornamentLine} />
          <View style={styles.ornamentDiamond} />
          <View style={styles.ornamentLine} />
        </View>
      </View>
    </View>
  );
});

UnifiedHeader.displayName = 'UnifiedHeader';

const styles = StyleSheet.create({
  header: {
    backgroundColor: DEEP_GREEN,
    paddingBottom: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
    // Ensure no gap with status bar
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

export default UnifiedHeader;
