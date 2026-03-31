import React, { useCallback, useMemo, useState, memo, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, Alert, useWindowDimensions,
  Modal, TextInput, FlatList, Animated, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Plus, X, Check, Minus, RotateCcw, Volume2, VolumeX,
  Sparkles, Moon, TrendingUp, Calendar, Target, Award,
  Flame, Star, RefreshCw
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTasbihStore } from '@/hooks/useTasbihStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import TasbihCard from '@/components/TasbihCard';
import * as Haptics from 'expo-haptics';
import { soundService } from '@/utils/soundService';
import { ttsService } from '@/utils/ttsService';
import i18n from '@/constants/translations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';
const DEEP_GREEN_LIGHT = '#2D5A45';
const IVORY = '#F7F4EE';
const CARD_WHITE = '#FFFFFF';
const TEXT_MUTED = '#8A9B91';

type ActiveTab = 'counter' | 'stats';

// ─── Segment Control ──────────────────────────────────────────────────────────
const SegmentControl = memo(({ active, onChange }: { active: ActiveTab; onChange: (t: ActiveTab) => void }) => {
  const slideAnim = useRef(new Animated.Value(active === 'counter' ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: active === 'counter' ? 0 : 1,
      useNativeDriver: true,
      tension: 180,
      friction: 14,
    }).start();
  }, [active, slideAnim]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_WIDTH / 2 - 32],
  });

  return (
    <View style={seg.wrapper}>
      <Animated.View style={[seg.pill, { transform: [{ translateX }] }]} />
      <TouchableOpacity style={seg.btn} onPress={() => onChange('counter')} activeOpacity={0.8}>
        <Text style={[seg.label, active === 'counter' && seg.labelActive]}>التسبيح</Text>
      </TouchableOpacity>
      <TouchableOpacity style={seg.btn} onPress={() => onChange('stats')} activeOpacity={0.8}>
        <Text style={[seg.label, active === 'stats' && seg.labelActive]}>الإحصائيات</Text>
      </TouchableOpacity>
    </View>
  );
});
SegmentControl.displayName = 'SegmentControl';

// ─── Animated Counter Number ──────────────────────────────────────────────────
const AnimatedCounter = memo(({ count, _targetCount }: { count: number; _targetCount?: number }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(count);

  useEffect(() => {
    if (prevCount.current === count) return;
    prevCount.current = count;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.18, duration: 70, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 280, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [count, scaleAnim]);

  return (
    <Animated.Text style={[styles.counterNumber, { transform: [{ scale: scaleAnim }] }]}>
      {count}
    </Animated.Text>
  );
});
AnimatedCounter.displayName = 'AnimatedCounter';

// ─── Circular Progress ────────────────────────────────────────────────────────
const CircularProgress = memo(({ progress, color, size = 220 }: { progress: number; color: string; size?: number }) => {
  const animatedProgress = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedProgress]);

  const strokeWidth = 6;

  return (
    <View style={{ width: size, height: size }}>
      <View style={[styles.progressCircleBg, { width: size, height: size, borderRadius: size / 2 }]} />
      <View style={[styles.progressArc, { width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: color + '30' }]} />
      <Animated.View
        style={[
          styles.progressArcFill,
          {
            width: size, height: size, borderRadius: size / 2,
            borderWidth: strokeWidth, borderColor: color,
            borderTopColor: color,
            borderRightColor: progress > 0.25 ? color : 'transparent',
            borderBottomColor: progress > 0.5 ? color : 'transparent',
            borderLeftColor: progress > 0.75 ? color : 'transparent',
            transform: [{
              rotate: animatedProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ['-90deg', '270deg'],
              }),
            }],
          },
        ]}
      />
    </View>
  );
});
CircularProgress.displayName = 'CircularProgress';

// ─── Compact header ───────────────────────────────────────────────────────────
const TasbihHeader = memo(({ activeTab, onTabChange }: { activeTab: ActiveTab; onTabChange: (t: ActiveTab) => void }) => {
  return (
    <LinearGradient colors={[DEEP_GREEN, DEEP_GREEN_LIGHT]} style={styles.headerGradient}>
      <View style={styles.headerContent}>
        <View style={styles.headerRow}>
          <View style={styles.headerIconContainer}>
            <Sparkles size={16} color={GOLD} />
          </View>
          <Text style={styles.headerTitle}>{activeTab === 'counter' ? 'التسبيح' : 'الإحصائيات'}</Text>
          <View style={styles.headerOrnament}>
            <View style={styles.ornamentLine} />
            <View style={styles.ornamentDiamond} />
            <View style={styles.ornamentLine} />
          </View>
        </View>
        <SegmentControl active={activeTab} onChange={onTabChange} />
      </View>
    </LinearGradient>
  );
});
TasbihHeader.displayName = 'TasbihHeader';

// ─── Stats Sub-components ─────────────────────────────────────────────────────
interface StatCardProps { icon: React.ReactNode; title: string; value: string | number; subtitle?: string; color: string; }
const StatCard = memo(({ icon, title, value, subtitle, color }: StatCardProps) => (
  <View style={st.statCard}>
    <View style={[st.statIconContainer, { backgroundColor: color + '14' }]}>{icon}</View>
    <Text style={st.statTitle}>{title}</Text>
    <Text style={[st.statValue, { color }]}>{value}</Text>
    {subtitle && <Text style={st.statSubtitle}>{subtitle}</Text>}
  </View>
));
StatCard.displayName = 'StatCard';

interface ProgressBarProps { progress: number; color: string; label: string; value: string; }
const ProgressBar = memo(({ progress, color, label, value }: ProgressBarProps) => {
  const clamp = Math.min(Math.max(progress, 0), 100);
  return (
    <View style={st.progressContainer}>
      <View style={st.progressHeader}>
        <Text style={st.progressLabel}>{label}</Text>
        <Text style={[st.progressValue, { color }]}>{value}</Text>
      </View>
      <View style={st.progressTrack}>
        <View style={[st.progressFill, { width: `${clamp}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
});
ProgressBar.displayName = 'ProgressBar';

interface DhikrStatItemProps { arabicText: string; count: number; targetCount: number; totalCompletions: number; color: string; }
const DhikrStatItem = memo(({ arabicText, count, targetCount, totalCompletions, color }: DhikrStatItemProps) => {
  const progress = targetCount > 0 ? (count / targetCount) * 100 : 0;
  return (
    <View style={st.dhikrStatItem}>
      <View style={st.dhikrStatHeader}>
        <Text style={st.dhikrArabicText}>{arabicText}</Text>
        <View style={[st.completionBadge, { backgroundColor: color + '14' }]}>
          <Text style={[st.completionText, { color }]}>{totalCompletions}x</Text>
        </View>
      </View>
      <View style={st.dhikrProgressContainer}>
        <View style={st.dhikrProgressTrack}>
          <View style={[st.dhikrProgressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: color }]} />
        </View>
        <Text style={st.dhikrCountText}>{count}/{targetCount}</Text>
      </View>
    </View>
  );
});
DhikrStatItem.displayName = 'DhikrStatItem';

// ─── Statistics Panel ─────────────────────────────────────────────────────────
const StatisticsPanel = memo(({ bottomPad }: { bottomPad: number }) => {
  const { stats, tasbihItems, settings, resetStats, saveData } = useTasbihStore();
  const { currentLanguage } = useLanguageStore();
  const isRTL = currentLanguage === 'ar' || currentLanguage === 'ur';

  const activeItems = useMemo(() => tasbihItems.filter(item => !item.isDeleted), [tasbihItems]);

  const todayProgress = useMemo(() => {
    const completed = activeItems.filter(i => i.isCompleted).length;
    return activeItems.length > 0 ? Math.round((completed / activeItems.length) * 100) : 0;
  }, [activeItems]);

  const mostUsedDhikr = useMemo(() => {
    if (!activeItems.length) return null;
    return activeItems.reduce((max, item) => item.totalCompletions > (max?.totalCompletions || 0) ? item : max, activeItems[0]);
  }, [activeItems]);

  const totalTargetCount = useMemo(() => activeItems.reduce((s, i) => s + i.targetCount, 0), [activeItems]);

  const dailyGoalProgress = useMemo(() => {
    const goal = settings.dailyGoal || 300;
    return Math.min(Math.round((stats.todayCount / goal) * 100), 100);
  }, [stats.todayCount, settings.dailyGoal]);

  const sortedDhikrItems = useMemo(() => [...activeItems].sort((a, b) => b.totalCompletions - a.totalCompletions), [activeItems]);

  const handleResetStats = useCallback(() => {
    if (Platform.OS === 'web') {
      if (confirm(i18n.t('resetStatsConfirm') || 'هل تريد إعادة تعيين جميع الإحصائيات؟')) {
        resetStats();
        setTimeout(() => { void saveData(); }, 100);
      }
    } else {
      Alert.alert(
        i18n.t('resetStats') || 'إعادة تعيين الإحصائيات',
        i18n.t('resetStatsConfirm') || 'هل تريد إعادة تعيين جميع الإحصائيات؟',
        [
          { text: i18n.t('cancel') || 'إلغاء', style: 'cancel' },
          {
            text: i18n.t('delete') || 'حذف',
            style: 'destructive',
            onPress: () => { resetStats(); setTimeout(() => { void saveData(); }, 100); },
          },
        ]
      );
    }
  }, [resetStats, saveData]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[st.contentContainer, { paddingBottom: bottomPad + 24 }]}
    >
      {/* Hero */}
      <View style={st.heroCard}>
        <View style={st.heroTop}>
          <View style={st.heroIconCircle}><TrendingUp size={24} color={GOLD} /></View>
          <Text style={st.heroLabel}>{i18n.t('totalDhikr') || 'إجمالي الذكر'}</Text>
        </View>
        <Text style={st.heroValue}>{stats.totalCount.toLocaleString()}</Text>
        <View style={st.heroDivider} />
        <View style={st.heroStats}>
          <View style={st.heroStatItem}>
            <Text style={st.heroStatValue}>{stats.todayCount}</Text>
            <Text style={st.heroStatLabel}>{i18n.t('today') || 'اليوم'}</Text>
          </View>
          <View style={st.heroStatSep} />
          <View style={st.heroStatItem}>
            <Text style={st.heroStatValue}>{stats.streakDays}</Text>
            <Text style={st.heroStatLabel}>{i18n.t('streakDays') || 'أيام متتالية'}</Text>
          </View>
          <View style={st.heroStatSep} />
          <View style={st.heroStatItem}>
            <Text style={st.heroStatValue}>{stats.completedSessions}</Text>
            <Text style={st.heroStatLabel}>{i18n.t('sessions') || 'جلسات'}</Text>
          </View>
        </View>
      </View>

      {/* Daily Progress */}
      <Text style={[st.sectionTitle, isRTL && st.sectionTitleRTL]}>{i18n.t('dailyProgress') || 'التقدم اليومي'}</Text>
      <View style={st.progressCard}>
        <ProgressBar
          progress={dailyGoalProgress}
          color={DEEP_GREEN}
          label={i18n.t('dailyGoal') || 'الهدف اليومي'}
          value={`${stats.todayCount}/${settings.dailyGoal || 300}`}
        />
        <View style={st.progressDivider} />
        <ProgressBar
          progress={todayProgress}
          color={GOLD}
          label={i18n.t('completedDhikr') || 'الأذكار المكتملة'}
          value={`${activeItems.filter(i => i.isCompleted).length}/${activeItems.length}`}
        />
      </View>

      {/* Quick Stats Grid */}
      <Text style={[st.sectionTitle, isRTL && st.sectionTitleRTL]}>{i18n.t('quickStats') || 'إحصائيات سريعة'}</Text>
      <View style={st.statsGrid}>
        <StatCard icon={<Calendar size={20} color="#3B7DD8" />} title={i18n.t('today') || 'اليوم'} value={stats.todayCount} color="#3B7DD8" />
        <StatCard icon={<Flame size={20} color="#E07A3A" />} title={i18n.t('streak') || 'متتالية'} value={stats.streakDays} subtitle={i18n.t('days') || 'أيام'} color="#E07A3A" />
        <StatCard icon={<Target size={20} color="#2D8B6F" />} title={i18n.t('sessions') || 'جلسات'} value={stats.completedSessions} color="#2D8B6F" />
        <StatCard icon={<Award size={20} color="#8B6BC4" />} title={i18n.t('totalTarget') || 'الهدف الكلي'} value={totalTargetCount} color="#8B6BC4" />
      </View>

      {/* Favorite */}
      {mostUsedDhikr && (
        <>
          <Text style={[st.sectionTitle, isRTL && st.sectionTitleRTL]}>{i18n.t('favoritedhikr') || 'الذكر المفضل'}</Text>
          <View style={st.favoriteCard}>
            <View style={st.favoriteIconCircle}><Star size={22} color={GOLD} fill={GOLD} /></View>
            <View style={st.favoriteContent}>
              <Text style={st.favoriteArabic}>{mostUsedDhikr.arabicText}</Text>
              <Text style={st.favoriteStats}>
                {i18n.t('completedTimes') || 'مكتمل'} {mostUsedDhikr.totalCompletions} {i18n.t('times') || 'مرات'}
              </Text>
            </View>
          </View>
        </>
      )}

      {/* Dhikr List */}
      <Text style={[st.sectionTitle, isRTL && st.sectionTitleRTL]}>{i18n.t('dhikrDetails') || 'تفاصيل الأذكار'}</Text>
      <View style={st.dhikrListCard}>
        {sortedDhikrItems.map((item, index) => (
          <View key={item.id}>
            <DhikrStatItem
              arabicText={item.arabicText}
              count={item.count}
              targetCount={item.targetCount}
              totalCompletions={item.totalCompletions}
              color={item.color}
            />
            {index < sortedDhikrItems.length - 1 && <View style={st.dhikrDivider} />}
          </View>
        ))}
      </View>

      <TouchableOpacity style={st.resetButton} onPress={handleResetStats} activeOpacity={0.8} testID="reset-stats-button">
        <RefreshCw size={18} color="#D45050" />
        <Text style={st.resetButtonText}>{i18n.t('resetStats') || 'إعادة تعيين الإحصائيات'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
});
StatisticsPanel.displayName = 'StatisticsPanel';

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TasbihScreen() {
  const { t } = useLanguageStore();
  const insets = useSafeAreaInsets();
  const windowDimensions = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<ActiveTab>('counter');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

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
    console.log('[TasbihScreen] mounted', windowDimensions.width, 'x', windowDimensions.height);
    void soundService.initialize();
    return () => { void soundService.unload(); };
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

  // Fast pulse - triggered imperatively, no state needed
  const triggerPulse = useCallback(() => {
    pulseAnim.stopAnimation();
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.93, duration: 65, useNativeDriver: true }),
      Animated.spring(pulseAnim, { toValue: 1, tension: 350, friction: 9, useNativeDriver: true }),
    ]).start();
  }, [pulseAnim]);

  const handleIncrement = useCallback(() => {
    if (!selectedItem) return;

    triggerPulse();

    if (settings.vibrationEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (settings.soundEnabled) {
      void soundService.playClick();
    }

    const willComplete = selectedItem.count + 1 >= selectedItem.targetCount;
    updateTasbihCount(selectedItem.id, true);

    if (willComplete && !selectedItem.isCompleted) {
      if (settings.soundEnabled) void soundService.playCompletion();
      if (settings.vibrationEnabled && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    }
  }, [selectedItem, updateTasbihCount, settings.vibrationEnabled, settings.soundEnabled, triggerPulse]);

  const handleDecrement = useCallback(() => {
    if (!selectedItem || selectedItem.count <= 0) return;
    if (settings.vibrationEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (settings.soundEnabled) void soundService.playClick();
    updateTasbihCount(selectedItem.id, false);
  }, [selectedItem, updateTasbihCount, settings.vibrationEnabled, settings.soundEnabled]);

  const handleReset = useCallback(() => {
    if (!selectedItem) return;
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
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      try { await Haptics.selectionAsync(); } catch {}
    }
    setSelectedItem(itemId);
  }, [setSelectedItem, settings.hapticFeedback]);

  const handleDeleteTasbih = useCallback((itemId: string) => {
    deleteTasbih(itemId);
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      try { void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    }
  }, [deleteTasbih, settings.hapticFeedback]);

  const handleRestoreTasbih = useCallback((itemId: string) => {
    restoreTasbih(itemId);
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      try { void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    }
  }, [restoreTasbih, settings.hapticFeedback]);

  const handleAddTasbih = useCallback(() => {
    if (settings.hapticFeedback && Platform.OS !== 'web') {
      try { void Haptics.selectionAsync(); } catch {}
    }
    setShowAddModal(true);
  }, [settings.hapticFeedback]);

  const handleSaveNewTasbih = useCallback(() => {
    if (!newTasbih.arabicText.trim()) {
      Alert.alert(t('error'), t('pleaseEnterArabicText'));
      return;
    }
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
      try { void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    }
  }, [newTasbih, addCustomTasbih, settings.hapticFeedback, t]);

  const handleCloseModal = useCallback(() => {
    setShowAddModal(false);
    setNewTasbih({ arabicText: '', transliteration: '', translation: '', targetCount: 33, color: '#2D8B6F', category: 'custom' });
  }, []);

  const handleSpeak = useCallback(async () => {
    if (!selectedItem) return;
    if (isSpeaking) {
      try { await ttsService.stop(); } catch {}
      setIsSpeaking(false);
    } else {
      try {
        if (Platform.OS !== 'web') { try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {} }
        setIsSpeaking(true);
        await ttsService.playDhikr(selectedItem.arabicText);
        setIsSpeaking(false);
      } catch { setIsSpeaking(false); }
    }
  }, [selectedItem, isSpeaking]);

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
      <TasbihHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'counter' ? (
        <>
          {/* Tasbih Cards */}
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
                    <Text style={styles.addCardText}>{t('add')}</Text>
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

          {/* Counter Content */}
          <View style={styles.mainContent}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Dhikr Card */}
              <LinearGradient colors={[CARD_WHITE, IVORY]} style={styles.dhikrDisplay}>
                <View style={styles.dhikrIconContainer}>
                  <View style={styles.dhikrIcon}><Moon size={20} color={DEEP_GREEN} /></View>
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
                  {isSpeaking ? <VolumeX size={16} color="#FFFFFF" /> : <Volume2 size={16} color={DEEP_GREEN} />}
                  <Text style={[styles.speakDhikrText, isSpeaking && styles.speakDhikrTextActive]}>
                    {isSpeaking ? t('stopListening') : t('listenToDhikr')}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>

              {/* Counter */}
              <View style={styles.counterSection}>
                <View style={styles.progressRingContainer}>
                  <CircularProgress progress={progressPercent / 100} color={selectedItem.color} />
                  <Animated.View style={[styles.counterButtonContainer, { transform: [{ scale: pulseAnim }] }]}>
                    <TouchableOpacity
                      style={[styles.mainCounterButton, { backgroundColor: selectedItem.color }]}
                      onPress={handleIncrement}
                      activeOpacity={0.9}
                      testID="increment-button"
                      accessibilityRole="button"
                      accessibilityLabel="Increment counter"
                    >
                      <AnimatedCounter count={selectedItem.count} />
                      <View style={styles.counterDivider} />
                      <Text style={styles.counterTarget}>{selectedItem.targetCount}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                  {selectedItem.isCompleted && (
                    <View style={[styles.completedBadge, { backgroundColor: selectedItem.color }]}>
                      <Check size={14} color="#FFFFFF" />
                      <Text style={styles.completedText}>{t('completed')}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.tapHint}>{t('tapToCount')}</Text>

                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarTrack}>
                    <Animated.View
                      style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: selectedItem.color }]}
                    />
                  </View>
                  <Text style={styles.progressText}>{selectedItem.count} / {selectedItem.targetCount}</Text>
                </View>
              </View>

              {/* Controls */}
              <View style={styles.controlButtonsRow}>
                <TouchableOpacity style={styles.controlButton} onPress={handleDecrement} activeOpacity={0.7} testID="decrement-button">
                  <LinearGradient colors={['#FFE4E4', '#FFF0F0']} style={styles.controlButtonGradient}>
                    <Minus size={22} color="#E05252" />
                  </LinearGradient>
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

                <TouchableOpacity style={styles.controlButton} onPress={handleReset} activeOpacity={0.7} testID="reset-button">
                  <LinearGradient colors={['#FFF8E7', '#FFF4DB']} style={styles.controlButtonGradient}>
                    <RotateCcw size={22} color={GOLD} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </>
      ) : (
        <StatisticsPanel bottomPad={insets.bottom} />
      )}

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={handleCloseModal}>
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
                      style={[styles.colorOption, { backgroundColor: color }, newTasbih.color === color && styles.selectedColor]}
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

// ─── Segment Styles ───────────────────────────────────────────────────────────
const seg = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
    height: 36,
    position: 'relative',
    overflow: 'hidden',
  },
  pill: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.6)',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});

// ─── Counter Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: IVORY },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 15, color: TEXT_MUTED, marginTop: 12, fontWeight: '500' as const },
  errorContainer: { justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: DEEP_GREEN, textAlign: 'center', fontWeight: '600' as const },
  headerGradient: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  headerContent: { alignItems: 'center', paddingHorizontal: 12, paddingTop: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  headerIconContainer: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(212,168,83,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' as const, color: CARD_WHITE, textAlign: 'center', letterSpacing: 0.5 },
  headerOrnament: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ornamentLine: { width: 22, height: 1, backgroundColor: GOLD, opacity: 0.5 },
  ornamentDiamond: { width: 5, height: 5, backgroundColor: GOLD, transform: [{ rotate: '45deg' }] },
  cardsSection: { backgroundColor: DEEP_GREEN, paddingBottom: 14, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  cardsScrollView: { maxHeight: 90 },
  cardsContainer: { paddingHorizontal: 12, paddingVertical: 6 },
  addCard: { marginHorizontal: 6 },
  addCardGradient: {
    minWidth: 74, width: 74, height: 72, borderRadius: 16,
    borderWidth: 1.5, borderColor: GOLD + '40', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  addCardText: { fontSize: 11, fontWeight: '600' as const, color: GOLD, textAlign: 'center' },
  mainContent: { flex: 1 },
  scrollContent: { paddingTop: 12, paddingBottom: 24, paddingHorizontal: 16 },
  dhikrDisplay: {
    alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14,
    borderRadius: 20, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 5,
    borderWidth: 1, borderColor: 'rgba(212,168,83,0.1)',
  },
  dhikrIconContainer: { marginBottom: 8 },
  dhikrIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(27,67,50,0.08)', alignItems: 'center', justifyContent: 'center' },
  mainArabicText: { fontSize: 22, fontWeight: '700' as const, color: DEEP_GREEN, textAlign: 'center', marginBottom: 4, lineHeight: 34, paddingHorizontal: 8, alignSelf: 'stretch', writingDirection: 'rtl' },
  transliterationText: { fontSize: 14, fontWeight: '500' as const, color: DEEP_GREEN, opacity: 0.7, textAlign: 'center', marginTop: 4, lineHeight: 22, fontStyle: 'italic' },
  translationText: { fontSize: 13, fontWeight: '400' as const, color: TEXT_MUTED, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  counterSection: { alignItems: 'center', marginBottom: 10 },
  progressRingContainer: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center' },
  progressCircleBg: { position: 'absolute', backgroundColor: CARD_WHITE, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8 },
  progressArc: { position: 'absolute' },
  progressArcFill: { position: 'absolute', borderLeftColor: 'transparent', borderBottomColor: 'transparent' },
  counterButtonContainer: { position: 'absolute', zIndex: 10 },
  mainCounterButton: { width: 180, height: 180, borderRadius: 90, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 12 },
  counterNumber: { fontSize: 56, fontWeight: '800' as const, color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  counterDivider: { width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.5)', marginVertical: 6 },
  counterTarget: { fontSize: 22, fontWeight: '600' as const, color: 'rgba(255,255,255,0.85)' },
  completedBadge: { position: 'absolute' as const, bottom: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  completedText: { fontSize: 12, fontWeight: '700' as const, color: '#FFFFFF' },
  tapHint: { fontSize: 12, fontWeight: '500' as const, color: TEXT_MUTED, marginTop: 8 },
  progressBarContainer: { width: '100%', maxWidth: 260, marginTop: 10 },
  progressBarTrack: { height: 6, backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11, fontWeight: '600' as const, color: TEXT_MUTED, textAlign: 'center', marginTop: 8 },
  controlButtonsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 4 },
  controlButton: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  controlButtonGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  statsDisplay: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, gap: 20, backgroundColor: CARD_WHITE, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 4, borderWidth: 1, borderColor: 'rgba(212,168,83,0.1)' },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 11, fontWeight: '500' as const, marginBottom: 2, color: TEXT_MUTED },
  statValue: { fontSize: 20, fontWeight: '800' as const, color: DEEP_GREEN },
  statDivider: { width: 1, height: 36, backgroundColor: 'rgba(0,0,0,0.06)' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { maxHeight: '90%', borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: IVORY },
  modalHandle: { width: 40, height: 4, backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  modalCloseButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: CARD_WHITE, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  modalSaveButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: DEEP_GREEN, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  modalTitle: { fontSize: 18, fontWeight: '700' as const, color: DEEP_GREEN, textAlign: 'center' },
  modalForm: { paddingHorizontal: 20, paddingTop: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600' as const, color: DEEP_GREEN, marginBottom: 8, textAlign: 'right' },
  textInput: { backgroundColor: CARD_WHITE, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: DEEP_GREEN, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', minHeight: 48, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  numberInput: { backgroundColor: CARD_WHITE, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: DEEP_GREEN, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', textAlign: 'center', width: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  colorPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorOption: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'transparent' },
  selectedColor: { borderColor: DEEP_GREEN, borderWidth: 3 },
  speakDhikrButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: 'rgba(27,67,50,0.08)', marginTop: 10 },
  speakDhikrButtonActive: { backgroundColor: DEEP_GREEN },
  speakDhikrText: { fontSize: 13, fontWeight: '600' as const, color: DEEP_GREEN },
  speakDhikrTextActive: { color: '#FFFFFF' },
});

// ─── Statistics Styles ────────────────────────────────────────────────────────
const st = StyleSheet.create({
  contentContainer: { paddingTop: 20, paddingHorizontal: 16 },
  heroCard: {
    backgroundColor: CARD_WHITE, borderRadius: 24, padding: 24, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 3,
    borderWidth: 1, borderColor: GOLD + '18',
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  heroIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: GOLD + '14', justifyContent: 'center', alignItems: 'center' },
  heroLabel: { fontSize: 14, color: TEXT_MUTED, fontWeight: '500' as const },
  heroValue: { fontSize: 44, fontWeight: '800' as const, color: DEEP_GREEN, marginTop: 4, textAlign: 'center' },
  heroDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 18 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-around' },
  heroStatItem: { alignItems: 'center' },
  heroStatValue: { fontSize: 22, fontWeight: '700' as const, color: DEEP_GREEN },
  heroStatLabel: { fontSize: 12, color: TEXT_MUTED, marginTop: 4 },
  heroStatSep: { width: 1, backgroundColor: 'rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 15, fontWeight: '600' as const, color: TEXT_MUTED, marginBottom: 12, marginLeft: 4, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  sectionTitleRTL: { textAlign: 'right', marginLeft: 0, marginRight: 4 },
  progressCard: { backgroundColor: CARD_WHITE, borderRadius: 20, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  progressContainer: { marginBottom: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel: { fontSize: 14, color: DEEP_GREEN, fontWeight: '500' as const },
  progressValue: { fontSize: 14, fontWeight: '700' as const },
  progressTrack: { height: 8, backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressDivider: { height: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { backgroundColor: CARD_WHITE, borderRadius: 18, padding: 16, width: (SCREEN_WIDTH - 44) / 2, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  statIconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statTitle: { fontSize: 12, color: TEXT_MUTED, marginBottom: 4 },
  statValue: { fontSize: 26, fontWeight: '800' as const },
  statSubtitle: { fontSize: 11, color: TEXT_MUTED, marginTop: 2 },
  favoriteCard: { backgroundColor: CARD_WHITE, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: GOLD + '18' },
  favoriteIconCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: GOLD + '14', justifyContent: 'center', alignItems: 'center' },
  favoriteContent: { marginLeft: 16, flex: 1 },
  favoriteArabic: { fontSize: 20, fontWeight: '700' as const, color: DEEP_GREEN, marginBottom: 4, writingDirection: 'rtl', textAlign: 'right' },
  favoriteStats: { fontSize: 13, color: TEXT_MUTED },
  dhikrListCard: { backgroundColor: CARD_WHITE, borderRadius: 20, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  dhikrStatItem: { paddingVertical: 14 },
  dhikrStatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dhikrArabicText: { fontSize: 16, fontWeight: '600' as const, color: DEEP_GREEN, flex: 1, writingDirection: 'rtl', textAlign: 'right' },
  completionBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  completionText: { fontSize: 12, fontWeight: '700' as const },
  dhikrProgressContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dhikrProgressTrack: { flex: 1, height: 6, backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 3, overflow: 'hidden' },
  dhikrProgressFill: { height: '100%', borderRadius: 3 },
  dhikrCountText: { fontSize: 12, color: TEXT_MUTED, minWidth: 50, textAlign: 'right' },
  dhikrDivider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(0,0,0,0.06)' },
  resetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, gap: 8, marginBottom: 20, borderWidth: 1, borderColor: '#FECACA' },
  resetButtonText: { fontSize: 15, fontWeight: '600' as const, color: '#D45050' },
});
