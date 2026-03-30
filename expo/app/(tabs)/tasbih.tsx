import React, { useCallback, useMemo, useState, memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert, useWindowDimensions, Modal, TextInput, FlatList, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, X, Check, Minus, RotateCcw, Volume2, VolumeX } from 'lucide-react-native';
import { useTasbihStore } from '@/hooks/useTasbihStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';

import TasbihCard from '@/components/TasbihCard';

import * as Haptics from 'expo-haptics';
import { soundService } from '@/utils/soundService';
import { ttsService } from '@/utils/ttsService';

const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';
const IVORY = '#F7F4EE';
const CARD_WHITE = '#FFFFFF';
const TEXT_MUTED = '#8A9B91';

const TasbihHeader = memo(() => {
  const { t } = useLanguageStore();

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{t('tasbih')}</Text>
      <View style={styles.headerOrnament}>
        <View style={styles.ornamentLine} />
        <View style={styles.ornamentDiamond} />
        <View style={styles.ornamentLine} />
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
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('[TasbihScreen] Screen mounted');
    soundService.initialize();

    return () => {
      soundService.unload();
    };
  }, []);

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const [newTasbih, setNewTasbih] = useState({
    arabicText: '',
    transliteration: '',
    translation: '',
    targetCount: 33,
    color: '#2D8B6F',
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

  useEffect(() => {
    if (selectedItem) {
      const progress = selectedItem.targetCount > 0
        ? Math.min(selectedItem.count / selectedItem.targetCount, 1)
        : 0;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [selectedItem?.count, selectedItem?.targetCount, progressAnim, selectedItem]);

  const triggerPulse = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(pulseAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pulseAnim]);

  const handleIncrement = useCallback(() => {
    if (selectedItem) {
      console.log(`[TasbihScreen] Increment count for: ${selectedItem.id}`);

      triggerPulse();

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
  }, [selectedItem, updateTasbihCount, settings.vibrationEnabled, settings.soundEnabled, triggerPulse]);

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

    setNewTasbih({
      arabicText: '',
      transliteration: '',
      translation: '',
      targetCount: 33,
      color: '#2D8B6F',
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

  const handleSpeak = useCallback(async () => {
    if (!selectedItem) return;
    if (isSpeaking) {
      try {
        console.log('[TasbihScreen] Stopping speech');
        await ttsService.stop();
        setIsSpeaking(false);
      } catch (error) {
        console.error('[TasbihScreen] Stop speech error:', error);
        setIsSpeaking(false);
      }
    } else {
      try {
        console.log(`[TasbihScreen] Speaking: ${selectedItem.arabicText}`);
        if (Platform.OS !== 'web') {
          try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) { console.log('Haptic error', e); }
        }
        setIsSpeaking(true);
        await ttsService.playDhikr(selectedItem.arabicText);
        setIsSpeaking(false);
      } catch (error) {
        console.error('[TasbihScreen] Speech error:', error);
        setIsSpeaking(false);
      }
    }
  }, [selectedItem, isSpeaking]);

  useEffect(() => {
    return () => {
      ttsService.stop().catch(() => {});
    };
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowAddModal(false);
    setNewTasbih({
      arabicText: '',
      transliteration: '',
      translation: '',
      targetCount: 33,
      color: '#2D8B6F',
      category: 'custom'
    });
  }, []);

  const predefinedColors = ['#2D8B6F', '#3B7DD8', '#8B5CF6', '#D4A853', '#E05252', '#D4708F', '#0EA5C9', '#65A30D'];

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={GOLD} />
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

  const progressPercent = selectedItem.targetCount > 0
    ? Math.min((selectedItem.count / selectedItem.targetCount) * 100, 100)
    : 0;

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
              <View style={styles.addCardInner}>
                <Plus size={18} color={GOLD} />
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
          <TouchableOpacity
            style={[styles.speakDhikrButton, isSpeaking && styles.speakDhikrButtonActive]}
            onPress={handleSpeak}
            activeOpacity={0.7}
            testID="tasbih-speak-button"
          >
            {isSpeaking ? (
              <VolumeX size={16} color="#FFFFFF" />
            ) : (
              <Volume2 size={16} color={DEEP_GREEN} />
            )}
            <Text style={[styles.speakDhikrText, isSpeaking && styles.speakDhikrTextActive]}>
              {isSpeaking ? t('stopListening') : t('listenToDhikr')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.counterSection}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={styles.mainCounterButton}
              onPress={handleIncrement}
              activeOpacity={0.9}
              testID="increment-button"
            >
              <View style={[styles.counterRing, { borderColor: selectedItem.color + '40' }]}>
                <View style={[styles.counterInner, { backgroundColor: selectedItem.color }]}>
                  <Text style={styles.counterNumber}>{selectedItem.count}</Text>
                  <View style={styles.counterDivider} />
                  <Text style={styles.counterTarget}>{selectedItem.targetCount}</Text>
                </View>
              </View>

              <View style={styles.counterProgressRing}>
                <View style={styles.progressTrackCircle}>
                  <View
                    style={[
                      styles.progressFillBar,
                      { width: `${progressPercent}%`, backgroundColor: selectedItem.color }
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.tapHint}>{t('tapToCount')}</Text>

              {selectedItem.isCompleted && (
                <View style={[styles.completedBadge, { backgroundColor: selectedItem.color }]}>
                  <Check size={14} color="#FFFFFF" />
                  <Text style={styles.completedText}>{t('completed')}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.controlButtonsRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleDecrement}
              activeOpacity={0.7}
              testID="decrement-button"
            >
              <View style={styles.controlButtonInner}>
                <Minus size={20} color="#E05252" />
              </View>
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
              style={styles.controlButton}
              onPress={handleReset}
              activeOpacity={0.7}
              testID="reset-button"
            >
              <View style={styles.controlButtonInner}>
                <RotateCcw size={20} color={GOLD} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ height: 100 }} />

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCloseModal} style={styles.modalCloseButton}>
                <X size={22} color={TEXT_MUTED} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t('addNewTasbih')}</Text>
              <TouchableOpacity onPress={handleSaveNewTasbih} style={styles.modalSaveButton}>
                <Check size={22} color={CARD_WHITE} />
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
                  placeholderTextColor={TEXT_MUTED}
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
                  placeholderTextColor={TEXT_MUTED}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('translation')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTasbih.translation}
                  onChangeText={(text) => setNewTasbih(prev => ({ ...prev, translation: text }))}
                  placeholder={t('translationPlaceholder')}
                  placeholderTextColor={TEXT_MUTED}
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
                  placeholderTextColor={TEXT_MUTED}
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
              <View style={{ height: 40 }} />
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
    backgroundColor: IVORY,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 15,
    color: TEXT_MUTED,
    marginTop: 12,
    fontWeight: '500' as const,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: DEEP_GREEN,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 18,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: CARD_WHITE,
    textAlign: 'center',
    writingDirection: 'rtl',
    letterSpacing: 1,
  },
  headerOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  ornamentLine: {
    width: 32,
    height: 1,
    backgroundColor: GOLD,
    opacity: 0.6,
  },
  ornamentDiamond: {
    width: 6,
    height: 6,
    backgroundColor: GOLD,
    transform: [{ rotate: '45deg' }],
  },
  headerSection: {
    backgroundColor: DEEP_GREEN,
    paddingTop: 0,
    paddingBottom: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  cardsScrollView: {
    maxHeight: 82,
  },
  cardsContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addCard: {
    marginHorizontal: 6,
  },
  addCardInner: {
    minWidth: 70,
    width: 70,
    height: 68,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: GOLD + '50',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(212,168,83,0.08)',
  },
  addCardText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: GOLD,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    overflow: 'hidden',
  },
  dhikrDisplay: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: CARD_WHITE,
    borderRadius: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(212,168,83,0.12)',
  },
  mainArabicText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: DEEP_GREEN,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 34,
    paddingHorizontal: 8,
    alignSelf: 'stretch',
    writingDirection: 'rtl',
  },
  transliterationText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: DEEP_GREEN,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  translationText: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
  },
  counterSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 24,
  },
  mainCounterButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterRing: {
    width: 192,
    height: 192,
    borderRadius: 96,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD_WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  counterInner: {
    width: 168,
    height: 168,
    borderRadius: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterNumber: {
    fontSize: 52,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  counterDivider: {
    width: 36,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginVertical: 4,
  },
  counterTarget: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.8)',
  },
  counterProgressRing: {
    width: 200,
    marginTop: 12,
  },
  progressTrackCircle: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFillBar: {
    height: '100%',
    borderRadius: 2,
  },
  tapHint: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: TEXT_MUTED,
    marginTop: 10,
  },
  completedBadge: {
    position: 'absolute' as const,
    bottom: -14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
    gap: 14,
    width: '100%',
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: CARD_WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  statsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    gap: 20,
    backgroundColor: CARD_WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    marginBottom: 2,
    color: TEXT_MUTED,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: DEEP_GREEN,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: IVORY,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD_WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DEEP_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: DEEP_GREEN,
    textAlign: 'center',
  },
  modalForm: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: DEEP_GREEN,
    marginBottom: 8,
    textAlign: 'right',
  },
  textInput: {
    backgroundColor: CARD_WHITE,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: DEEP_GREEN,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    minHeight: 48,
  },
  numberInput: {
    backgroundColor: CARD_WHITE,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: DEEP_GREEN,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
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
    borderColor: DEEP_GREEN,
    borderWidth: 3,
  },
  speakDhikrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'rgba(27,67,50,0.08)',
    marginTop: 12,
  },
  speakDhikrButtonActive: {
    backgroundColor: DEEP_GREEN,
  },
  speakDhikrText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: DEEP_GREEN,
  },
  speakDhikrTextActive: {
    color: '#FFFFFF',
  },
});
