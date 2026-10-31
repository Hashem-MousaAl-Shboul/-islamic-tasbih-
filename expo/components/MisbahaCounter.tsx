import { memo } from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';

const MISBAHA_HERO = require('@/assets/images/tasbih-misbaha-hero.png');

interface MisbahaCounterProps {
  onPress?: () => void;
  testID?: string;
}

/**
 * البطل المصوّر لشاشة التسبيح: صورة اليد الممسكة بالمسبحة بعرض الشاشة.
 * الضغط في أي مكان على الصورة يُسجّل التسبيحة (النبضة والاهتزاز والصوت من الشاشة).
 * أبعاد الصورة الأصلية 1024×1536.
 */
const MisbahaCounter = memo<MisbahaCounterProps>(({
  onPress,
  testID = 'misbaha-counter',
}) => {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel="Tasbih counter"
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <Image
        source={MISBAHA_HERO}
        style={styles.image}
        resizeMode="cover"
        fadeDuration={0}
      />
    </Pressable>
  );
});

MisbahaCounter.displayName = 'MisbahaCounter';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 0.78,
    overflow: 'hidden',
    backgroundColor: '#EFE9DE',
  },
  pressed: {
    opacity: 0.94,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default MisbahaCounter;
