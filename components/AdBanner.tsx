import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ColorValue } from 'react-native';
import { adTracker } from '@/utils/adTracking';

export interface AdBannerProps {
  imageUrl: string;
  headline: string;
  cta: string;
  destinationUrl: string;
  variant?: 'dark' | 'light';
  height?: number;
  testID?: string;
  onImpression?: () => void;
  onPress?: () => void;
}

function openExternal(url: string) {
  try {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
      return;
    }
    Linking.openURL(url).catch(() => {
      console.log('[AdBanner] Failed to open URL');
    });
  } catch (e) {
    console.log('[AdBanner] openExternal error', e);
  }
}

const AdBannerComponent: React.FC<AdBannerProps> = ({ imageUrl, headline, cta, destinationUrl, variant = 'dark', height = 84, testID = 'ad-banner', onImpression, onPress: onPressCallback }) => {
  const [hasTrackedImpression, setHasTrackedImpression] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!hasTrackedImpression) {
      const adId = testID || 'unknown-ad';
      adTracker.trackImpression(adId, 'screen', 'banner');
      if (onImpression) {
        onImpression();
      }
      setHasTrackedImpression(true);
    }
  }, [hasTrackedImpression, onImpression, testID]);
  const gradientColors = useMemo<readonly [ColorValue, ColorValue]>(() => (
    variant === 'dark' ? (['#0F172A', '#1F2937'] as const) : (['#FFFFFF', '#F8FAFC'] as const)
  ), [variant]);

  const textColor = variant === 'dark' ? '#F8FAFC' : '#0F172A';
  const subTextColor = variant === 'dark' ? '#CBD5E1' : '#334155';

  const onPress = useCallback(() => {
    const adId = testID || 'unknown-ad';
    adTracker.trackClick(adId, 'screen', 'banner');
    if (onPressCallback) {
      onPressCallback();
    }
    openExternal(destinationUrl);
  }, [destinationUrl, testID, onPressCallback]);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.container, { height }]} testID={testID} accessibilityRole="button" accessibilityLabel={headline}>
      <LinearGradient colors={gradientColors} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.row}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.image} 
              resizeMode="cover"
              onLoad={() => setImageLoaded(true)}
              fadeDuration={300}
            />
            {!imageLoaded && (
              <View style={styles.imagePlaceholder}>
                <View style={styles.placeholderShimmer} />
              </View>
            )}
          </View>
          <View style={styles.texts}>
            <Text style={[styles.headline, { color: textColor }]} numberOfLines={2}>{headline}</Text>
            <View style={styles.ctaPill}>
              <Text style={[styles.ctaText, { color: subTextColor }]}>{cta}</Text>
            </View>
          </View>
        </View>
        <View style={styles.adIndicator}>
          <Text style={styles.adIndicatorText}>إعلان</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default memo(AdBannerComponent);

const styles = StyleSheet.create({
  container: {
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 0,
    borderTopWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageContainer: {
    width: 70,
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderShimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  texts: {
    flex: 1,
    gap: 7,
    justifyContent: 'center',
  },
  headline: {
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  ctaPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(16,185,129,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  ctaText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  adIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  adIndicatorText: {
    fontSize: 9,
    fontWeight: '700' as const,
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
});
