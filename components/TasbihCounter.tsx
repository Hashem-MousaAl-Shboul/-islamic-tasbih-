import React, { memo, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { TasbihItem } from '@/hooks/useTasbihStore';
import { soundService } from '@/utils/soundService';

interface TasbihCounterProps {
  item: TasbihItem;
  onIncrement: () => void;
  onDecrement: () => void;
  hapticEnabled: boolean;
  soundEnabled?: boolean;
  size?: number;
}

const TasbihCounter = memo<TasbihCounterProps>(({ 
  item, 
  onIncrement, 
  onDecrement, 
  hapticEnabled,
  soundEnabled = false,
  size = 160 
}) => {
  const lastHapticTime = useRef<number>(0);
  const wasCompletedRef = useRef<boolean>(false);

  useEffect(() => {
    soundService.initialize();
    return () => {
      soundService.unload();
    };
  }, []);

  useEffect(() => {
    const isCompleted = item.count >= item.targetCount;
    if (isCompleted && !wasCompletedRef.current && soundEnabled) {
      soundService.playCompletion();
    }
    wasCompletedRef.current = isCompleted;
  }, [item.count, item.targetCount, soundEnabled]);
  
  const progress = useMemo(() => {
    return item.targetCount > 0 ? Math.min(item.count / item.targetCount, 1) : 0;
  }, [item.count, item.targetCount]);



  const triggerHaptic = useCallback(async () => {
    if (hapticEnabled && Platform.OS !== 'web') {
      const now = Date.now();
      if (now - lastHapticTime.current > 150) {
        lastHapticTime.current = now;
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
          console.log('Haptic feedback error:', error);
        }
      }
    }
  }, [hapticEnabled]);

  const handleIncrement = useCallback(async () => {
    triggerHaptic();
    
    if (soundEnabled) {
      soundService.playClick();
    }
    
    onIncrement();
  }, [triggerHaptic, soundEnabled, onIncrement]);

  const handleDecrement = useCallback(async () => {
    if (item.count > 0) {
      triggerHaptic();
      
      if (soundEnabled) {
        soundService.playClick();
      }
      
      onDecrement();
    }
  }, [item.count, triggerHaptic, soundEnabled, onDecrement]);

  const gradientColors = useMemo(() => {
    const baseColor = item.color;
    const lighterColor = baseColor + '60';
    return [baseColor, lighterColor] as const;
  }, [item.color]);

  const isCompleted = useMemo(() => item.count >= item.targetCount, [item.count, item.targetCount]);

  return (
    <View style={[styles.container, { width: size, height: size }]} testID="tasbih-counter">
      <Pressable 
        style={[styles.counterButton, { width: size, height: size }]}
        onPress={handleIncrement}
        onLongPress={handleDecrement}
        testID="counter-button"
      >
        <LinearGradient
          colors={gradientColors}
          style={[styles.gradient, { borderRadius: size / 2, width: size, height: size }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.counterContent}>
            <Text style={styles.countText}>
              {item.count.toLocaleString('en-US')}
            </Text>
            <Text style={styles.targetText}>
              من {item.targetCount.toLocaleString('en-US')}
            </Text>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>✓</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </Pressable>
      
      <View style={styles.progressInfo}>
        <Text style={[styles.progressText, { color: item.color }]}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
    </View>
  );
});

TasbihCounter.displayName = 'TasbihCounter';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  counterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  counterContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  countText: {
    fontSize: 64,
    fontWeight: '800' as const,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  targetText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600' as const,
  },
  completedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10B981',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  progressInfo: {
    marginTop: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressText: {
    fontSize: 22,
    fontWeight: '700' as const,
    textAlign: 'center',
  },

});

export default TasbihCounter;