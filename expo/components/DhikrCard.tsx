import React, { useMemo, useRef, useEffect, memo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { Dhikr } from '@/types';

function computeMetrics(screenWidth: number) {
  const marginH = 8;
  const paddingH = 20;
  const isTablet = screenWidth >= 768;
  const visible = isTablet ? 5 : screenWidth >= 414 ? 3 : 2.4;

  const cardWidth = Math.max(
    120,
    Math.floor((screenWidth - paddingH * 2 - marginH * 2 * visible) / visible)
  );

  return {
    cardWidth,
    cardHeight: Math.round(cardWidth * 0.66),
    marginH,
    snapInterval: cardWidth + marginH * 2,
    verticalCardWidth: Math.min(180, screenWidth * 0.35),
    verticalCardHeight: 80,
  } as const;
}

export const getDhikrCardMetrics = () => computeMetrics(400);

function withAlpha(color: string, alpha: number) {
  const hex = color.replace('#', '');

  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // لا يمكن إضافة alpha بشكل آمن إلى لون نصّي مثل "red".
  return color;
}

interface DhikrCardProps {
  dhikr: Dhikr;
  isActive: boolean;
  onPress: () => void;
  variant?: 'horizontal' | 'vertical';
}

const DhikrCardComponent: React.FC<DhikrCardProps> = ({
  dhikr,
  isActive,
  onPress,
  variant = 'horizontal',
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const metrics = useMemo(() => computeMetrics(screenWidth), [screenWidth]);

  const { arabicText, count, targetCount, color } = dhikr;
  const progressValue = useRef(new Animated.Value(0)).current;

  // حماية من القسمة على صفر أو القيم غير الصحيحة.
  const progress = useMemo(() => {
    if (targetCount <= 0) return 0;
    return Math.min(Math.max(count / targetCount, 0), 1);
  }, [count, targetCount]);

  const isCompleted = progress >= 1;

  useEffect(() => {
    const animation = Animated.timing(progressValue, {
      toValue: progress,
      duration: isCompleted ? 300 : 150,
      easing: isCompleted
        ? Easing.out(Easing.back(1.2))
        : Easing.out(Easing.quad),
      useNativeDriver: false,
    });

    animation.start();

    return () => animation.stop();
  }, [progress, progressValue, isCompleted]);

  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const cardBackgroundColor = useMemo(
    () => (isActive ? color : withAlpha(color, 0.15)),
    [isActive, color]
  );

  const cardWidth =
    variant === 'vertical' ? metrics.verticalCardWidth : metrics.cardWidth;

  const cardHeight =
    variant === 'vertical' ? metrics.verticalCardHeight : metrics.cardHeight;

  const marginStyle =
    variant === 'vertical'
      ? { marginVertical: 4 }
      : { marginHorizontal: metrics.marginH };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        variant === 'vertical' ? styles.verticalContainer : styles.container,
        {
          backgroundColor: cardBackgroundColor,
          borderWidth: isActive ? 2 : 1,
          borderColor: withAlpha(color, isActive ? 0.44 : 0.19),
          width: cardWidth,
          height: cardHeight,
          ...marginStyle,
        },
      ]}
      testID={`dhikr-card-${dhikr.id}`}
    >
      <View
        style={
          variant === 'vertical' ? styles.verticalCardHeader : styles.cardHeader
        }
      >
        <Text
          style={
            variant === 'vertical'
              ? styles.verticalArabicText
              : styles.arabicText
          }
          numberOfLines={variant === 'vertical' ? 1 : 2}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          allowFontScaling={false}
        >
          {arabicText}
        </Text>

        {isCompleted && (
          <View style={styles.completionIcon}>
            <CheckCircle
              size={variant === 'vertical' ? 14 : 18}
              color="#4CAF50"
            />
          </View>
        )}
      </View>

      <Text
        style={variant === 'vertical' ? styles.verticalCountText : styles.countText}
        allowFontScaling={false}
        numberOfLines={1}
      >
        {count.toLocaleString('ar-SA')}/{targetCount.toLocaleString('ar-SA')}
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground} />
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
              backgroundColor: isActive ? 'rgba(255,255,255,0.7)' : color,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

DhikrCardComponent.displayName = 'DhikrCard';

export const DhikrCard = memo(DhikrCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.dhikr.id === nextProps.dhikr.id &&
    prevProps.dhikr.arabicText === nextProps.dhikr.arabicText &&
    prevProps.dhikr.count === nextProps.dhikr.count &&
    prevProps.dhikr.targetCount === nextProps.dhikr.targetCount &&
    prevProps.dhikr.color === nextProps.dhikr.color &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.variant === nextProps.variant &&
    prevProps.onPress === nextProps.onPress
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    padding: 10,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
      web: { boxShadow: '0px 3px 8px rgba(0,0,0,0.2)' },
    }),
  },
  verticalContainer: {
    borderRadius: 10,
    padding: 6,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0px 1px 4px rgba(0,0,0,0.1)' },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  verticalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  arabicText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'right',
    flex: 1,
    lineHeight: 28,
    writingDirection: 'rtl',
  },
  verticalArabicText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'right',
    flex: 1,
    lineHeight: 24,
    writingDirection: 'rtl',
  },
  completionIcon: { marginLeft: 8 },
  countText: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '700',
  },
  verticalCountText: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
    height: 5,
    position: 'relative',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBar: {
    height: '100%',
    position: 'absolute',
    borderRadius: 3,
  },
});
