import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Play, Pause, Square, Volume2, RotateCcw } from 'lucide-react-native';
import { getQuranRecitationUrl, getAvailableReciters, type ReciterId, RECITER_NAMES } from '@/utils/ttsService';
import { stopAudio as stopYasAI } from '@/utils/yasAI';

interface QuranAudioPlayerProps {
  surahNumber: number;
  surahName: string;
  selectedReciter?: ReciterId;
  onReciterChange?: (reciter: ReciterId) => void;
}

export default function QuranAudioPlayer({ 
  surahNumber, 
  surahName, 
  selectedReciter = 'alafasy',
  onReciterChange 
}: QuranAudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentReciter, setCurrentReciter] = useState<ReciterId>(selectedReciter);
  const [showReciters, setShowReciters] = useState<boolean>(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const lastStatusUpdateRef = useRef<number>(0);

  console.log('[QuranAudioPlayer] Rendered with surah:', surahNumber, 'reciter:', currentReciter);

  useEffect(() => {
    return () => {
      console.log('[QuranAudioPlayer] Cleanup - unloading sound');
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(e => 
          console.log('[QuranAudioPlayer] Cleanup error:', e)
        );
      }
    };
  }, []);

  useEffect(() => {
    if (sound !== soundRef.current) {
      soundRef.current = sound;
    }
  }, [sound]);

  const setupAudio = async () => {
    try {
      console.log('[QuranAudioPlayer] Setting up audio mode');
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      }
    } catch (error) {
      console.error('[QuranAudioPlayer] Audio setup error:', error);
    }
  };

  const loadAudio = async (reciter: ReciterId) => {
    try {
      setIsLoading(true);
      console.log('[QuranAudioPlayer] Loading audio for surah', surahNumber, 'with reciter', reciter);
      
      // Ensure YasAI audio is stopped before loading
      try { await stopYasAI(); } catch {}
      
      if (sound) {
        console.log('[QuranAudioPlayer] Unloading previous sound');
        await sound.unloadAsync();
        setSound(null);
      }

      const audioUrl = getQuranRecitationUrl(surahNumber, reciter);
      if (!audioUrl) {
        throw new Error('لا يوجد رابط صوتي لهذه السورة');
      }

      console.log('[QuranAudioPlayer] Loading from URL:', audioUrl);
      await setupAudio();
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { 
          shouldPlay: false,
          isLooping: false,
          volume: 1.0,
        },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      console.log('[QuranAudioPlayer] Audio loaded successfully');
    } catch (error) {
      console.error('[QuranAudioPlayer] Load error:', error);
      Alert.alert('خطأ', 'فشل في تحميل التلاوة. تأكد من الاتصال بالإنترنت.');
    } finally {
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    const now = Date.now();
    if (!status?.isLoaded) return;

    if (now - (lastStatusUpdateRef.current ?? 0) < 200) {
      return;
    }
    lastStatusUpdateRef.current = now;

    const nextIsPlaying = Boolean(status.isPlaying);
    const nextPos = Number(status.positionMillis ?? 0);
    const nextDur = Number(status.durationMillis ?? 0);

    setIsPlaying(prev => (prev !== nextIsPlaying ? nextIsPlaying : prev));
    setPosition(prev => (prev !== nextPos ? nextPos : prev));
    setDuration(prev => (prev !== nextDur ? nextDur : prev));

    if (status.didJustFinish) {
      console.log('[QuranAudioPlayer] Playback finished');
      setIsPlaying(false);
      setPosition(0);
    }
  };

  const handlePlay = async () => {
    try {
      // Stop any other app audio to avoid conflicts
      try { await stopYasAI(); } catch {}

      if (!sound) {
        await loadAudio(currentReciter);
        return;
      }

      if (isPlaying) {
        console.log('[QuranAudioPlayer] Pausing');
        await sound.pauseAsync();
      } else {
        console.log('[QuranAudioPlayer] Playing');
        await sound.playAsync();
      }
    } catch (error) {
      console.error('[QuranAudioPlayer] Play error:', error);
      Alert.alert('خطأ', 'فشل في تشغيل التلاوة');
    }
  };

  const handleStop = async () => {
    try {
      if (sound) {
        console.log('[QuranAudioPlayer] Stopping');
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        setPosition(0);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('[QuranAudioPlayer] Stop error:', error);
    }
  };

  const handleReciterChange = async (reciter: ReciterId) => {
    try {
      console.log('[QuranAudioPlayer] Changing reciter to:', reciter);
      setCurrentReciter(reciter);
      setShowReciters(false);
      onReciterChange?.(reciter);
      
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      
      setPosition(0);
      setDuration(0);
      setIsPlaying(false);
    } catch (error) {
      console.error('[QuranAudioPlayer] Reciter change error:', error);
    }
  };

  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = useMemo(() => (duration > 0 ? (position / duration) * 100 : 0), [position, duration]);
  const reciters = getAvailableReciters();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>تلاوة سورة {surahName}</Text>
        <TouchableOpacity 
          style={styles.reciterButton}
          onPress={() => setShowReciters(!showReciters)}
        >
          <Volume2 size={16} color="#10B981" />
          <Text style={styles.reciterText}>{RECITER_NAMES[currentReciter]}</Text>
        </TouchableOpacity>
      </View>

      {showReciters && (
        <View style={styles.recitersContainer}>
          {reciters.map((reciter) => (
            <TouchableOpacity
              key={reciter.id}
              style={[
                styles.reciterOption,
                currentReciter === reciter.id && styles.reciterOptionActive
              ]}
              onPress={() => handleReciterChange(reciter.id)}
            >
              <Text style={[
                styles.reciterOptionText,
                currentReciter === reciter.id && styles.reciterOptionTextActive
              ]}>
                {reciter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleStop}
          disabled={!sound}
        >
          <Square size={20} color={!sound ? '#666' : '#FFFFFF'} fill={!sound ? '#666' : '#FFFFFF'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, isLoading && styles.playButtonDisabled]}
          onPress={handlePlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.loadingText}>...</Text>
          ) : isPlaying ? (
            <Pause size={24} color="#FFFFFF" fill="#FFFFFF" />
          ) : (
            <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => loadAudio(currentReciter)}
          disabled={isLoading}
        >
          <RotateCcw size={20} color={isLoading ? '#666' : '#FFFFFF'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
    flex: 1,
  },
  reciterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  reciterText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  recitersContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    gap: 4,
  },
  reciterOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reciterOptionActive: {
    backgroundColor: '#10B981',
  },
  reciterOptionText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  reciterOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonDisabled: {
    backgroundColor: '#666',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});