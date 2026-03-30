import React, { useMemo, useRef, useEffect, memo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Animated, Easing, useWindowDimensions } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { Dhikr } from '@/types';

function computeMetrics(screenWidth: number) {
  const marginH = 8;
  const paddingH = 20;
  const isTablet = screenWidth >= 768;
  const visible = isTablet ? 5 : screenWidth >= 414 ? 3 : 2.4;
  const cardWidth = Math.max(120, Math.floor((screenWidth - paddingH * 2 - marginH * 2 * visible) / visible));
  const cardHeight = Math.round(cardWidth * 0.66);
  const snapInterval = cardWidth + marginH * 2;
  
  // Vertical layout metrics for right panel
  const verticalCardWidth = Math.min(180, screenWidth * 0.35);
  const verticalCardHeight = 80;
  
  return { cardWidth, cardHeight, marginH, snapInterval, verticalCardWidth, verticalCardHeight } as const;
}

export const getDhikrCardMetrics = () => computeMetrics(400); // Default fallback

interface DhikrCardProps {
  dhikr: Dhikr;
  isActive: boolean;
  onPress: () => void;
  variant?: 'horizontal' | 'vertical';
}

const DhikrCardComponent: React.FC<DhikrCardProps> = ({ dhikr, isActive, onPress, variant = 'horizontal' }) => {
  const { width: screenWidth } = useWindowDimensions();
  const metrics = useMemo(() => computeMetrics(screenWidth), [screenWidth]);
  
  const { arabicText, count, targetCount, color } = dhikr;
  const progressValue = useRef(new Animated.Value(0)).current;
  
  const progress = useMemo(() => Math.min(count / targetCount, 1), [count, targetCount]);
  const isCompleted = useMemo(() => progress >= 1, [progress]);
  
  // Optimized progress animation - only animate when progress changes significantly
  const prevProgressRef = useRef(0);
  useEffect(() => {
    const threshold = 0.01; // Only animate if change is > 1%
    const prevProgress = prevProgressRef.current;
    if (Math.abs(progress - prevProgress) > threshold) {
      Animated.timing(progressValue, {
        toValue: progress,
        duration: isCompleted ? 300 : 150,
        easing: isCompleted ? Easing.out(Easing.back(1.2)) : Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
      prevProgressRef.current = progress;
    }
  }, [progress, progressValue, isCompleted]);
  
  const handlePress = () => {
    onPress();
  };
  
  const progressWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  
  const cardBackgroundColor = useMemo(() => {
    if (isActive) {
      return color;
    }
    return `${color}25`;
  }, [isActive, color]);
  
  const cardWidth = variant === 'vertical' ? metrics.verticalCardWidth : metrics.cardWidth;
  const cardHeight = variant === 'vertical' ? metrics.verticalCardHeight : metrics.cardHeight;
  const marginStyle = variant === 'vertical' ? { marginVertical: 4 } : { marginHorizontal: metrics.marginH };
  
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[
        variant === 'vertical' ? styles.verticalContainer : styles.container,
        { 
          backgroundColor: cardBackgroundColor,
          borderWidth: isActive ? 2 : 1,
          borderColor: isActive ? `${color}70` : `${color}30`,
          width: cardWidth,
          height: cardHeight,
          ...marginStyle,
        }
      ]}
      testID={`dhikr-card-${dhikr.id}`}
    >
      <View style={variant === 'vertical' ? styles.verticalCardHeader : styles.cardHeader}>
        <Text 
          style={variant === 'vertical' ? styles.verticalArabicText : styles.arabicText} 
          numberOfLines={variant === 'vertical' ? 1 : 2}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.8}
          allowFontScaling={false}
        >
          {arabicText}
        </Text>
        {isCompleted && (
          <View style={styles.completionIcon}>
            <CheckCircle size={variant === 'vertical' ? 14 : 18} color="#4CAF50" />
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
            }
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
    prevProps.dhikr.count === nextProps.dhikr.count &&
    prevProps.dhikr.targetCount === nextProps.dhikr.targetCount &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.dhikr.color === nextProps.dhikr.color &&
    prevProps.variant === nextProps.variant
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
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 3px 8px rgba(0,0,0,0.2)',
      },
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
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 4px rgba(0,0,0,0.1)',
      },
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
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'right' as const,
    flex: 1,
    lineHeight: 28,
    letterSpacing: 0.5,
    includeFontPadding: false,
    writingDirection: 'rtl',
    textAlignVertical: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  verticalArabicText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'right' as const,
    flex: 1,
    lineHeight: 24,
    includeFontPadding: false,
    writingDirection: 'rtl',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  completionIcon: {
    marginLeft: 8,
  },
  countText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.95,
    textAlign: 'center' as const,
    fontWeight: '700' as const,
    includeFontPadding: false,
    letterSpacing: 0.5,
    textAlignVertical: 'center',
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      default: 'monospace',
    }),
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  verticalCountText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center' as const,
    fontWeight: '600' as const,
    includeFontPadding: false,
    letterSpacing: 0.3,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      default: 'monospace',
    }),
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    borderRadius: 3,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
    position: 'absolute',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});