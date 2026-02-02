import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Square } from 'lucide-react-native';
import { useTTS } from '@/hooks/useTTS';

interface TTSStatusBarProps {
  visible: boolean;
}

export function TTSStatusBar({ visible }: TTSStatusBarProps) {
  const {
    isPlaying,
    isLoading,
    currentText,
    currentReciter,
    isQueueProcessing,
    queueLength,
    stop,
  } = useTTS();

  if (!visible || (!isPlaying && !isLoading && !isQueueProcessing)) {
    return null;
  }

  const handleStop = async () => {
    try {
      await stop();
    } catch (error) {
      console.error('[TTSStatusBar] Stop error:', error);
    }
  };

  const getStatusText = () => {
    if (isQueueProcessing && queueLength > 0) {
      return `تشغيل الأذكار (${queueLength} متبقية)`;
    }
    if (isPlaying && currentText) {
      return currentText.substring(0, 50) + '...';
    }
    if (isLoading) {
      return 'جارٍ التحميل...';
    }
    return 'تشغيل الذكر';
  };

  const getReciterLabel = (reciter: string) => {
    switch (reciter) {
      case 'sudais': return 'السديس';
      case 'shuraim': return 'الشريم';
      case 'alafasy': return 'العفاسي';
      default: return reciter;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.statusText} numberOfLines={1}>
            {getStatusText()}
          </Text>
          <Text style={styles.reciterText}>
            القارئ: {getReciterLabel(currentReciter)}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={handleStop}
          style={styles.stopButton}
          testID="tts-stop-button"
        >
          {isLoading ? (
            <ActivityIndicator size={16} color="#FFFFFF" />
          ) : (
            <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
      
      {/* شريط التقدم البصري */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, isPlaying && styles.progressBarActive]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // فوق شريط التبويب
    left: 12,
    right: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'right',
    marginBottom: 2,
  },
  reciterText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500' as const,
    textAlign: 'right',
  },
  stopButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    marginTop: 8,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    width: '0%',
  },
  progressBarActive: {
    width: '100%',
  },
});