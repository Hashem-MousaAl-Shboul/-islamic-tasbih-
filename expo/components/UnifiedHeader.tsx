import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { androidTextFix } from '@/utils/androidOptimizations';
import { Colors } from '@/constants/colors';

const GOLD = Colors.secondary;
const DEEP_GREEN = Colors.primary;

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
          maxFontSizeMultiplier={1.25}
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
    minHeight: 56,
    paddingBottom: 11,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
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
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    writingDirection: 'rtl',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    gap: 8,
  },
  ornamentLine: {
    width: 28,
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
