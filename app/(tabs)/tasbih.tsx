import React, { useCallback, useMemo, useState, memo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert, useWindowDimensions, Modal, TextInput, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, X, Check, Minus, RotateCcw } from 'lucide-react-native';
import { useTasbihStore } from '@/hooks/useTasbihStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';

import TasbihCard from '@/components/TasbihCard';

import * as Haptics from 'expo-haptics';
import { soundService } from '@/utils/soundService';

// Memoized header component for better performance
const TasbihHeader = memo(() => {
  const { t } = useLanguageStore();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>{t('tasbih')}</Text>
      </View>
    </View>
  );
});

TasbihHeader.displayName = 'TasbihHeader';


export default function TasbihScreen() {
  const { t } = useLanguageStore();
  const insets = useSafeAreaInsets();
  useWindowDimensions();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  useEffect(() => {
    console.log('[TasbihScreen] Screen mounted');
    soundService.initialize();

    return () => {
      soundService.unload();
    };
  }, []);
  const [newTasbih, setNewTasbih] = useState({
    arabicText: '',
    transliteration: '',
    translation: '',
    targetCount: 33,
    color: '#10B981',
    category: 'custom' as const
  });
  const {
    tasbihItems,
    settings,
    stats,
    selectedItemId,
    isLoading,
    updateTasbihCount,
    resetTasbih,

    setSelectedItem,
    getSelectedItem,

    addCustomTasbih,
    deleteTasbih,
    restoreTasbih,

  } = useTasbihStore();

  const selectedItem = useMemo(() => getSelectedItem(), [getSelectedItem]);

  

  const handleIncrement = useCallback(() => {
    if (selectedItem) {
      console.log(`[TasbihScreen] Increment count for: ${selectedItem.id}`);
      
      if (settings.vibrationEnabled && Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(e => console.log('Haptic error', e));
      }

      if (settings.soundEnabled) {
        soundService.playClick();
      }

      const willComplete = selectedItem.count + 1 >= selectedItem.targetCount;
      
      updateTasbihCount(selectedItem.id, true);
      
      if (willComplete && !selectedItem.isCompleted) {
        if (settings.soundEnabled) {
          soundService.playCompletion();
        }
        if (settings.vibrationEnabled && Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(e => console.log('Haptic error', e));
        }
      }
    }
  }, [selectedItem, updateTasbihCount, settings.vibrationEnabled, settings.soundEnabled]);

  const handleDecrement = useCallback(() => {
    if (selectedItem && selectedItem.count > 0) {
      console.log(`[TasbihScreen] Decrement count for: ${selectedItem.id}`);
      
      if (settings.vibrationEnabled && Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(e => console.log('Haptic error', e));
      }

      if (settings.soundEnabled) {
        soundService.playClick();
      }

      updateTasbihCount(selectedItem.id, false);
    }
  }, [selectedItem, updateTasbihCount, settings.vibrationEnabled, settings.soundEnabled]);

  const handleReset = useCallback(() => {
    if (selectedItem) {
      console.log(`[TasbihScreen] Reset counter for: ${selectedItem.id}`);
      if (Platform.OS === 'web') {
        const confirmed = confirm(t('resetCounterConfirm', { dhikr: selectedItem.arabicText }));
        if (confirmed) {
          resetTasbih(selectedItem.id);
        }
      } else {
        Alert.alert(
          t('resetCounter'),
          t('resetCounterConfirm', { dhikr: selectedItem.arabicText }),
          [
            { text: t('cancel'), style: 'cancel' },
            { 
              text: t('reset'), 
              style: 'destructive',
              onPress: () => resetTasbih(selectedItem.id)
            }
          ]
        );
      }
    }
  }, [selectedItem, resetTasbih, t]);





  const handleSelectItem = useCallback(async (itemId: string) => {
    console.log(`[TasbihScreen] Selected item: ${itemId}`);
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      try {
        await Haptics.selectionAsync();
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
    setSelectedItem(itemId);
  }, [setSelectedItem, settings.hapticFeedback]);

  const handleDeleteTasbih = useCallback((itemId: string) => {
    console.log(`[TasbihScreen] Delete tasbih: ${itemId}`);
    deleteTasbih(itemId);
    
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
  }, [deleteTasbih, settings.hapticFeedback]);

  const handleRestoreTasbih = useCallback((itemId: string) => {
    console.log(`[TasbihScreen] Restore tasbih: ${itemId}`);
    restoreTasbih(itemId);
    
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
  }, [restoreTasbih, settings.hapticFeedback]);



  const handleAddTasbih = useCallback(() => {
    console.log('[TasbihScreen] Add new tasbih clicked');
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
    setShowAddModal(true);
  }, [settings.hapticFeedback]);

  const handleSaveNewTasbih = useCallback(() => {
    if (!newTasbih.arabicText.trim()) {
      Alert.alert(t('error'), t('pleaseEnterArabicText'));
      return;
    }
    
    console.log('[TasbihScreen] Saving new custom tasbih');
    
    addCustomTasbih({
      arabicText: newTasbih.arabicText.trim(),
      transliteration: newTasbih.transliteration.trim() || newTasbih.arabicText.trim(),
      translation: newTasbih.translation.trim() || newTasbih.arabicText.trim(),
      targetCount: Math.max(1, newTasbih.targetCount),
      color: newTasbih.color,
      category: newTasbih.category
    });
    
    // Reset form
    setNewTasbih({
      arabicText: '',
      transliteration: '',
      translation: '',
      targetCount: 33,
      color: '#10B981',
      category: 'custom'
    });
    
    setShowAddModal(false);
    
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
  }, [newTasbih, addCustomTasbih, settings.hapticFeedback, t]);

  const handleCloseModal = useCallback(() => {
    setShowAddModal(false);
    // Reset form when closing
    setNewTasbih({
      arabicText: '',
      transliteration: '',
      translation: '',
      targetCount: 33,
      color: '#10B981',
      category: 'custom'
    });
  }, []);

  const predefinedColors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#1a5c4c" />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  if (!selectedItem) {
    return (
      <View style={[styles.container, styles.errorContainer, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{t('noTasbihAvailable')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerSection}>
        <TasbihHeader />
        
        <FlatList
          horizontal
          data={tasbihItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TasbihCard
              item={item}
              isSelected={item.id === selectedItemId}
              onSelect={handleSelectItem}
              showTransliteration={settings.showTransliteration}
              onDelete={handleDeleteTasbih}
              onRestore={handleRestoreTasbih}
              isDeleted={item.isDeleted}
            />
          )}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.addCard}
              testID="add-tasbih-button"
              activeOpacity={0.7}
              onPress={handleAddTasbih}
            >
              <View style={styles.addCardGradient}>
                <Plus size={20} color="#1a5c4c" />
                <Text style={styles.addCardText}>{t('add')}</Text>
              </View>
            </TouchableOpacity>
          }
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
          style={styles.cardsScrollView}
          testID="tasbih-cards-scroll"
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={5}
          getItemLayout={(data, index) => ({
            length: 96,
            offset: 96 * index,
            index,
          })}
        />
      </View>

      <View style={[styles.mainContent, { paddingBottom: Platform.OS === 'android' ? 100 : 90 }]}>
        <View style={styles.dhikrDisplay}>
          <Text style={styles.mainArabicText}>{selectedItem.arabicText}</Text>
          {settings.showTransliteration && (
            <Text style={styles.transliterationText}>{selectedItem.transliteration}</Text>
          )}
          {settings.showTranslation && (
            <Text style={styles.translationText}>{selectedItem.translation}</Text>
          )}
        </View>

        <View style={styles.counterSection}>
          <TouchableOpacity
            style={[styles.mainCounterButton, { backgroundColor: selectedItem.color }]}
            onPress={handleIncrement}
            activeOpacity={0.8}
            testID="increment-button"
          >
            <View style={styles.counterDisplay}>
              <Text style={styles.counterNumber}>{selectedItem.count}</Text>
              <View style={styles.counterDivider} />
              <Text style={styles.counterTarget}>{selectedItem.targetCount}</Text>
            </View>
            
            <View style={styles.counterProgressBar}>
              <View 
                style={[
                  styles.counterProgressFill,
                  { width: `${Math.min((selectedItem.count / selectedItem.targetCount) * 100, 100)}%` }
                ]} 
              />
            </View>
            
            <Text style={styles.tapHint}>{t('tapToCount')}</Text>
            
            {selectedItem.isCompleted && (
              <View style={styles.completedBadge}>
                <Check size={16} color="#FFFFFF" />
                <Text style={styles.completedText}>{t('completed')}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.controlButtonsRow}>
            <TouchableOpacity
              style={[styles.controlButton, styles.decrementBtn]}
              onPress={handleDecrement}
              activeOpacity={0.7}
              testID="decrement-button"
            >
              <Minus size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.statsDisplay}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t('today')}</Text>
                <Text style={styles.statValue}>{stats.todayCount}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{t('total')}</Text>
                <Text style={styles.statValue}>{stats.totalCount}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.controlButton, styles.resetBtn]}
              onPress={handleReset}
              activeOpacity={0.7}
              testID="reset-button"
            >
              <RotateCcw size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={showAddModal}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCloseModal} style={styles.modalCloseButton}>
                <X size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t('addNewTasbih')}</Text>
              <TouchableOpacity onPress={handleSaveNewTasbih} style={styles.modalSaveButton}>
                <Check size={24} color="#1a5c4c" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('arabicText')} *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTasbih.arabicText}
                  onChangeText={(text) => setNewTasbih(prev => ({ ...prev, arabicText: text }))}
                  placeholder={t('arabicTextPlaceholder')}
                  placeholderTextColor="#999"
                  multiline
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('transliteration')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTasbih.transliteration}
                  onChangeText={(text) => setNewTasbih(prev => ({ ...prev, transliteration: text }))}
                  placeholder={t('transliterationPlaceholder')}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('translation')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTasbih.translation}
                  onChangeText={(text) => setNewTasbih(prev => ({ ...prev, translation: text }))}
                  placeholder={t('translationPlaceholder')}
                  placeholderTextColor="#999"
                  multiline
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('targetCount')}</Text>
                <TextInput
                  style={styles.numberInput}
                  value={newTasbih.targetCount.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 1;
                    setNewTasbih(prev => ({ ...prev, targetCount: Math.max(1, num) }));
                  }}
                  placeholder="33"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('color')}</Text>
                <View style={styles.colorPicker}>
                  {predefinedColors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        newTasbih.color === color && styles.selectedColor
                      ]}
                      onPress={() => setNewTasbih(prev => ({ ...prev, color }))}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '500' as const,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#1a5c4c',
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#fff',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  headerSection: {
    backgroundColor: '#1a5c4c',
    paddingTop: 0,
    paddingBottom: 8,
  },
  cardsScrollView: {
    maxHeight: 80,
  },
  cardsContainer: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  addCard: {
    marginHorizontal: 6,
  },
  addCardGradient: {
    minWidth: 70,
    width: 70,
    height: 65,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  addCardText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },

  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    overflow: 'hidden',
  },
  dhikrDisplay: {
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#d4ede5',
    borderRadius: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    alignSelf: 'stretch',
  },
  mainArabicText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1a5c4c',
    textAlign: 'center',
    marginBottom: 2,
    lineHeight: 28,
    paddingHorizontal: 8,
    alignSelf: 'stretch',
    writingDirection: 'rtl',
  },
  transliterationText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#1a5c4c',
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 20,
  },
  translationText: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: '#1a5c4c',
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },

  counterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },

  counterWithButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  counterWithReset: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  undoButtonLeft: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  undoButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  resetButtonRight: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  resetButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    minWidth: 80,
  },
  decrementButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resetButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  actionButtonText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  resetButtonText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#F59E0B',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e8e5',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d4ede5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1a5c4c',
    textAlign: 'center',
  },
  modalForm: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1a5c4c',
    marginBottom: 8,
    textAlign: 'right',
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a5c4c',
    borderWidth: 1,
    borderColor: '#e0e8e5',
    minHeight: 48,
  },
  numberInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a5c4c',
    borderWidth: 1,
    borderColor: '#e0e8e5',
    textAlign: 'center',
    width: 100,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#1a5c4c',
    borderWidth: 3,
  },
  completionModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionModalBackdrop: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  completionModalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  completionModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  completionModalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#10B981',
    textAlign: 'center',
    flex: 1,
  },
  closeCompletionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: -10,
    top: -10,
  },
  completionAdContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  counterSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  mainCounterButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  counterDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterNumber: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  counterDivider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginVertical: 4,
  },
  counterTarget: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  counterProgressBar: {
    width: 100,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  counterProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  tapHint: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  completedBadge: {
    position: 'absolute' as const,
    bottom: -10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  controlButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  decrementBtn: {
    backgroundColor: '#EF4444',
  },
  resetBtn: {
    backgroundColor: '#F5A623',
  },
  statsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 16,
    backgroundColor: '#d4ede5',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
    marginBottom: 2,
    color: '#1a5c4c',
    opacity: 0.7,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1a5c4c',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(26, 92, 76, 0.15)',
  },
});