import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Play, Pause, Square, Volume2, Settings, Headphones } from 'lucide-react-native';
import { yasAI, YasAIConfig, ReciterVoice, AVAILABLE_RECITERS } from '@/utils/yasAI';

interface YasAIPlayerProps {
  dhikrId?: string;
  text?: string;
  category?: 'morning' | 'evening' | 'after-prayer';
  reciterId?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  showReciterSelector?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onError?: (error: string) => void;
}

export const YasAIPlayer: React.FC<YasAIPlayerProps> = ({
  dhikrId,
  text,
  category,
  reciterId,
  autoPlay = false,
  showControls = true,
  showReciterSelector = true,
  onPlayStateChange,
  onError
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentReciter, setCurrentReciter] = useState<string>(reciterId || 'alafasy');
  const [config, setConfig] = useState<YasAIConfig>(yasAI.getConfig());
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // تحديث حالة التشغيل
  const updatePlaybackState = useCallback(() => {
    const state = yasAI.getPlaybackState();
    setIsPlaying(state.isPlaying);
    onPlayStateChange?.(state.isPlaying);
  }, [onPlayStateChange]);

  // تشغيل الصوت
  const handlePlay = useCallback(async () => {
    try {
      setIsLoading(true);
      let success = false;

      if (dhikrId) {
        success = await yasAI.playDhikr(dhikrId, currentReciter);
      } else if (category) {
        success = await yasAI.playCategory(category, currentReciter);
      } else if (text) {
        success = await yasAI.playText(text, { reciter: currentReciter });
      }

      if (!success) {
        const errorMsg = 'فشل في تشغيل الصوت. تحقق من الاتصال بالإنترنت.';
        onError?.(errorMsg);
        Alert.alert('خطأ', errorMsg);
      }
    } catch (error) {
      const errorMsg = 'حدث خطأ أثناء التشغيل';
      console.error('[YasAIPlayer] Play error:', error);
      onError?.(errorMsg);
      Alert.alert('خطأ', errorMsg);
    } finally {
      setIsLoading(false);
      updatePlaybackState();
    }
  }, [dhikrId, category, text, currentReciter, onError, updatePlaybackState]);

  // إيقاف مؤقت/استئناف
  const handlePause = useCallback(async () => {
    try {
      await yasAI.pause();
      updatePlaybackState();
    } catch (error) {
      console.error('[YasAIPlayer] Pause error:', error);
    }
  }, [updatePlaybackState]);

  // إيقاف التشغيل
  const handleStop = useCallback(async () => {
    try {
      await yasAI.stop();
      updatePlaybackState();
    } catch (error) {
      console.error('[YasAIPlayer] Stop error:', error);
    }
  }, [updatePlaybackState]);

  // تغيير المقرئ
  const handleReciterChange = useCallback((newReciterId: string) => {
    setCurrentReciter(newReciterId);
    yasAI.updateConfig({ voice: newReciterId as any });
    setConfig(yasAI.getConfig());
  }, []);

  // تحديث إعدادات الصوت
  const handleConfigUpdate = useCallback((newConfig: Partial<YasAIConfig>) => {
    yasAI.updateConfig(newConfig);
    setConfig(yasAI.getConfig());
  }, []);

  // التشغيل التلقائي
  useEffect(() => {
    if (autoPlay) {
      handlePlay();
    }
  }, [autoPlay, handlePlay]);

  // تحديث حالة التشغيل دورياً
  useEffect(() => {
    const interval = setInterval(updatePlaybackState, 1000);
    return () => clearInterval(interval);
  }, [updatePlaybackState]);

  if (!showControls) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* أزرار التحكم الرئيسية */}
      <View style={styles.mainControls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.playButton]}
          onPress={isPlaying ? handlePause : handlePlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : isPlaying ? (
            <Pause size={20} color="#FFFFFF" />
          ) : (
            <Play size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.stopButton]}
          onPress={handleStop}
          disabled={!isPlaying && !isLoading}
        >
          <Square size={16} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.settingsButton]}
          onPress={() => setShowSettings(!showSettings)}
        >
          <Settings size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* معلومات التشغيل */}
      <View style={styles.infoContainer}>
        <View style={styles.reciterInfo}>
          <Headphones size={12} color="#10B981" />
          <Text style={styles.reciterText}>
            {AVAILABLE_RECITERS.find(r => r.id === currentReciter)?.nameArabic || 'غير محدد'}
          </Text>
        </View>
        
        {isPlaying && (
          <View style={styles.playingIndicator}>
            <Volume2 size={12} color="#10B981" />
            <Text style={styles.playingText}>جارٍ التشغيل...</Text>
          </View>
        )}
      </View>

      {/* اختيار المقرئ */}
      {showReciterSelector && (
        <View style={styles.reciterSelector}>
          <Text style={styles.selectorTitle}>اختر المقرئ:</Text>
          <View style={styles.reciterButtons}>
            {AVAILABLE_RECITERS.map((reciter) => (
              <TouchableOpacity
                key={reciter.id}
                style={[
                  styles.reciterButton,
                  currentReciter === reciter.id && styles.reciterButtonActive
                ]}
                onPress={() => handleReciterChange(reciter.id)}
              >
                <Text
                  style={[
                    styles.reciterButtonText,
                    currentReciter === reciter.id && styles.reciterButtonTextActive
                  ]}
                >
                  {reciter.nameArabic}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* إعدادات متقدمة */}
      {showSettings && (
        <View style={styles.settingsPanel}>
          <Text style={styles.settingsTitle}>إعدادات الصوت</Text>
          
          {/* سرعة التشغيل */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>السرعة: {config.speed.toFixed(1)}x</Text>
            <View style={styles.speedButtons}>
              <TouchableOpacity
                style={styles.speedButton}
                onPress={() => handleConfigUpdate({ speed: Math.max(0.5, config.speed - 0.1) })}
              >
                <Text style={styles.speedButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.speedButton}
                onPress={() => handleConfigUpdate({ speed: Math.min(2.0, config.speed + 0.1) })}
              >
                <Text style={styles.speedButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* مستوى الصوت */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>الصوت: {Math.round(config.volume * 100)}%</Text>
            <View style={styles.speedButtons}>
              <TouchableOpacity
                style={styles.speedButton}
                onPress={() => handleConfigUpdate({ volume: Math.max(0.0, config.volume - 0.1) })}
              >
                <Text style={styles.speedButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.speedButton}
                onPress={() => handleConfigUpdate({ volume: Math.min(1.0, config.volume + 0.1) })}
              >
                <Text style={styles.speedButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  playButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  settingsButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reciterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reciterText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playingText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '600' as const,
  },
  reciterSelector: {
    marginBottom: 12,
  },
  selectorTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 8,
    textAlign: 'right',
  },
  reciterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  reciterButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reciterButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  reciterButtonText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  reciterButtonTextActive: {
    color: '#FFFFFF',
  },
  settingsPanel: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  settingsTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 12,
    textAlign: 'right',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  speedButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  speedButton: {
    width: 28,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  speedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700' as const,
  },
});