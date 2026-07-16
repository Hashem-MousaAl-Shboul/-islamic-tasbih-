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

  if (backgroundTheme.key === 'custom' && backgroundTheme.customImage) {
    return (
      <View style={styles.container} testID={testID}>
        <Image source={{ uri: backgroundTheme.customImage }} style={styles.image as ImageStyle} resizeMode="cover" />
        <View style={[styles.overlay, { backgroundColor: backgroundTheme.overlay }]} />
        {children}
      </View>
    );
  }

  if (backgroundTheme.type === 'gradient' && backgroundTheme.colors) {
    return (
      <LinearGradient
        colors={backgroundTheme.colors as [string, string]}
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
    <View style={[styles.container, { backgroundColor: backgroundTheme.colors?.[0] ?? theme.background }]} testID={testID}>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
