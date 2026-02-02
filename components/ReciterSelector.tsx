import React, { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Platform } from 'react-native';
import { Mic } from 'lucide-react-native';
import { useReciterStore } from '@/hooks/useReciterStore';
import { RECITER_NAMES, ReciterId } from '@/utils/ttsService';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTheme } from '@/theme/ThemeProvider';
import * as Haptics from 'expo-haptics';

const RECITERS: ReciterId[] = ['sudais', 'shuraim', 'alafasy', 'maher', 'husary'];

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

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
        testID="reciter-selector-modal"
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal} accessibilityRole="button">
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('selectReciter')}</Text>
            </View>

            <ScrollView style={[styles.reciterList, { backgroundColor: theme.surface }]} bounces={false}>
              {RECITERS.map((reciterId) => {
                const isSelected = currentReciter === reciterId;
                return (
                  <Pressable
                    key={reciterId}
                    style={[
                      styles.reciterItem,
                      isSelected && styles.reciterItemSelected,
                      isSelected && { backgroundColor: theme.mode === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)' },
                      { borderBottomColor: theme.border }
                    ]}
                    onPress={() => handleSelectReciter(reciterId)}
                    testID={`reciter-item-${reciterId}`}
                    accessibilityRole="button"
                    accessibilityLabel={RECITER_NAMES[reciterId]}
                  >
                    <View style={styles.reciterItemContent}>
                      <View style={styles.reciterIconContainer}>
                        <Mic size={18} color={isSelected ? (theme.mode === 'dark' ? '#A78BFA' : '#8B5CF6') : theme.textSecondary} strokeWidth={2} />
                      </View>
                      <Text style={[
                        styles.reciterName,
                        { color: isSelected ? (theme.mode === 'dark' ? '#E9D5FF' : '#7C3AED') : theme.text }
                      ]}>
                        {RECITER_NAMES[reciterId]}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.selectedIndicator, { backgroundColor: theme.mode === 'dark' ? '#A78BFA' : '#8B5CF6' }]} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              style={[styles.closeButton, { backgroundColor: theme.mode === 'dark' ? '#8B5CF6' : '#7C3AED' }]}
              onPress={closeModal}
              testID="close-modal-button"
              accessibilityRole="button"
              accessibilityLabel={t('close')}
            >
              <Text style={styles.closeButtonText}>{t('close')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  reciterList: {
    maxHeight: 400,
  },
  reciterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  reciterItemSelected: {
  },
  reciterItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reciterIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reciterName: {
    fontSize: 16,
    fontWeight: '600' as const,
    flex: 1,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  closeButton: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
