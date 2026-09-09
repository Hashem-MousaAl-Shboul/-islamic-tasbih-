import React, { useCallback, useMemo, useState, memo, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable,
  ActivityIndicator, Platform, Alert, useWindowDimensions,
  Modal, TextInput, FlatList, Animated, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Plus, X, Check, Minus, RotateCcw, Lock,
  Moon, TrendingUp, ChevronLeft
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTasbihStore } from '@/hooks/useTasbihStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import TasbihCard from '@/components/TasbihCard';
import BeadRingCounter from '@/components/BeadRingCounter';
import AdBanner from '@/components/AdBanner';
import UnifiedHeader from '@/components/UnifiedHeader';
import { ThemedBackground } from '@/components/ThemedBackground';
import * as Haptics from 'expo-haptics';
import { soundService } from '@/utils/soundService';
import { ttsService } from '@/utils/ttsService';
import { androidTextFix, androidRipple } from '@/utils/androidOptimizations';

const { width: _SCREEN_WIDTH } = Dimensions.get('window');
const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';
const IVORY = '#F7F4EE';
const CARD_WHITE = '#FFFFFF';
const TEXT_MUTED = '#8A9B91';
const TASBIH_TAG = '[TasbihScreen]';


export default function TasbihScreen() {
  const { t } = useLanguageStore();
  const insets = useSafeAreaInsets();
  const windowDimensions = useWindowDimensions();
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);


  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [newTasbih, setNewTasbih] = useState({
    arabicText: '',
    transliteration: '',
    translation: '',
    targetCount: 33,
    color: '#2D8B6F',
    category: 'custom' as const,
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
    console.log(TASBIH_TAG, 'Screen mounted, dimensions:', windowDimensions.width, 'x', windowDimensions.height);
    void soundService.initialize();
    return () => {
      console.log(TASBIH_TAG, 'Screen unmounting, cleaning up sound service');
      void soundService.unload();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => { void ttsService.stop().catch(() => {}); };
  }, []);

  useEffect(() => {
    if (!selectedItem) return;
    const p = selectedItem.targetCount > 0 ? Math.min(selectedItem.count / selectedItem.targetCount, 1) : 0;
    Animated.timing(progressAnim, { toValue: p, duration: 300, useNativeDriver: false }).start();
  }, [selectedItem?.count, selectedItem?.targetCount, progressAnim, selectedItem]);

  const triggerPulse = useCallback(() => {
    pulseAnim.setValue(0.94);
    Animated.spring(pulseAnim, { toValue: 1, tension: 400, friction: 10, useNativeDriver: true }).start();
  }, [pulseAnim]);

  const handleIncrement = useCallback(() => {
    if (!selectedItem) return;

    updateTasbihCount(selectedItem.id, true);
    triggerPulse();

    if (settings.vibrationEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (settings.soundEnabled) {
      soundService.playClickSync();
    }

    const willComplete = selectedItem.count + 1 >= selectedItem.targetCount;
    if (willComplete && !selectedItem.isCompleted) {
      console.log(TASBIH_TAG, 'Tasbih completed for:', selectedItem.arabicText);
      if (settings.soundEnabled) soundService.playCompletionSync();
      if (settings.vibrationEnabled && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    }
  }, [selectedItem, updateTasbihCount, settings.vibrationEnabled, settings.soundEnabled, triggerPulse]);

  const handleDecrement = useCallback(() => {
    if (!selectedItem || selectedItem.count <= 0) return;
    updateTasbihCount(selectedItem.id, false);
    if (settings.vibrationEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (settings.soundEnabled) soundService.playClickSync();
  }, [selectedItem, updateTasbihCount, settings.vibrationEnabled, settings.soundEnabled]);

  const handleReset = useCallback(() => {
    if (!selectedItem) return;
    console.log(TASBIH_TAG, 'Reset requested for:', selectedItem.arabicText);
    if (Platform.OS === 'web') {
      if (confirm(t('resetCounterConfirm', { dhikr: selectedItem.arabicText }))) resetTasbih(selectedItem.id);
    } else {
      Alert.alert(t('resetCounter'), t('resetCounterConfirm', { dhikr: selectedItem.arabicText }), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('reset'), style: 'destructive', onPress: () => resetTasbih(selectedItem.id) },
      ]);
    }
  }, [selectedItem, resetTasbih, t]);

  const handleSelectItem = useCallback(async (itemId: string) => {
    console.log(TASBIH_TAG, 'Selecting tasbih item:', itemId);
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      try { await Haptics.selectionAsync(); } catch (e) { console.log(TASBIH_TAG, 'Haptics error:', e); }
    }
    setSelectedItem(itemId);
  }, [setSelectedItem, settings.hapticFeedback]);

  const handleDeleteTasbih = useCallback((itemId: string) => {
    console.log(TASBIH_TAG, 'Deleting tasbih:', itemId);
    deleteTasbih(itemId);
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      try { void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) { console.log(TASBIH_TAG, 'Haptics error:', e); }
    }
  }, [deleteTasbih, settings.hapticFeedback]);

  const handleRestoreTasbih = useCallback((itemId: string) => {
    console.log(TASBIH_TAG, 'Restoring tasbih:', itemId);
    restoreTasbih(itemId);
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      try { void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) { console.log(TASBIH_TAG, 'Haptics error:', e); }
    }
  }, [restoreTasbih, settings.hapticFeedback]);

  const handleAddTasbih = useCallback(() => {
    console.log(TASBIH_TAG, 'Opening add tasbih modal');
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      try { void Haptics.selectionAsync(); } catch (e) { console.log(TASBIH_TAG, 'Haptics error:', e); }
    }
    setShowAddModal(true);
  }, [settings.hapticFeedback]);

  const handleSaveNewTasbih = useCallback(() => {
    if (!newTasbih.arabicText.trim()) {
      Alert.alert(t('error'), t('pleaseEnterArabicText'));
      return;
    }
    console.log(TASBIH_TAG, 'Saving new tasbih:', newTasbih.arabicText);
    addCustomTasbih({
      arabicText: newTasbih.arabicText.trim(),
      transliteration: newTasbih.transliteration.trim() || newTasbih.arabicText.trim(),
      translation: newTasbih.translation.trim() || newTasbih.arabicText.trim(),
      targetCount: Math.max(1, newTasbih.targetCount),
      color: newTasbih.color,
      category: newTasbih.category,
    });
    setNewTasbih({ arabicText: '', transliteration: '', translation: '', targetCount: 33, color: '#2D8B6F', category: 'custom' });
    setShowAddModal(false);
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      try { void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) { console.log(TASBIH_TAG, 'Haptics error:', e); }
    }
  }, [newTasbih, addCustomTasbih, settings.hapticFeedback, t]);

  const handleCloseModal = useCallback(() => {
    console.log(TASBIH_TAG, 'Closing add modal');
    setShowAddModal(false);
    setNewTasbih({ arabicText: '', transliteration: '', translation: '', targetCount: 33, color: '#2D8B6F', category: 'custom' });
  }, []);

  const handleLockedSpeak = useCallback(() => {
    Alert.alert(t('comingSoon'), t('featureComingSoon'));
  }, [t]);

  const predefinedColors = useMemo(() => ['#2D8B6F', '#3B7DD8', '#8B5CF6', '#D4A853', '#E05252', '#D4708F', '#0EA5C9', '#65A30D'], []);
  const counterSize = Math.max(184, Math.min(220, windowDimensions.width - 96, windowDimensions.height * 0.28));

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]} testID="tasbih-loading">
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={[styles.loadingText, androidTextFix]}>{t('loading')}</Text>
      </View>
    );
  }

  if (!selectedItem) {
    return (
      <View style={[styles.container, styles.errorContainer]} testID="tasbih-no-item">
        <Text style={[styles.errorText, androidTextFix]}>{t('noTasbihAvailable')}</Text>
      </View>
    );
  }

  const progressPercent = selectedItem.targetCount > 0
    ? Math.min((selectedItem.count / selectedItem.targetCount) * 100, 100)
    : 0;

  return (
    <ThemedBackground testID="tasbih-screen">
      <UnifiedHeader title={t('tasbih') || 'التسبيح'} testID="tasbih-header" />

      <View style={styles.cardsSection}>
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
            <TouchableOpacity style={styles.addCard} testID="add-tasbih-button" activeOpacity={0.7} onPress={handleAddTasbih}>
              <LinearGradient colors={['rgba(212,168,83,0.15)', 'rgba(212,168,83,0.05)']} style={styles.addCardGradient}>
                <Plus size={20} color={GOLD} />
                <Text style={[styles.addCardText, androidTextFix]}>{t('add')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          }
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
          style={styles.cardsScrollView}
          testID="tasbih-cards-scroll"
          removeClippedSubviews
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={5}
          getItemLayout={(_, index) => ({ length: 96, offset: 96 * index, index })}
        />
      </View>

      <View style={styles.mainContent}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <LinearGradient colors={[CARD_WHITE, IVORY]} style={styles.dhikrDisplay}>
            <View style={styles.dhikrIconContainer}>
              <View style={styles.dhikrIcon}><Moon size={20} color={DEEP_GREEN} /></View>
            </View>
            <Text style={[styles.mainArabicText, androidTextFix]}>{selectedItem.arabicText}</Text>
            {settings.showTransliteration && (
              <Text style={[styles.transliterationText, androidTextFix]}>{selectedItem.transliteration}</Text>
            )}
            {settings.showTranslation && (
              <Text style={[styles.translationText, androidTextFix]}>{selectedItem.translation}</Text>
            )}
  
          </LinearGradient>

          <View style={styles.counterSection}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <BeadRingCounter
                count={selectedItem.count}
                targetCount={selectedItem.targetCount}
                size={counterSize}
                beadColor="#1B5A6B"
                activeColor="#2A8A9A"
                onPress={handleIncrement}
                testID="increment-button"
              />
            </Animated.View>

            {selectedItem.isCompleted && (
              <View style={[styles.completedBadge, { backgroundColor: selectedItem.color }]}>
                <Check size={14} color="#FFFFFF" />
                <Text style={[styles.completedText, androidTextFix]}>{t('completed')}</Text>
              </View>
            )}

            <Text style={[styles.tapHint, androidTextFix]}>{t('tapToCount')}</Text>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarTrack}>
                <Animated.View
                  style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: selectedItem.color }]}
                />
              </View>
              <Text style={[styles.progressText, androidTextFix]}>{selectedItem.count} / {selectedItem.targetCount}</Text>
            </View>
          </View>

          <View style={styles.controlButtonsRow}>
            <TouchableOpacity style={styles.controlButton} onPress={handleDecrement} activeOpacity={0.7} testID="decrement-button">
              <LinearGradient colors={['#FFE4E4', '#FFF0F0']} style={styles.controlButtonGradient}>
                <Minus size={22} color="#E05252" />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.statsDisplay}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, androidTextFix]}>{t('today')}</Text>
                <Text style={[styles.statValue, androidTextFix]}>{stats.todayCount}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, androidTextFix]}>{t('total')}</Text>
                <Text style={[styles.statValue, androidTextFix]}>{stats.totalCount}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.controlButton} onPress={handleReset} activeOpacity={0.7} testID="reset-button">
              <LinearGradient colors={['#FFF8E7', '#FFF4DB']} style={styles.controlButtonGradient}>
                <RotateCcw size={22} color={GOLD} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.liveStatsSummary}
            onPress={() => router.push('/statistics')}
            activeOpacity={0.7}
            testID="stats-link-button"
          >
            <ChevronLeft size={18} color={TEXT_MUTED} />
            <View style={styles.liveStatsRight}>
              <View>
                <Text style={[styles.liveStatsTitle, androidTextFix]}>{t('statistics') || 'الإحصائيات'}</Text>
                <Text style={[styles.liveStatsSubtitle, androidTextFix]}>
                  {stats.completedSessions} {t('sessions') || 'جلسات'} · {stats.todayCount} {t('today') || 'اليوم'}
                </Text>
              </View>
              <View style={styles.liveStatsIconCircle}>
                <TrendingUp size={16} color={GOLD} />
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <View style={{ paddingBottom: Math.max(insets.bottom, 10) }}>
        <AdBanner />
      </View>

      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={handleCloseModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCloseModal} style={styles.modalCloseButton} testID="modal-close-btn">
                <X size={22} color={TEXT_MUTED} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, androidTextFix]}>{t('addNewTasbih')}</Text>
              <TouchableOpacity onPress={handleSaveNewTasbih} style={styles.modalSaveButton} testID="modal-save-btn">
                <Check size={22} color={CARD_WHITE} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, androidTextFix]}>{t('arabicText')} *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTasbih.arabicText}
                  onChangeText={(text) => setNewTasbih(prev => ({ ...prev, arabicText: text }))}
                  placeholder={t('arabicTextPlaceholder')}
                  placeholderTextColor={TEXT_MUTED}
                  multiline
                  textAlign="right"
                  testID="input-arabic-text"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, androidTextFix]}>{t('transliteration')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTasbih.transliteration}
                  onChangeText={(text) => setNewTasbih(prev => ({ ...prev, transliteration: text }))}
                  placeholder={t('transliterationPlaceholder')}
                  placeholderTextColor={TEXT_MUTED}
                  testID="input-transliteration"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, androidTextFix]}>{t('translation')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={newTasbih.translation}
                  onChangeText={(text) => setNewTasbih(prev => ({ ...prev, translation: text }))}
                  placeholder={t('translationPlaceholder')}
                  placeholderTextColor={TEXT_MUTED}
                  multiline
                  testID="input-translation"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, androidTextFix]}>{t('targetCount')}</Text>
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
                  testID="input-target-count"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, androidTextFix]}>{t('color')}</Text>
                <View style={styles.colorPicker}>
                  {predefinedColors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[styles.colorOption, { backgroundColor: color }, newTasbih.color === color && styles.selectedColor]}
                      onPress={() => setNewTasbih(prev => ({ ...prev, color }))}
                      testID={`color-option-${color}`}
                    />
                  ))}
                </View>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: IVORY },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 15, color: TEXT_MUTED, marginTop: 12, fontWeight: '500' as const },
  errorContainer: { justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: DEEP_GREEN, textAlign: 'center', fontWeight: '600' as const },
  cardsSection: { backgroundColor: IVORY, paddingBottom: 10 },
  cardsScrollView: { maxHeight: 78 },
  cardsContainer: { paddingHorizontal: 10, paddingVertical: 4 },
  addCard: { marginHorizontal: 6 },
  addCardGradient: {
    minWidth: 74, width: 74, height: 72, borderRadius: 16,
    borderWidth: 1.5, borderColor: GOLD + '40', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  addCardText: { fontSize: 11, fontWeight: '600' as const, color: GOLD, textAlign: 'center' },
  mainContent: { flex: 1 },
  scrollContent: { paddingTop: 10, paddingBottom: 20, paddingHorizontal: 14 },
  dhikrDisplay: {
    alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 5,
    borderWidth: 1, borderColor: 'rgba(212,168,83,0.1)',
  },
  dhikrIconContainer: { marginBottom: 6 },
  dhikrIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(27,67,50,0.08)', alignItems: 'center', justifyContent: 'center' },
  mainArabicText: { fontSize: 16, fontWeight: '700' as const, color: DEEP_GREEN, textAlign: 'center', marginBottom: 1, lineHeight: 24, paddingHorizontal: 6, alignSelf: 'stretch', writingDirection: 'rtl' as const },
  transliterationText: { fontSize: 11, fontWeight: '500' as const, color: DEEP_GREEN, opacity: 0.7, textAlign: 'center', marginTop: 1, lineHeight: 16, fontStyle: 'italic' },
  translationText: { fontSize: 10, fontWeight: '400' as const, color: TEXT_MUTED, textAlign: 'center', marginTop: 2, lineHeight: 16 },
  counterSection: { alignItems: 'center', marginBottom: 6, marginTop: -4 },
  completedBadge: { marginTop: -6, marginBottom: 4, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14, gap: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  completedText: { fontSize: 12, fontWeight: '700' as const, color: '#FFFFFF' },
  tapHint: { fontSize: 11, fontWeight: '500' as const, color: TEXT_MUTED, marginTop: 6 },
  progressBarContainer: { width: '100%', maxWidth: 240, marginTop: 8 },
  progressBarTrack: { height: 6, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11, fontWeight: '600' as const, color: TEXT_MUTED, textAlign: 'center', marginTop: 8 },
  controlButtonsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 2 },
  controlButton: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  controlButtonGradient: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  statsDisplay: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 18, gap: 18, backgroundColor: CARD_WHITE, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 10, fontWeight: '500' as const, marginBottom: 1, color: TEXT_MUTED, textAlign: 'center' as const },
  statValue: { fontSize: 18, fontWeight: '800' as const, color: DEEP_GREEN },
  statDivider: { width: 1, height: 36, backgroundColor: 'rgba(0,0,0,0.06)' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: '90%', borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: IVORY, elevation: 24 },
  modalHandle: { width: 40, height: 4, backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  modalCloseButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: CARD_WHITE, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  modalSaveButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: DEEP_GREEN, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  modalTitle: { fontSize: 18, fontWeight: '700' as const, color: DEEP_GREEN, textAlign: 'center', writingDirection: 'rtl' as const },
  modalForm: { paddingHorizontal: 20, paddingTop: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600' as const, color: DEEP_GREEN, marginBottom: 8, textAlign: 'right' as const, writingDirection: 'rtl' as const },
  textInput: { backgroundColor: CARD_WHITE, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: DEEP_GREEN, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', minHeight: 100 },
  numberInput: { backgroundColor: CARD_WHITE, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: DEEP_GREEN, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', textAlign: 'center' as const },
  colorPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorOption: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'transparent' },
  selectedColor: { borderColor: DEEP_GREEN, borderWidth: 3 },
  speakDhikrButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: 'rgba(27,67,50,0.08)', marginTop: 10, overflow: 'hidden' as const },
  speakDhikrButtonActive: { backgroundColor: DEEP_GREEN },
  speakDhikrButtonLocked: { backgroundColor: 'rgba(0,0,0,0.04)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  speakDhikrText: { fontSize: 13, fontWeight: '600' as const, color: DEEP_GREEN },
  speakDhikrTextActive: { color: '#FFFFFF' },
  speakDhikrTextLocked: { color: TEXT_MUTED },
  comingSoonBadgeMini: { backgroundColor: GOLD + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginLeft: 4 },
  comingSoonBadgeMiniText: { fontSize: 9, fontWeight: '700' as const, color: GOLD },
  liveStatsSummary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: CARD_WHITE, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12,
    marginTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 4,
    borderWidth: 1, borderColor: GOLD + '18',
    overflow: 'hidden' as const,
  },
  liveStatsRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  liveStatsIconCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: GOLD + '14', alignItems: 'center', justifyContent: 'center',
  },
  liveStatsTitle: { fontSize: 13, fontWeight: '700' as const, color: DEEP_GREEN, textAlign: 'right' as const },
  liveStatsSubtitle: { fontSize: 11, fontWeight: '500' as const, color: TEXT_MUTED, marginTop: 1, textAlign: 'right' as const },
});
