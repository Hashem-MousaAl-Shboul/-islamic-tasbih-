import React, { memo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { androidTextFix } from '@/utils/androidOptimizations';

const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';
const HEADER_TOTAL_HEIGHT = 100; // الارتفاع الثابت الموحد

interface UnifiedHeaderProps {
  title: string;
  testID?: string;
  accessibilityLabel?: string;
}

/**
 * UnifiedHeader - رأس موحد لجميع الشاشات
 * ✅ محمي كاملاً من شريط الحالة (بطارية/وقت)
 * ✅ ارتفاع ثابت وموحد: 180dp في كل الصفحات
 * ✅ حواف سفلية دائرية موحدة
 * ✅ تصميم متوافق مع العربية (RTL)
 */
const UnifiedHeader = memo(function UnifiedHeader({
  title,
  testID = 'unified-header',
  accessibilityLabel,
}: UnifiedHeaderProps) {
  const insets = useSafeAreaInsets(); // يأخذ مساحة شريط الحالة تلقائياً

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top }, // ✅ يدفع المحتوى أسفل شريط الحالة مباشرة
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
  /**header: {
    backgroundColor: DEEP_GREEN,
    height: HEADER_TOTAL_HEIGHT, // ✅ ارتفاع ثابت وموحد 180dp
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'flex-end', // لضبط المحتوى للأسفل ضمن الارتفاع الكلي
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,*/
    // ظلال نظامية
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 18, // مسافة سفلية داخلية ثابتة
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
