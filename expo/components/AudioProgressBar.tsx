import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Play, Pause, Square, SkipBack, SkipForward, Volume2 } from 'lucide-react-native';
import { yasAI } from '@/utils/yasAI';

interface AudioProgressBarProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AudioProgressBar: React.FC<AudioProgressBarProps> = ({ isVisible, onClose }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const slideAnim = useState(new Animated.Value(100))[0];

  // تحديث حالة التشغيل
  const updatePlaybackState = useCallback(() => {
    try {
      const state = yasAI.getPlaybackState();
      setIsPlaying(state.isPlaying);
      setCurrentId(state.currentId);
      
      if (state.isPlaying && state.currentId) {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (duration > 0) {
            setProgress((newTime / duration) * 100);
          }
          return newTime;
        });
      }
    } catch (error) {
      console.log('[AudioProgressBar] updatePlaybackState error:', error);
    }
  }, [duration]);

  // تحديث الرسوم المتحركة
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, slideAnim]);

  // تحديث حالة التشغيل دورياً
  useEffect(() => {
    if (!isVisible || !currentId) return;
    const interval = setInterval(updatePlaybackState, 1000);
    return () => clearInterval(interval);
  }, [updatePlaybackState, isVisible, currentId]);

  // إعادة تعيين التقدم عند تغيير الذكر
  useEffect(() => {
    if (currentId) {
      setCurrentTime(0);
      setProgress(0);
      // تعيين مدة افتراضية (في التطبيق الحقيقي، ستحصل على المدة الفعلية)
      setDuration(180); // 3 دقائق افتراضية
    }
  }, [currentId]);

  const handlePlayPause = useCallback(async () => {
    try {
      if (isPlaying) {
        await yasAI.pause();
      } else {
        await yasAI.pause(); // استئناف
      }
    } catch (error) {
      console.error('[AudioProgressBar] Play/Pause error:', error);
    }
  }, [isPlaying]);

  const handleStop = useCallback(async () => {
    try {
      await yasAI.stop();
      setCurrentTime(0);
      setProgress(0);
      onClose();
    } catch (error) {
      console.error('[AudioProgressBar] Stop error:', error);
    }
  }, [onClose]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDhikrTitle = (id: string | null): string => {
    if (!id) return 'غير محدد';
    
    if (id.includes('morning')) return 'أذكار الصباح';
    if (id.includes('evening')) return 'أذكار المساء';
    if (id.includes('after-prayer')) return 'أذكار بعد الصلاة';
    if (id.includes('ayat-kursi')) return 'آية الكرسي';
    
    return 'ذكر';
  };

  if (!isVisible || !currentId) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      {/* شريط التقدم */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* معلومات الذكر */}
      <View style={styles.infoContainer}>
        <Text style={styles.dhikrTitle}>{getDhikrTitle(currentId)}</Text>
        <Text style={styles.dhikrSubtitle}>جارٍ التشغيل...</Text>
      </View>

      {/* أزرار التحكم */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={() => {}}>
          <SkipBack size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, styles.playButton]} 
          onPress={handlePlayPause}
        >
          {isPlaying ? (
            <Pause size={24} color="#FFFFFF" />
          ) : (
            <Play size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={() => {}}>
          <SkipForward size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleStop}>
          <Square size={18} color="#EF4444" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={() => {}}>
          <Volume2 size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 14, 26, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 1.5,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500' as const,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dhikrTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dhikrSubtitle: {
    fontSize: 11,
    color: '#10B981',
    marginTop: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  playButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});