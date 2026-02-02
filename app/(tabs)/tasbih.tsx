import React, { useCallback, useMemo, useState, memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert, useWindowDimensions, Modal, TextInput, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RotateCcw, Plus, Minus, X, Check } from 'lucide-react-native';
import { useTasbihStore } from '@/hooks/useTasbihStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import TasbihCounter from '@/components/TasbihCounter';
import TasbihCard from '@/components/TasbihCard';
import { useTheme } from '@/theme/ThemeProvider';

import * as Haptics from 'expo-haptics';
import { adTracker } from '@/utils/adTracking';
import { adStrategy } from '@/utils/adStrategy';
import AdBanner from '@/components/AdBanner';
import VideoAd from '@/components/VideoAd';

// Memoized header component for better performance
const TasbihHeader = memo(() => {
  const { t } = useLanguageStore();
  const theme = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('tasbih')}</Text>
      </View>
    </View>
  );
});

TasbihHeader.displayName = 'TasbihHeader';



const islamicVideoAds = [
  {
    id: 'islamic-video-1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 10
  },
  {
    id: 'islamic-video-2',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: 10
  },
  {
    id: 'islamic-video-3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: 10
  }
];

export default function TasbihScreen() {
  const { t } = useLanguageStore();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const theme = useTheme();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showVideoAd, setShowVideoAd] = useState<boolean>(false);
  const [currentVideoAd, setCurrentVideoAd] = useState<{ id: string; videoUrl: string; duration: number }>(islamicVideoAds[0]);
  const lastAdShownRef = useRef<string | null>(null);
  const [currentAd, setCurrentAd] = useState(adStrategy.getRandomBannerAd());

  useEffect(() => {
    console.log('[TasbihScreen] Screen mounted - tracking KPI');
    adTracker.trackImpression('tasbih-screen', 'tasbih', 'screen-view');
    
    const adRefreshInterval = setInterval(() => {
      setCurrentAd(adStrategy.getRandomBannerAd());
      console.log('[TasbihScreen] Banner ad refreshed');
    }, 45000);
    
    return () => clearInterval(adRefreshInterval);
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

  const counterSize = useMemo(() => Math.min(screenWidth * 0.4, 140), [screenWidth]);

  const handleIncrement = useCallback(() => {
    if (selectedItem) {
      console.log(`[TasbihScreen] Increment count for: ${selectedItem.id}`);
      adTracker.trackClick(`increment-${selectedItem.id}`, 'tasbih', 'counter-button');
      
      const willComplete = selectedItem.count + 1 >= selectedItem.targetCount;
      
      updateTasbihCount(selectedItem.id, true);
      
      if (willComplete && !selectedItem.isCompleted) {
        const adKey = `${selectedItem.id}-${Date.now()}`;
        if (lastAdShownRef.current !== adKey) {
          console.log('[TasbihScreen] Dhikr completed - showing video ad');
          lastAdShownRef.current = adKey;
          setTimeout(() => {
            try {
              const randomVideoAd = islamicVideoAds[Math.floor(Math.random() * islamicVideoAds.length)];
              if (randomVideoAd && randomVideoAd.videoUrl) {
                console.log(`[TasbihScreen] Selected video ad: ${randomVideoAd.id}`);
                setCurrentVideoAd(randomVideoAd);
                setShowVideoAd(true);
              } else {
                console.log('[TasbihScreen] Invalid video ad selected');
              }
            } catch (error) {
              console.error('[TasbihScreen] Error showing video ad:', error);
            }
          }, 800);
        }
      }
    }
  }, [selectedItem, updateTasbihCount]);

  const handleDecrement = useCallback(() => {
    if (selectedItem && selectedItem.count > 0) {
      console.log(`[TasbihScreen] Decrement count for: ${selectedItem.id}`);
      adTracker.trackClick(`decrement-${selectedItem.id}`, 'tasbih', 'undo-button');
      updateTasbihCount(selectedItem.id, false);
    }
  }, [selectedItem, updateTasbihCount]);

  const handleReset = useCallback(() => {
    if (selectedItem) {
      console.log(`[TasbihScreen] Reset counter for: ${selectedItem.id}`);
      adTracker.trackClick(`reset-${selectedItem.id}`, 'tasbih', 'reset-button');
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
    adTracker.trackClick(`select-${itemId}`, 'tasbih', 'tasbih-card');
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
    adTracker.trackClick(`delete-${itemId}`, 'tasbih', 'delete-button');
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
    adTracker.trackClick(`restore-${itemId}`, 'tasbih', 'restore-button');
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
    adTracker.trackClick('add-new-tasbih', 'tasbih', 'add-button');
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
    adTracker.trackClick('save-custom-tasbih', 'tasbih', 'save-button');
    
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
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top, backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>{t('loading')}</Text>
      </View>
    );
  }

  if (!selectedItem) {
    return (
      <View style={[styles.container, styles.errorContainer, { paddingTop: insets.top, backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.primary }]}>{t('noTasbihAvailable')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
      {/* Header with Dhikr Cards */}
      <View style={[styles.headerSection, { paddingTop: 0, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TasbihHeader />
        
        {/* Tasbih Cards */}
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
              <LinearGradient
                colors={['#374151', '#4B5563']}
                style={styles.addCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Plus size={20} color="#9CA3AF" />
                <Text style={styles.addCardText}>{t('add')}</Text>
              </LinearGradient>
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



      {/* Main Content */}
      <View style={[styles.mainContent, { paddingBottom: 90 }]}>
        {/* Current Dhikr Display */}
        <View style={[styles.dhikrDisplay, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.mainArabicText, { color: theme.text }]}>{selectedItem.arabicText}</Text>
          {settings.showTransliteration && (
            <Text style={[styles.transliterationText, { color: theme.textSecondary }]}>{selectedItem.transliteration}</Text>
          )}
          {settings.showTranslation && (
            <Text style={[styles.translationText, { color: theme.textSecondary }]}>{selectedItem.translation}</Text>
          )}
        </View>

        {/* Counter with Undo and Reset Buttons */}
        <View style={styles.counterContainer}>
          <View style={styles.counterWithButtons}>
            {/* Undo Button - Left of Counter */}
            <TouchableOpacity 
              style={styles.undoButtonLeft}
              onPress={handleDecrement}
              disabled={selectedItem.count === 0}
              testID="undo-button-left"
            >
              <LinearGradient
                colors={selectedItem.count === 0 
                  ? ['rgba(100, 116, 139, 0.2)', 'rgba(100, 116, 139, 0.1)']
                  : ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']
                }
                style={styles.undoButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Minus size={20} color={selectedItem.count === 0 ? '#64748B' : '#EF4444'} />
              </LinearGradient>
            </TouchableOpacity>
            
            <TasbihCounter
              item={selectedItem}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              hapticEnabled={settings.hapticFeedback}
              soundEnabled={settings.soundEnabled}
              size={counterSize}
            />
            
            {/* Reset Button - Right of Counter */}
            <TouchableOpacity 
              style={styles.resetButtonRight}
              onPress={handleReset}
              testID="reset-button-right"
            >
              <LinearGradient
                colors={['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.1)']}
                style={styles.resetButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <RotateCcw size={20} color="#F59E0B" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>


      </View>

      {/* Fixed Ad Banner at Bottom */}
      <View style={styles.fixedAdContainer}>
        <AdBanner
          imageUrl={currentAd.imageUrl}
          headline={currentAd.headline}
          cta={currentAd.cta}
          destinationUrl={currentAd.destinationUrl}
          variant={theme.mode === 'dark' ? 'dark' : 'light'}
          height={80}
          testID="tasbih-islamic-ad"
        />
      </View>

      {/* Video Ad Modal */}
      {currentVideoAd && (
        <VideoAd
          visible={showVideoAd}
          onClose={() => {
            console.log('[TasbihScreen] Closing video ad');
            setShowVideoAd(false);
          }}
          adId={currentVideoAd.id}
          videoUrl={currentVideoAd.videoUrl}
          duration={currentVideoAd.duration}
          autoClose={true}
          testID="tasbih-video-ad"
        />
      )}

      {/* Add Tasbih Modal */}
      <Modal
        visible={showAddModal}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCloseModal} style={styles.modalCloseButton}>
                <X size={24} color="#94A3B8" />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('addNewTasbih')}</Text>
              <TouchableOpacity onPress={handleSaveNewTasbih} style={styles.modalSaveButton}>
                <Check size={24} color="#10B981" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              {/* Arabic Text Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>{t('arabicText')} *</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                  value={newTasbih.arabicText}
                  onChangeText={(text) => setNewTasbih(prev => ({ ...prev, arabicText: text }))}
                  placeholder={t('arabicTextPlaceholder')}
                  placeholderTextColor="#64748B"
                  multiline
                  textAlign="right"
                />
              </View>

              {/* Transliteration Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>{t('transliteration')}</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                  value={newTasbih.transliteration}
                  onChangeText={(text) => setNewTasbih(prev => ({ ...prev, transliteration: text }))}
                  placeholder={t('transliterationPlaceholder')}
                  placeholderTextColor="#64748B"
                />
              </View>

              {/* Translation Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>{t('translation')}</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                  value={newTasbih.translation}
                  onChangeText={(text) => setNewTasbih(prev => ({ ...prev, translation: text }))}
                  placeholder={t('translationPlaceholder')}
                  placeholderTextColor="#64748B"
                  multiline
                />
              </View>

              {/* Target Count Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>{t('targetCount')}</Text>
                <TextInput
                  style={[styles.numberInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                  value={newTasbih.targetCount.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 1;
                    setNewTasbih(prev => ({ ...prev, targetCount: Math.max(1, num) }));
                  }}
                  placeholder="33"
                  placeholderTextColor="#64748B"
                  keyboardType="numeric"
                />
              </View>

              {/* Color Selection */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>{t('color')}</Text>
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
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 12,
    fontWeight: '500' as const,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 20,
  },
  headerLeft: {
    flex: 1,
  },


  headerTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSection: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.3)',
    paddingTop: 0,
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
    borderColor: '#4B5563',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addCardText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
  },
  dhikrDisplay: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
    paddingVertical: 6,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    width: '100%',
  },
  mainArabicText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
    lineHeight: 18,
    paddingHorizontal: 8,
    alignSelf: 'stretch',
  },
  transliterationText: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
  translationText: {
    fontSize: 9,
    fontWeight: '400' as const,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 12,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
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
    color: '#F1F5F9',
    marginBottom: 8,
    textAlign: 'right',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 48,
  },
  numberInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#334155',
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
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  fixedAdContainer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    borderTopWidth: 0,
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
});