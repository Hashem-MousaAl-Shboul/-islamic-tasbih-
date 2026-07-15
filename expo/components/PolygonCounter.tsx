import React, { memo, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, ViewStyle } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const GOLD = '#D4A853' as const;
const DEEP_GOLD = '#B8923E' as const;
const CREAM = '#FAF4E8' as const;
const IVORY = '#FFFDF8' as const;
const DEEP_GREEN = '#1B4332' as const;

interface PolygonCounterProps {
  count: number;
  size?: number;
  onPress?: () => void;
  disabled?: boolean;
  fillColor?: string;
  borderColor?: string;
  textColor?: string;
  testID?: string;
  accessibilityLabel?: string;
  style?: ViewStyle;
  haptic?: boolean;
}

function createScallopedPath(cx: number, cy: number, outerR: number, innerR: number, lobes: number): string {
  const points = lobes * 16;
  let d = '';
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
    const r = (outerR + innerR) / 2 + ((outerR - innerR) / 2) * Math.cos(lobes * angle);
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) {
      d += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    } else {
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
  }
  d += ' Z';
  return d;
}

const PolygonCounterComponent: React.FC<PolygonCounterProps> = ({
  count,
  size = 180,
  onPress,
  disabled = false,
  fillColor = CREAM,
  borderColor = GOLD,
  textColor = DEEP_GREEN,
  testID,
  accessibilityLabel,
  style,
  haptic = true,
}) => {
  const path = useMemo(() => {
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 4;
    const innerR = outerR * 0.82;
    return createScallopedPath(cx, cy, outerR, innerR, 12);
  }, [size]);

  const displayCount = useMemo(() => count.toLocaleString('ar-SA'), [count]);
  const gradientId = useMemo(() => `polygonFill-${Math.random().toString(36).substr(2, 9)}`, []);
  const borderGradientId = useMemo(() => `polygonBorder-${Math.random().toString(36).substr(2, 9)}`, []);

  const handlePress = () => {
    if (haptic && Platform.OS !== 'web') {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('[PolygonCounter] Haptic error:', error);
      }
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      android_ripple={{ color: 'rgba(212,168,83,0.15)', borderless: true, radius: size / 2 }}
      style={({ pressed }) => [
        styles.container,
        { width: size, height: size },
        style,
        pressed && styles.pressed,
      ]}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgLinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={IVORY} />
            <Stop offset="1" stopColor={fillColor} />
          </SvgLinearGradient>
          <SvgLinearGradient id={borderGradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={GOLD} />
            <Stop offset="0.5" stopColor={DEEP_GOLD} />
            <Stop offset="1" stopColor={GOLD} />
          </SvgLinearGradient>
        </Defs>
        <Path
          d={path}
          fill={`url(#${gradientId})`}
          stroke={`url(#${borderGradientId})`}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      </Svg>
      <View style={styles.textContainer} pointerEvents="none">
        <Text style={[styles.countText, { color: textColor, fontSize: size * 0.28 }]}>
          {displayCount}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 6px 24px rgba(0,0,0,0.12)',
      },
    }),
  },
  pressed: {
    opacity: 0.92,
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontWeight: '800' as const,
    textAlign: 'center' as const,
    includeFontPadding: false,
    textAlignVertical: 'center' as const,
  },
});

export const PolygonCounter = memo(PolygonCounterComponent);
PolygonCounter.displayName = 'PolygonCounter';
