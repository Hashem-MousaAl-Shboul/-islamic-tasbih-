import React, { memo } from 'react';
import { StyleSheet, View, Image, type ImageStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';

interface ThemedBackgroundProps {
  children: React.ReactNode;
  testID?: string;
}

export const ThemedBackground = memo(function ThemedBackground({ children, testID }: ThemedBackgroundProps) {
  const theme = useTheme();
  const { backgroundTheme } = theme;

  // ثيم «default» كريمي مخصص للوضع الفاتح؛ في الوضع الداكن نستبدل بالتدرج الداكن
  const effectiveBackground =
    theme.mode === 'dark' && backgroundTheme.key === 'default'
      ? { ...backgroundTheme, type: 'gradient' as const, colors: ['#16213E', '#0F172A'] as const, contentTint: 'light' as const }
      : backgroundTheme;

  if (effectiveBackground.key === 'custom' && effectiveBackground.customImage) {
    return (
      <View style={styles.container} testID={testID}>
        <Image source={{ uri: effectiveBackground.customImage }} style={styles.image as ImageStyle} resizeMode="cover" />
        <View style={[styles.overlay, { backgroundColor: effectiveBackground.overlay }]} />
        {children}
      </View>
    );
  }

  if (effectiveBackground.type === 'gradient' && effectiveBackground.colors) {
    return (
      <LinearGradient
        colors={effectiveBackground.colors as [string, string]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        testID={testID}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: effectiveBackground.colors?.[0] ?? theme.background }]} testID={testID}>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
