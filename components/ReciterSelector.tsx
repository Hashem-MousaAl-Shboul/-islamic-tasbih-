import React, { useState, useCallback, memo } from 'react';
import { Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Mic } from 'lucide-react-native';
import { useReciterStore } from '@/hooks/useReciterStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTheme } from '@/theme/ThemeProvider';
import * as Haptics from 'expo-haptics';
import { ReciterPicker } from './ReciterPicker';
import { ReciterId } from '@/utils/ttsService';

interface ReciterSelectorProps {
  style?: any;
}

export const ReciterSelector = memo<ReciterSelectorProps>(({ style }) => {
  const { currentReciter, changeReciter, getCurrentReciterName } = useReciterStore();
  const { t } = useLanguageStore();
  const theme = useTheme();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const openModal = useCallback(() => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
    setIsModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
    setIsModalVisible(false);
  }, []);

  const handleSelectReciter = useCallback((reciterId: ReciterId) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
    changeReciter(reciterId);
    setIsModalVisible(false);
  }, [changeReciter]);

  return (
    <>
      <Pressable
        style={[styles.button, style, { backgroundColor: theme.mode === 'dark' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.12)' }]}
        onPress={openModal}
        testID="reciter-selector-button"
        accessibilityRole="button"
        accessibilityLabel={t('selectReciter')}
      >
        <Mic size={14} color={theme.mode === 'dark' ? '#A78BFA' : '#8B5CF6'} strokeWidth={2} />
        <Text style={[styles.buttonText, { color: theme.mode === 'dark' ? '#E9D5FF' : '#7C3AED' }]} numberOfLines={1}>
          {getCurrentReciterName()}
        </Text>
      </Pressable>

      <ReciterPicker
        visible={isModalVisible}
        onClose={closeModal}
        onSelect={handleSelectReciter}
        currentReciter={currentReciter}
      />
    </>
  );
});

ReciterSelector.displayName = 'ReciterSelector';

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  buttonText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
});
