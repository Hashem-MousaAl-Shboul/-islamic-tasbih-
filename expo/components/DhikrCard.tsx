import React, { memo, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { Dhikr } from '@/types';

type DhikrCardVariant = 'horizontal' | 'vertical';

interface DhikrCardProps {
  dhikr: Dhikr;
  isActive: boolean;
  onPress: () => void;
  variant?: DhikrCardVariant;
  locale?: string;
}

interface DhikrCardMetrics {
  cardWidth: number;
  cardHeight: number;
  marginH: number;
  snapInterval: number;
  verticalCardWidth: number;
  verticalCardHeight: number;
}

function computeMetrics(screenWidth: number): DhikrCardMetrics {
  const safeWidth = Number.isFinite(screenWidth) && screenWidth > 0
    ? screenWidth
    : 400;

  const marginH = 8;
  const paddingH = 20;
  const isTablet = safeWidth >= 768;
  const visible = isTablet ? 5 : safeWidth >= 414 ? 3 : 2.4;

  const availableWidth =
    safeWidth -
    paddingH * 2 -
    marginH * 2 * visible;

  const cardWidth = Math.max(
    120,
    Math.floor(availableWidth / visible)
  );

  return {
    cardWidth,
    cardHeight: Math.round(cardWidth * 0.66),
    marginH,
    snapInterval: cardWidth + marginH * 2,
    verticalCardWidth: Math.min(180, safeWidth * 0.35),
    verticalCardHeight: 80,
  };
}

export const getDhikrCardMetrics = (
  screenWidth = 400
): DhikrCardMetrics => computeMetrics(screenWidth);

function withAlpha(color: string, alpha: number): string {
  const normalizedColor = color.trim().replace('#', '');

  const safeAlpha = Math.min(Math.max(alpha, 0), 1);

  if (/^[0-9A-Fa-f]{6}$/.test(normalizedColor)) {
    const r = parseInt(normalizedColor.slice(0, 2), 16);
    const g = parseInt(normalizedColor.slice(2, 4), 16);
    const b = parseInt(normalizedColor.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
  }

  if (/^[0-9A-Fa-f]{3}$/.test(normalizedColor)) {
    const r = parseInt(normalizedColor[0] + normalizedColor[0], 16);
    const g = parseInt(normalizedColor[1] + normalizedColor[1], 16);
    const b = parseInt(normalizedColor[2] + normalizedColor[2], 16);

    return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
  }

  return color;
}

function clampProgress(
  count: number,
  targetCount: number
): number {
  if (
    !Number.isFinite(count) ||
    !Number.isFinite(targetCount) ||
    targetCount <= 0
  ) {
    return 0;
  }

  return Math.min(
    Math.max(count / targetCount, 0),
    1
  );
}

const DhikrCardComponent: React.FC<DhikrCardProps> = ({
  dhikr,
  isActive,
  onPress,
  variant = 'horizontal',
  locale = 'ar-SA',
}) => {
  const { width: screenWidth } = useWindowDimensions();

  const metrics = useMemo(
    () => computeMetrics(screenWidth),
    [screenWidth]
  );

  const {
    id,
    arabicText,
    count,
    targetCount,
    color,
  } = dhikr;

  const progress = useMemo(
    () => clampProgress(count, targetCount),
    [count, targetCount]
  );

  const isCompleted = progress >= 1;

  const progressAnimation = useRef(
    new Animated.Value(progress)
  ).current;

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      progressAnimation.setValue(progress);
      return;
    }

    const animation = Animated.timing(
      progressAnimation,
      {
        toValue: progress,
        duration: isCompleted ? 300 : 150,
        easing: isCompleted
          ? Easing.out(Easing.back(1.2))
          : Easing.out(Easing.quad),
        useNativeDriver: true,
      }
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [
    progress,
    isCompleted,
    progressAnimation,
  ]);

  const progressScaleX =
    progressAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

  const cardBackgroundColor = useMemo(
    () =>
      isActive
        ? color
        : withAlpha(color, 0.15),
    [isActive, color]
  );

  const borderColor = useMemo(
    () =>
      withAlpha(
        color,
        isActive ? 0.44 : 0.19
      ),
    [color, isActive]
  );

  const cardWidth =
    variant === 'vertical'
      ? metrics.verticalCardWidth
      : metrics.cardWidth;

  const cardHeight =
    variant === 'vertical'
      ? metrics.verticalCardHeight
      : metrics.cardHeight;

  const containerStyle =
    variant === 'vertical'
      ? styles.verticalContainer
      : styles.container;

  const marginStyle =
    variant === 'vertical'
      ? styles.verticalMargin
      : {
          marginHorizontal: metrics.marginH,
        };

  const headerStyle =
    variant === 'vertical'
      ? styles.verticalCardHeader
      : styles.cardHeader;

  const arabicTextStyle =
    variant === 'vertical'
      ? styles.verticalArabicText
      : styles.arabicText;

  const countTextStyle =
    variant === 'vertical'
      ? styles.verticalCountText
      : styles.countText;

  const accessibilityLabel = isCompleted
    ? `${arabicText}. ${count} من ${targetCount}. مكتمل`
    : `${arabicText}. ${count} من ${targetCount}. ${Math.round(
        progress * 100
      )} بالمئة`;

  const formattedCount = Number.isFinite(count)
    ? count.toLocaleString(locale)
    : '0';

  const formattedTargetCount =
    Number.isFinite(targetCount)
      ? targetCount.toLocaleString(locale)
      : '0';

  return (
    <Pressable
      testID={`dhikr-card-${id}`}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{
        selected: isActive,
      }}
      onPress={onPress}
      style={({ pressed }) => [
        containerStyle,
        {
          backgroundColor: cardBackgroundColor,
          borderWidth: isActive ? 2 : 1,
          borderColor,
          width: cardWidth,
          height: cardHeight,
        },
        marginStyle,
        pressed && styles.pressed,
      ]}
    >
      <View style={headerStyle}>
        <Text
          style={arabicTextStyle}
          numberOfLines={
            variant === 'vertical' ? 1 : 2
          }
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          maxFontSizeMultiplier={1.25}
          accessibilityRole="text"
        >
          {arabicText}
        </Text>

        {isCompleted && (
          <View
            style={styles.completionIcon}
            testID="completion-icon"
            accessible
            accessibilityLabel="تم إكمال الذكر"
          >
            <CheckCircle
              size={variant === 'vertical' ? 14 : 18}
              color="#4CAF50"
              strokeWidth={2.5}
            />
          </View>
        )}
      </View>

      <Text
        style={countTextStyle}
        maxFontSizeMultiplier={1.2}
        numberOfLines={1}
      >
        {formattedCount}/{formattedTargetCount}
      </Text>

      <Text
        style={styles.progressText}
        maxFontSizeMultiplier={1.2}
        numberOfLines={1}
      >
        {Math.round(progress * 100)}%
      </Text>

      <View
        style={styles.progressContainer}
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round(progress * 100),
        }}
      >
        <View style={styles.progressBackground} />

        <Animated.View
          testID="progress-bar"
          style={[
            styles.progressBar,
            {
              backgroundColor: isActive
                ? 'rgba(255,255,255,0.7)'
                : color,
              transform: [
                {
                  scaleX: progressScaleX,
                },
              ],
            },
          ]}
        />
      </View>
    </Pressable>
  );
};

DhikrCardComponent.displayName = 'DhikrCard';

export const DhikrCard = memo(
  DhikrCardComponent,
  (prevProps, nextProps) => {
    if (prevProps === nextProps) {
      return true;
    }

    return (
      prevProps.dhikr.id === nextProps.dhikr.id &&
      prevProps.dhikr.arabicText ===
        nextProps.dhikr.arabicText &&
      prevProps.dhikr.count ===
        nextProps.dhikr.count &&
      prevProps.dhikr.targetCount ===
        nextProps.dhikr.targetCount &&
      prevProps.dhikr.color ===
        nextProps.dhikr.color &&
      prevProps.isActive ===
        nextProps.isActive &&
      prevProps.variant ===
        nextProps.variant &&
      prevProps.locale ===
        nextProps.locale &&
      prevProps.onPress ===
        nextProps.onPress
    );
  }
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    padding: 10,
    justifyContent: 'space-between',
    overflow: 'hidden',

    ...Platform.select({
      android: {
        elevation: 4,
      },

      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },

      web: {
        boxShadow:
          '0px 3px 8px rgba(0,0,0,0.2)',
      },
    }),
  },

  verticalContainer: {
    borderRadius: 10,
    padding: 6,
    justifyContent: 'space-between',
    overflow: 'hidden',

    ...Platform.select({
      android: {
        elevation: 2,
      },

      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },

      web: {
        boxShadow:
          '0px 1px 4px rgba(0,0,0,0.1)',
      },
    }),
  },

  verticalMargin: {
    marginVertical: 4,
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

  completionIcon: {
    marginLeft: 8,
  },

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

  progressText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '700',
    textAlign: 'center',
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
    backgroundColor:
      'rgba(255,255,255,0.2)',
  },

  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    borderRadius: 3,
    transformOrigin: 'left',
  },

  pressed: {
    opacity: 0.85,
  },
});