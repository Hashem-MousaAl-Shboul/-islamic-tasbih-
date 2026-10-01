import React, { memo } from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';

const MISBAHA_IMAGE = require('@/assets/images/misbaha-hand.jpg');

interface MisbahaCounterProps {
  width: number;
  onPress?: () => void;
  testID?: string;
}

/**
 * عدّاد التسبيح: صورة المسبحة في اليد — الضغط على الصورة يسجّل التسبيحة.
 * يستبدل عدّاد الحلقة (BeadRingCounter) بنفس التفاعل (نبضة + اهتزاز + صوت من الشاشة).
 * نسبة أبعاد الصورة الأصلية 592×470.
 */
const MisbahaCounter = memo<MisbahaCounterProps>(({
  width,
  onPress,
  testID = 'misbaha-counter',
}) => {
  const height = Math.round(width / 1.26);

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel="Increment tasbih counter"
      style={({ pressed }) => [styles.container, { width, height }, pressed && styles.pressed]}
    >
      <View style={[styles.frame, { width, height, borderRadius: 24 }]}>
        <Image
          source={MISBAHA_IMAGE}
          style={[styles.image, { borderRadius: 24 }]}
          resizeMode="cover"
          fadeDuration={0}
        />
      </View>
    </Pressable>
  );
});

MisbahaCounter.displayName = 'MisbahaCounter';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  frame: {
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(212,168,83,0.35)',
    backgroundColor: '#EFE9DE',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 6px 24px rgba(0,0,0,0.12)',
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default MisbahaCounter;
