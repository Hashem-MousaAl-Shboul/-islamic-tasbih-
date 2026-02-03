import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { Mic, X } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { RECITER_NAMES, ReciterId } from '@/utils/ttsService';
import { useLanguageStore } from '@/hooks/useLanguageStore';

const RECITERS: ReciterId[] = ['sudais', 'shuraim', 'alafasy', 'maher', 'husary'];

interface ReciterPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (reciterId: ReciterId) => void;
  currentReciter: ReciterId;
}

export const ReciterPicker = memo<ReciterPickerProps>(({
  visible,
  onClose,
  onSelect,
  currentReciter
}) => {
  const theme = useTheme();
  const { t } = useLanguageStore();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID="reciter-picker-modal"
    >
      <Pressable style={styles.modalOverlay} onPress={onClose} accessibilityRole="button">
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]} onStartShouldSetResponder={() => true}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('selectReciter')}</Text>
            <Pressable onPress={onClose} style={styles.closeIcon}>
              <X size={24} color={theme.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.reciterList} bounces={false}>
            {RECITERS.map((reciterId) => {
              const isSelected = currentReciter === reciterId;
              return (
                <Pressable
                  key={reciterId}
                  style={[
                    styles.reciterItem,
                    isSelected && { backgroundColor: theme.mode === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)' },
                    { borderBottomColor: theme.border }
                  ]}
                  onPress={() => onSelect(reciterId)}
                  testID={`reciter-item-${reciterId}`}
                  accessibilityRole="button"
                  accessibilityLabel={RECITER_NAMES[reciterId]}
                >
                  <View style={styles.reciterItemContent}>
                    <View style={[styles.reciterIconContainer, { backgroundColor: theme.mode === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)' }]}>
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
        </View>
      </Pressable>
    </Modal>
  );
});

ReciterPicker.displayName = 'ReciterPicker';

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderBottomWidth: 1,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  closeIcon: {
    position: 'absolute',
    right: 20,
    top: 20,
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
});
