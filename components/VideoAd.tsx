import React, { memo, useCallback, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { Video, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import { adTracker } from '@/utils/adTracking';

export interface VideoAdProps {
  visible: boolean;
  onClose: () => void;
  adId: string;
  videoUrl: string;
  duration?: number;
  autoClose?: boolean;
  testID?: string;
}

const VideoAdComponent: React.FC<VideoAdProps> = ({ 
  visible, 
  onClose, 
  adId, 
  videoUrl,
  duration = 10,
  autoClose = true,
  testID = 'video-ad' 
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(duration);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const hasTrackedImpressionRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const videoRef = useRef<Video>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleClose = useCallback(() => {
    console.log(`[VideoAd] Closing video ad: ${adId}`);
    adTracker.trackClick(`close-${adId}`, 'tasbih', 'video-ad-close');
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    onCloseRef.current();
  }, [adId]);

  useEffect(() => {
    if (!visible) {
      hasTrackedImpressionRef.current = false;
      return;
    }

    console.log(`[VideoAd] Video ad displayed: ${adId}`);
    setTimeRemaining(duration);
    setCanSkip(false);
    setIsLoading(true);

    if (!hasTrackedImpressionRef.current) {
      console.log(`[VideoAd] Tracking impression for: ${adId}`);
      adTracker.trackImpression(adId, 'tasbih', 'video-ad');
      hasTrackedImpressionRef.current = true;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setCanSkip(true);
          if (autoClose) {
            console.log(`[VideoAd] Auto-closing video ad: ${adId}`);
            setTimeout(() => {
              onCloseRef.current();
            }, 500);
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      console.log(`[VideoAd] Cleaning up timer for: ${adId}`);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible, duration, adId, autoClose]);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if ('isLoaded' in status && status.isLoaded) {
      const loadedStatus = status as AVPlaybackStatusSuccess;
      setIsLoading(false);
      if (loadedStatus.didJustFinish) {
        console.log(`[VideoAd] Video finished playing: ${adId}`);
        if (autoClose) {
          handleClose();
        }
      }
    } else if ('error' in status) {
      console.error(`[VideoAd] Video error:`, status.error);
      setIsLoading(false);
    }
  }, [adId, autoClose, handleClose]);

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
          {/* Video Container */}
          <View style={styles.videoContainer}>
            {Platform.OS === 'web' ? (
              <video
                src={videoUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain' as 'contain',
                  backgroundColor: '#000000'
                }}
                autoPlay
                playsInline
                muted={false}
                controls={false}
                onLoadedData={() => {
                  console.log(`[VideoAd] Web video loaded: ${adId}`);
                  setIsLoading(false);
                }}
                onError={(e) => {
                  console.error(`[VideoAd] Web video error:`, e);
                  setIsLoading(false);
                }}
                onEnded={() => {
                  console.log(`[VideoAd] Web video finished: ${adId}`);
                  if (autoClose) {
                    handleClose();
                  }
                }}
              />
            ) : (
              <Video
                ref={videoRef}
                source={{ uri: videoUrl }}
                style={styles.video}
                useNativeControls={false}
                resizeMode={'contain' as any}
                shouldPlay={visible}
                isLooping={false}
                volume={1.0}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              />
            )}
            
            {/* Loading Indicator */}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <Text style={styles.loadingText}>جاري تحميل الإعلان...</Text>
              </View>
            )}
            
            {/* Timer Overlay */}
            <View style={styles.timerOverlay}>
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>
                  {timeRemaining}s
                </Text>
              </View>
            </View>

            {/* Close Button (only show when can skip) */}
            {canSkip && (
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleClose}
                testID="close-video-ad-button"
              >
                <LinearGradient
                  colors={['rgba(239, 68, 68, 0.9)', 'rgba(220, 38, 38, 0.9)']}
                  style={styles.closeButtonGradient}
                >
                  <X size={24} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Info Text */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {canSkip ? 'اضغط لإغلاق الإعلان' : `يُعرض الإعلان... ${timeRemaining}s`}
            </Text>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default memo(VideoAdComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  timerOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  timerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.6)',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  timerText: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: '#10B981',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#10B981',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#10B981',
    textAlign: 'center',
  },
});
