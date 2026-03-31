import React, { useCallback, useMemo, useState, memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Alert, useWindowDimensions, Modal, TextInput, FlatList, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, X, Check, Minus, RotateCcw, Volume2, VolumeX, Sparkles, Moon, Sun } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTasbihStore } from '@/hooks/useTasbihStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';

import TasbihCard from '@/components/TasbihCard';

import * as Haptics from 'expo-haptics';
import { soundService } from '@/utils/soundService';
import { ttsService } from '@/utils/ttsService';

const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';
const DEEP_GREEN_LIGHT = "#2D5A45";
const SCREEN_TAG = "[TasbihScreen]";
const IVORY = '#F7F4EE';
const CARD_WHITE = '#FFFFFF';
const TEXT_MUTED = '#8A9B91';

// Animated counter number component
const AnimatedCounter = memo(({ count, targetCount }: { count: number; targetCount: number }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const progress = Math.min(count / targetCount, 1);
    Animated.timing(colorAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, targetCount]);

  return (
    <Animated.Text
      style={[
        styles.counterNumber,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {count}
    </Animated.Text>
  );
});

AnimatedCounter.displayName = 'AnimatedCounter';

// Circular Progress Component
const CircularProgress = memo(({ progress, color, size = 220 }: { progress: number; color: string; size?: number }) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false,
    }).start();

    if (progress >= 1) {
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <View style={{ width: size, height: size }}>
        {/* Background Circle */}
        <View
          style={[
            styles.progressCircleBg,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
        {/* Progress Arc - using border approach for cross-platform compatibility */}
        <View
          style={[
            styles.progressArc,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color + '30',
            },
          ]}
        />
        <Animated.View
          style={[
            styles.progressArcFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              borderTopColor: color,
              borderRightColor: progress > 0.25 ? color : 'transparent',
              borderBottomColor: progress > 0.5 ? color : 'transparent',
              borderLeftColor: progress > 0.75 ? color : 'transparent',
              transform: [
                {
                  rotate: animatedProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-90deg', '270deg'],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </Animated.View>
  );
});

CircularProgress.displayName = 'CircularProgress';

// Header Component with gradient
const TasbihHeader = memo(() => {
  const { t } = useLanguageStore();

  return (
    <LinearGradient
      colors={[DEEP_GREEN, DEEP_GREEN_LIGHT]}
      style={styles.headerGradient}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerIconContainer}>
          <Sparkles size={18} color={GOLD} />
        </View>
        <Text style={styles.headerTitle}>{t('tasbih')}</Text>
        <View style={styles.headerOrnament}>
          <View style={styles.ornamentLine} />
          <View style={styles.ornamentDiamond} />
          <View style={styles.ornamentLine} />
        </View>
      </View>
    </LinearGradient>
  );
});

TasbihHeader.displayName = 'TasbihHeader';

// Glow effect component
const GlowEffect = memo(({ color, active }: { color: string; active: boolean }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <Animated.View
      style={[
        styles.glowEffect,
        {
          backgroundColor: color,
          transform: [{ scale: pulseAnim }],
          opacity: active ? 0.3 : 0,
        },
      ]}
    />
  );
});

GlowEffect.displayName = 'GlowEffect';

export default function TasbihScreen() {
  const { t } = useLanguageStore();
  const insets = useSafeAreaInsets();
  const windowDimensions = useWindowDimensions();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Floating animation for counter
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 5,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [floatAnim]);

  useEffect(() => {
    console.log(SCREEN_TAG, 'Screen mounted, dimensions:', windowDimensions.width, 'x', windowDimensions.height);
    void soundService.initialize();

    return () => {
      void soundService.unload();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        void soundService.playClick();
      }

      const willComplete = selectedItem.count + 1 >= selectedItem.targetCount;

      updateTasbihCount(selectedItem.id, true);

      if (willComplete && !selectedItem.isCompleted) {
        if (settings.soundEnabled) {
          void soundService.playCompletion();
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
        void soundService.playClick();
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
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
  }, [restoreTasbih, settings.hapticFeedback]);

  const handleAddTasbih = useCallback(() => {
    console.log('[TasbihScreen] Add new tasbih clicked');
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      try {
        void Haptics.selectionAsync();
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
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
          try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) { console.log('Haptic error', e); }
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
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      void ttsService.stop().catch(() => { /* ignore */ });
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
      {/* Header Section */}
      <TasbihHeader />

      {/* Cards Section */}
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
            <TouchableOpacity
              style={styles.addCard}
              testID="add-tasbih-button"
              activeOpacity={0.7}
              onPress={handleAddTasbih}
            >
              <LinearGradient
                colors={['rgba(212,168,83,0.15)', 'rgba(212,168,83,0.05)']}
                style={styles.addCardGradient}
              >
                <Plus size={20} color={GOLD} />
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
      <View style={styles.mainContent}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Dhikr Display Card */}
          <LinearGradient
            colors={[CARD_WHITE, IVORY]}
            style={styles.dhikrDisplay}
          >
            <View style={styles.dhikrIconContainer}>
              <View style={styles.dhikrIcon}>
                <Moon size={20} color={DEEP_GREEN} />
              </View>
            </View>
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
          </LinearGradient>

          {/* Counter Section */}
          <View style={styles.counterSection}>
            {/* Progress Ring */}
            <View style={styles.progressRingContainer}>
              <GlowEffect color={selectedItem.color} active={progressPercent >= 100} />
              <CircularProgress progress={progressPercent / 100} color={selectedItem.color} />
              
              {/* Counter Button */}
              <Animated.View
                style={[
                  styles.counterButtonContainer,
                  { transform: [{ scale: pulseAnim }, { translateY: floatAnim }] },
                ]}
              >
                <TouchableOpacity
                  style={[styles.mainCounterButton, { backgroundColor: selectedItem.color }]}
                  onPress={handleIncrement}
                  activeOpacity={0.9}
                  testID="increment-button"
                  accessibilityRole="button"
                  accessibilityLabel="Increment counter"
                >
                  <AnimatedCounter count={selectedItem.count} targetCount={selectedItem.targetCount} />
                  <View style={styles.counterDivider} />
                  <Text style={styles.counterTarget}>{selectedItem.targetCount}</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Completed Badge */}
              {selectedItem.isCompleted && (
                <View style={[styles.completedBadge, { backgroundColor: selectedItem.color }]}>
                  <Check size={14} color="#FFFFFF" />
                  <Text style={styles.completedText}>{t('completed')}</Text>
                </View>
              )}
            </View>

            {/* Tap Hint */}
            <Text style={styles.tapHint}>{t('tapToCount')}</Text>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarTrack}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: selectedItem.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {selectedItem.count} / {selectedItem.targetCount}
              </Text>
            </View>
          </View>

          {/* Control Buttons */}
          <View style={styles.controlButtonsRow}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleDecrement}
              activeOpacity={0.7}
              testID="decrement-button"
              accessibilityRole="button"
              accessibilityLabel="Decrement counter"
            >
              <LinearGradient
                colors={['#FFE4E4', '#FFF0F0']}
                style={styles.controlButtonGradient}
              >
                <Minus size={22} color="#E05252" />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.statsDisplay}>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Sun size={14} color={GOLD} />
                </View>
                <Text style={styles.statLabel}>{t('today')}</Text>
                <Text style={styles.statValue}>{stats.todayCount}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Sparkles size={14} color={GOLD} />
                </View>
                <Text style={styles.statLabel}>{t('total')}</Text>
                <Text style={styles.statValue}>{stats.totalCount}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleReset}
              activeOpacity={0.7}
              testID="reset-button"
              accessibilityRole="button"
              accessibilityLabel="Reset counter"
            >
              <LinearGradient
                colors={['#FFF8E7', '#FFF4DB']}
                style={styles.controlButtonGradient}
              >
                <RotateCcw size={22} color={GOLD} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Add Modal */}
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
  headerGradient: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    paddingTop: 8,
  },
  headerIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(212,168,83,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: CARD_WHITE,
    textAlign: 'center',
    writingDirection: 'rtl',
    letterSpacing: 0.5,
  },
  headerOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  ornamentLine: {
    width: 30,
    height: 1,
    backgroundColor: GOLD,
    opacity: 0.5,
  },
  ornamentDiamond: {
    width: 6,
    height: 6,
    backgroundColor: GOLD,
    transform: [{ rotate: '45deg' }],
  },
  cardsSection: {
    backgroundColor: DEEP_GREEN,
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  cardsScrollView: {
    maxHeight: 90,
  },
  cardsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addCard: {
    marginHorizontal: 6,
  },
  addCardGradient: {
    minWidth: 74,
    width: 74,
    height: 72,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: GOLD + '40',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addCardText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: GOLD,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  dhikrDisplay: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(212,168,83,0.1)',
  },
  dhikrIconContainer: {
    marginBottom: 8,
  },
  dhikrIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(27,67,50,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
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
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  translationText: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  counterSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  progressRingContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  progressCircleBg: {
    position: 'absolute',
    backgroundColor: CARD_WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  progressArc: {
    position: 'absolute',
  },
  progressArcFill: {
    position: 'absolute',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  counterButtonContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  mainCounterButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  counterNumber: {
    fontSize: 56,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  counterDivider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginVertical: 6,
  },
  counterTarget: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.85)',
  },
  completedBadge: {
    position: 'absolute' as const,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  tapHint: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: TEXT_MUTED,
    marginTop: 8,
  },
  progressBarContainer: {
    width: '100%',
    maxWidth: 260,
    marginTop: 10,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: 8,
  },
  controlButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
  },
  controlButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  controlButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  statsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 20,
    backgroundColor: CARD_WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(212,168,83,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    marginBottom: 2,
    color: TEXT_MUTED,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: DEEP_GREEN,
  },
  statDivider: {
    width: 1,
    height: 36,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modalSaveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DEEP_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(27,67,50,0.08)',
    marginTop: 10,
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
