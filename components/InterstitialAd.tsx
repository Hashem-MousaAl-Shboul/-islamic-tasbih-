import React, { memo, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, ExternalLink } from 'lucide-react-native';
import { adTracker } from '@/utils/adTracking';

export interface InterstitialAdProps {
  visible: boolean;
  onClose: () => void;
  adId: string;
  imageUrl: string;
  headline: string;
  description: string;
  cta: string;
  destinationUrl: string;
  skipDelay?: number;
  testID?: string;
}

const InterstitialAdComponent: React.FC<InterstitialAdProps> = ({ 
  visible, 
  onClose, 
  adId, 
  imageUrl,
  headline,
  description,
  cta,
  destinationUrl,
  skipDelay = 3,
  testID = 'interstitial-ad' 
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(skipDelay);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [hasTrackedImpression, setHasTrackedImpression] = useState<boolean>(false);

  const handleClose = useCallback(() => {
    console.log(`[InterstitialAd] Closing interstitial ad: ${adId}`);
    adTracker.trackClick(`close-${adId}`, 'interstitial', 'close-button', 'interstitial');
    onClose();
  }, [adId, onClose]);

  const handleOpenLink = useCallback(() => {
    console.log(`[InterstitialAd] Opening link: ${destinationUrl}`);
    adTracker.trackClick(adId, 'interstitial', 'cta-button', 'interstitial');
    
    if (Platform.OS === 'web') {
      window.open(destinationUrl, '_blank');
    } else {
      import('expo-linking').then(({ default: Linking }) => {
        Linking.openURL(destinationUrl).catch((err) => {
          console.error('[InterstitialAd] Failed to open URL:', err);
        });
      });
    }
  }, [adId, destinationUrl]);

  useEffect(() => {
    if (visible) {
      console.log(`[InterstitialAd] Interstitial ad displayed: ${adId}`);
      setTimeRemaining(skipDelay);
      setCanSkip(false);
      
      if (!hasTrackedImpression) {
        console.log(`[InterstitialAd] Tracking impression for: ${adId}`);
        adTracker.trackImpression(adId, 'interstitial', 'fullscreen', 'interstitial');
        setHasTrackedImpression(true);
      }

      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          console.log(`[InterstitialAd] Timer update: ${newTime}s remaining`);
          
          if (newTime <= 0) {
            setCanSkip(true);
            return 0;
          }
          return newTime;
        });
      }, 1000);

      return () => {
        console.log(`[InterstitialAd] Cleaning up timer for: ${adId}`);
        clearInterval(timer);
      };
    } else {
      setHasTrackedImpression(false);
    }
  }, [visible, skipDelay, adId, hasTrackedImpression]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={canSkip ? handleClose : undefined}
      testID={testID}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.98)', 'rgba(15, 23, 42, 0.98)']}
          style={styles.backdrop}
        >
          {/* Ad Content */}
          <View style={styles.contentContainer}>
            {/* Image */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.imageOverlay}
              />
            </View>

            {/* Text Content */}
            <View style={styles.textContent}>
              <Text style={styles.headline}>{headline}</Text>
              <Text style={styles.description}>{description}</Text>
              
              {/* CTA Button */}
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={handleOpenLink}
                testID="interstitial-cta-button"
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.ctaButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.ctaText}>{cta}</Text>
                  <ExternalLink size={18} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Skip Timer */}
            <View style={styles.skipContainer}>
              {canSkip ? (
                <TouchableOpacity 
                  style={styles.skipButton}
                  onPress={handleClose}
                  testID="skip-ad-button"
                >
                  <X size={20} color="#FFFFFF" />
                  <Text style={styles.skipText}>تخطي الإعلان</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.timerDisplay}>
                  <Text style={styles.timerText}>يمكنك التخطي بعد {timeRemaining}s</Text>
                </View>
              )}
            </View>

            {/* Ad Badge */}
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>إعلان</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default memo(InterstitialAdComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  textContent: {
    padding: 24,
    gap: 16,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 17,
    fontWeight: '500' as const,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  ctaButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    gap: 10,
  },
  ctaText: {
    fontSize: 19,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  skipContainer: {
    padding: 16,
    alignItems: 'center',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  timerDisplay: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  adBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  adBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#F59E0B',
  },
});
