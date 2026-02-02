import React, { memo, useCallback, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Gift, X, CheckCircle } from 'lucide-react-native';
import { adTracker } from '@/utils/adTracking';

export interface RewardedAdProps {
  visible: boolean;
  onClose: (rewardClaimed: boolean) => void;
  onRewardClaimed: (rewardValue: number) => void;
  adId: string;
  videoUrl: string;
  rewardValue: number;
  rewardMessage: string;
  testID?: string;
}

const RewardedAdComponent: React.FC<RewardedAdProps> = ({ 
  visible, 
  onClose, 
  onRewardClaimed,
  adId, 
  videoUrl,
  rewardValue,
  rewardMessage,
  testID = 'rewarded-ad' 
}) => {
  const [videoWatched, setVideoWatched] = useState<boolean>(false);
  const [showReward, setShowReward] = useState<boolean>(false);
  const [hasTrackedImpression, setHasTrackedImpression] = useState<boolean>(false);
  const videoRef = useRef<Video>(null);

  const handleClose = useCallback((claimed: boolean) => {
    console.log(`[RewardedAd] Closing rewarded ad: ${adId}, claimed: ${claimed}`);
    if (claimed) {
      adTracker.trackClick(`claim-${adId}`, 'rewarded', 'claim-button', 'rewarded');
    } else {
      adTracker.trackClick(`close-${adId}`, 'rewarded', 'close-button', 'rewarded');
    }
    onClose(claimed);
    setVideoWatched(false);
    setShowReward(false);
  }, [adId, onClose]);

  const handleClaimReward = useCallback(() => {
    console.log(`[RewardedAd] Claiming reward: ${rewardValue}`);
    adTracker.trackRewardedClaim(adId, 'rewarded', rewardValue);
    onRewardClaimed(rewardValue);
    handleClose(true);
  }, [adId, rewardValue, onRewardClaimed, handleClose]);

  useEffect(() => {
    if (visible) {
      console.log(`[RewardedAd] Rewarded ad displayed: ${adId}`);
      setVideoWatched(false);
      setShowReward(false);
      
      if (!hasTrackedImpression) {
        console.log(`[RewardedAd] Tracking impression for: ${adId}`);
        adTracker.trackImpression(adId, 'rewarded', 'fullscreen', 'rewarded');
        setHasTrackedImpression(true);
      }

      return () => {
        console.log(`[RewardedAd] Cleaning up rewarded ad: ${adId}`);
      };
    } else {
      setHasTrackedImpression(false);
    }
  }, [visible, adId, hasTrackedImpression]);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if ('isLoaded' in status && status.isLoaded) {
      const loadedStatus = status as AVPlaybackStatusSuccess;
      if (loadedStatus.didJustFinish && !videoWatched) {
        console.log(`[RewardedAd] Video finished playing: ${adId}`);
        adTracker.trackVideoComplete(adId, 'rewarded', 10);
        setVideoWatched(true);
        setShowReward(true);
      }
    }
  }, [adId, videoWatched]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => handleClose(false)}
      testID={testID}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.98)', 'rgba(15, 23, 42, 0.98)']}
          style={styles.backdrop}
        >
          {!showReward ? (
            <>
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
                    onEnded={() => {
                      console.log(`[RewardedAd] Web video finished: ${adId}`);
                      adTracker.trackVideoComplete(adId, 'rewarded', 10);
                      setVideoWatched(true);
                      setShowReward(true);
                    }}
                  />
                ) : (
                  <Video
                    ref={videoRef}
                    source={{ uri: videoUrl }}
                    style={styles.video}
                    useNativeControls={false}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={visible}
                    isLooping={false}
                    volume={1.0}
                    onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                  />
                )}
                
                {/* Ad Badge */}
                <View style={styles.adBadge}>
                  <Gift size={16} color="#F59E0B" />
                  <Text style={styles.adBadgeText}>مشاهدة للحصول على مكافأة</Text>
                </View>
              </View>

              {/* Info Text */}
              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                  شاهد الإعلان كاملاً للحصول على المكافأة
                </Text>
              </View>
            </>
          ) : (
            /* Reward Screen */
            <View style={styles.rewardContainer}>
              <LinearGradient
                colors={['#10B981', '#059669', '#047857']}
                style={styles.rewardContent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Success Icon */}
                <View style={styles.successIcon}>
                  <CheckCircle size={80} color="#FFFFFF" strokeWidth={2} />
                </View>

                {/* Reward Message */}
                <Text style={styles.rewardTitle}>مبروك! 🎉</Text>
                <Text style={styles.rewardMessage}>{rewardMessage}</Text>
                
                {/* Reward Value Display */}
                <View style={styles.rewardValueContainer}>
                  <Gift size={32} color="#FFFFFF" />
                  <Text style={styles.rewardValue}>+{rewardValue}</Text>
                </View>

                {/* Claim Button */}
                <TouchableOpacity 
                  style={styles.claimButton}
                  onPress={handleClaimReward}
                  testID="claim-reward-button"
                >
                  <View style={styles.claimButtonContent}>
                    <Text style={styles.claimButtonText}>احصل على المكافأة</Text>
                  </View>
                </TouchableOpacity>

                {/* Skip Button */}
                <TouchableOpacity 
                  style={styles.skipRewardButton}
                  onPress={() => handleClose(false)}
                  testID="skip-reward-button"
                >
                  <X size={16} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.skipRewardText}>تخطي</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default memo(RewardedAdComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.5)',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 14,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  adBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adBadgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#F59E0B',
  },
  infoContainer: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  infoText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#10B981',
    textAlign: 'center',
  },
  rewardContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  rewardContent: {
    padding: 40,
    alignItems: 'center',
    gap: 20,
  },
  successIcon: {
    marginBottom: 10,
  },
  rewardTitle: {
    fontSize: 34,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  rewardMessage: {
    fontSize: 19,
    fontWeight: '600' as const,
    color: '#F0FDF4',
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  rewardValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginVertical: 10,
  },
  rewardValue: {
    fontSize: 36,
    fontWeight: '900' as const,
    color: '#FFFFFF',
  },
  claimButton: {
    width: '100%',
    marginTop: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  claimButtonContent: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  claimButtonText: {
    fontSize: 21,
    fontWeight: '900' as const,
    color: '#10B981',
    letterSpacing: 0.5,
  },
  skipRewardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipRewardText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.7)',
  },
});
