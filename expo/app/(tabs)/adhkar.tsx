import React, { useCallback, useMemo, useDeferredValue, useEffect, useRef, useState, memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Platform, ScrollView, Pressable, Share, Animated, Easing, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguageStore } from '@/hooks/useLanguageStore';

import { useFavoritesStore } from '@/hooks/useFavoritesStore';
import { useAdhkarCountsStore } from '@/hooks/useAdhkarCountsStore';
import { ADHKAR_LIST } from '@/constants/dhikr';
import { Sparkles, Sun, Moon, Clock, Heart, Star, Share2, MoonStar, Sunrise, RotateCcw, Undo, MoreVertical } from 'lucide-react-native';
import { AdhkarItem } from '@/types';
import * as Haptics from 'expo-haptics';
import AdBanner from '@/components/AdBanner';
import { PolygonCounter } from '@/components/PolygonCounter';
import { androidTextFix, androidRipple } from '@/utils/androidOptimizations';
import UnifiedHeader from '@/components/UnifiedHeader';
import { ThemedBackground } from '@/components/ThemedBackground';

const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';
const IVORY = '#F7F4EE';
const CARD_WHITE = '#FFFFFF';
const TEXT_MUTED = '#8A9B91';
const CREAM = '#FAF4E8';

const ADHKAR_TAG = '[AdhkarScreen]';
console.log(ADHKAR_TAG, 'module loaded, initializing adhkar screen with filters and TTS support');

const getDhikrTitle = (arabicText: string): string => {
  const firstLine = (arabicText.split('\n')[0] || '').trim();
  const cleaned = firstLine
    .replace(/[﴿﴾۝\d]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 34) return cleaned;
  return cleaned.slice(0, 34) + '…';
};

type FilterType = 'all' | 'morning' | 'evening' | 'after-prayer' | 'duas' | 'sleep' | 'wakeup' | 'favorites';

interface FilterButtonProps {
  filter: FilterType;
  selectedFilter: FilterType;
  onPress: (filter: FilterType) => void;
  label: string;
}

const FILTER_COLORS: Record<string, { icon: string; activeBg: string }> = {
  all: { icon: GOLD, activeBg: DEEP_GREEN },
  morning: { icon: '#E8A317', activeBg: '#B8860B' },
  evening: { icon: '#7C6BC4', activeBg: '#5B4FA0' },
  'after-prayer': { icon: '#2D8B6F', activeBg: '#1B6B50' },
  duas: { icon: '#D4708F', activeBg: '#B85070' },
  sleep: { icon: '#5B6ABF', activeBg: '#434FA0' },
  wakeup: { icon: '#D4843A', activeBg: '#B06B28' },
  favorites: { icon: GOLD, activeBg: GOLD },
};

const FilterButtonComponent: React.FC<FilterButtonProps> = ({ filter, selectedFilter, onPress, label }) => {
  const isSelected = selectedFilter === filter;
  const colors = FILTER_COLORS[filter] || FILTER_COLORS.all;

  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      try { void Haptics.selectionAsync(); } catch (error) { console.log('Haptic error:', error); }
    }
    onPress(filter);
  }, [filter, onPress]);

  const iconColor = isSelected ? '#FFFFFF' : colors.icon;
  const renderIcon = () => {
    const size = 15;
    switch (filter) {
      case 'all': return <Sparkles size={size} color={iconColor} />;
      case 'morning': return <Sun size={size} color={iconColor} />;
      case 'evening': return <Moon size={size} color={iconColor} />;
      case 'after-prayer': return <Clock size={size} color={iconColor} />;
      case 'duas': return <Heart size={size} color={iconColor} />;
      case 'sleep': return <MoonStar size={size} color={iconColor} />;
      case 'wakeup': return <Sunrise size={size} color={iconColor} />;
      default: return null;
    }
  };

  return (
    <View testID={`filter-${filter}`}>
      <Pressable
        style={[
          styles.filterButton,
          isSelected && { backgroundColor: colors.activeBg, borderColor: colors.activeBg },
        ]}
        onPress={handlePress}
        android_ripple={androidRipple(isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(27,67,50,0.12)')}
        accessibilityRole="button"
        accessibilityLabel={`تصفية ${label}`}
      >
        <View style={styles.filterButtonContent}>
          {renderIcon()}
          <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextActive, androidTextFix]}>
            {label}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

const FilterButton = memo(
  FilterButtonComponent,
  (prev, next) => prev.filter === next.filter && prev.selectedFilter === next.selectedFilter && prev.label === next.label
);

FilterButton.displayName = 'FilterButton';

interface AdhkarCardProps {
  item: AdhkarItem;
  index: number;
  reducedMotion: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onShare: (item: AdhkarItem) => void;
  onLockedPress: () => void;
}

const GoldOrnament: React.FC = memo(() => (
  <View style={styles.ornamentContainer}>
    <View style={styles.ornamentDiamond} />
  </View>
));
GoldOrnament.displayName = 'GoldOrnament';

const AdhkarCardComponent: React.FC<AdhkarCardProps> = ({ item, index: _index, reducedMotion: _reducedMotion, isFavorite, onToggleFavorite, onShare, onLockedPress }) => {
  const { t } = useLanguageStore();
  const { getCount, increment, reset, undo, canUndo } = useAdhkarCountsStore();

  const currentCount = getCount(item.id);
  const targetCount = item.repeatCount ?? 1;
  const isCompleted = currentCount >= targetCount;

  const handleToggleFavorite = useCallback((e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (Platform.OS !== 'web') {
      try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (error) { console.log('Haptic error:', error); }
    }
    onToggleFavorite(item.id);
  }, [item.id, onToggleFavorite]);

  const handleShare = useCallback((e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (Platform.OS !== 'web') {
      try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (error) { console.log('Haptic error:', error); }
    }
    onShare(item);
  }, [item, onShare]);

  const handleMenu = useCallback((e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (Platform.OS !== 'web') {
      try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (error) { console.log('Haptic error:', error); }
    }
    onLockedPress();
  }, [onLockedPress]);

  const handleCounterPress = useCallback((e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    increment(item.id, targetCount);
  }, [item.id, targetCount, increment]);

  const handleResetPress = useCallback((e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (Platform.OS !== 'web') {
      try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (error) { console.log('Haptic error:', error); }
    }
    reset(item.id);
  }, [item.id, reset]);

  const handleUndoPress = useCallback((e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (Platform.OS !== 'web') {
      try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (error) { console.log('Haptic error:', error); }
    }
    undo(item.id);
  }, [item.id, undo]);

  const getCategoryIcon = (category: string) => {
    const size = 14;
    switch (category) {
      case 'morning': return <Sun size={size} color="#E8A317" />;
      case 'evening': return <Moon size={size} color="#7C6BC4" />;
      case 'after-prayer': return <Clock size={size} color="#2D8B6F" />;
      case 'duas': return <Heart size={size} color="#D4708F" />;
      case 'sleep': return <MoonStar size={size} color="#5B6ABF" />;
      case 'wakeup': return <Sunrise size={size} color="#D4843A" />;
      default: return <Sparkles size={size} color={GOLD} />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'morning': return t('morningAdhkar');
      case 'evening': return t('eveningAdhkar');
      case 'after-prayer': return t('afterPrayerAdhkar');
      case 'duas': return t('duas');
      case 'sleep': return t('sleepAdhkar');
      case 'wakeup': return t('wakeupAdhkar');
      default: return t('adhkar');
    }
  };

  const getAccentColor = (category: string) => {
    switch (category) {
      case 'morning': return '#E8A317';
      case 'evening': return '#7C6BC4';
      case 'after-prayer': return '#2D8B6F';
      case 'duas': return '#D4708F';
      case 'sleep': return '#5B6ABF';
      case 'wakeup': return '#D4843A';
      default: return GOLD;
    }
  };

  const accent = getAccentColor(item.category);
  const title = useMemo(() => item.title || getDhikrTitle(item.arabicText), [item.title, item.arabicText]);
  const canUndoThis = canUndo(item.id);

  return (
    <View style={styles.adhkarCard} testID={`adhkar-card-${item.id}`}>
      <View style={styles.adhkarCardTouchable}>
        <View style={[styles.cardAccentBar, { backgroundColor: accent }]} />

        <View style={styles.adhkarCardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: accent + '14' }]}>
            {getCategoryIcon(item.category)}
            <Text style={[styles.categoryText, { color: accent }, androidTextFix]}>{getCategoryLabel(item.category)}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.actionIcon}
              onPress={handleMenu}
              android_ripple={androidRipple('rgba(138,155,145,0.25)', true, 20)}
              testID="adhkar-menu-button"
              accessibilityRole="button"
            >
              <MoreVertical size={15} color={TEXT_MUTED} strokeWidth={1.5} />
            </Pressable>
            <Pressable
              style={[styles.actionIcon, isFavorite && { backgroundColor: GOLD + '20' }]}
              onPress={handleToggleFavorite}
              android_ripple={androidRipple('rgba(212,168,83,0.3)', true, 20)}
              testID="adhkar-favorite-button"
              accessibilityRole="button"
            >
              <Star size={16} color={isFavorite ? GOLD : TEXT_MUTED} fill={isFavorite ? GOLD : 'transparent'} strokeWidth={1.5} />
            </Pressable>
            <Pressable
              style={styles.actionIcon}
              onPress={handleShare}
              android_ripple={androidRipple('rgba(138,155,145,0.25)', true, 20)}
              testID="adhkar-share-button"
              accessibilityRole="button"
            >
              <Share2 size={15} color={TEXT_MUTED} strokeWidth={1.5} />
            </Pressable>
          </View>
        </View>

        <View style={styles.androidCardBody}>
          <View style={styles.titleRow}>
            <GoldOrnament />
            <Text style={styles.dhikrTitle} numberOfLines={1} selectable={false}>{title}</Text>
            <GoldOrnament />
          </View>

          <View style={styles.adhkarMainContentAndroid}>
            <Text
              style={[styles.adhkarArabicTextFull, androidTextFix]}
              testID="adhkar-arabic-text"
              selectable
            >
              {item.arabicText}
            </Text>

            {item.transliteration && (
              <Text style={[styles.adhkarTransliterationFull, androidTextFix]} selectable>
                {item.transliteration}
              </Text>
            )}

            {item.translation && (
              <Text style={[styles.adhkarTranslationFull, androidTextFix]} selectable>
                {item.translation}
              </Text>
            )}
          </View>

          <View style={styles.counterBar}>
            <Pressable
              style={styles.sideCounterButton}
              onPress={handleResetPress}
              android_ripple={androidRipple('rgba(212,168,83,0.2)', true, 18)}
              accessibilityRole="button"
              accessibilityLabel={t('reset')}
            >
              <RotateCcw size={18} color={GOLD} />
            </Pressable>
            <PolygonCounter
              count={currentCount}
              targetCount={targetCount}
              size={58}
              onPress={handleCounterPress}
              textColor={isCompleted ? GOLD : DEEP_GREEN}
              fillColor={isCompleted ? GOLD + '18' : CREAM}
              testID={`adhkar-repeat-counter-${item.id}`}
              accessibilityLabel={`${currentCount} / ${targetCount} ${t('times')}`}
              style={{ elevation: isCompleted ? 6 : 2 }}
            />
            <Pressable
              style={[styles.sideCounterButton, !canUndoThis && styles.sideCounterButtonDisabled]}
              onPress={handleUndoPress}
              disabled={!canUndoThis}
              android_ripple={androidRipple('rgba(212,168,83,0.2)', true, 18)}
              accessibilityRole="button"
              accessibilityLabel={t('undo')}
            >
              <Undo size={18} color={canUndoThis ? GOLD : TEXT_MUTED} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const AdhkarCard = memo(
  AdhkarCardComponent,
  (prev, next) => prev.item.id === next.item.id && prev.item.title === next.item.title && prev.item.arabicText === next.item.arabicText && prev.item.transliteration === next.item.transliteration && prev.item.translation === next.item.translation && prev.index === next.index && prev.reducedMotion === next.reducedMotion && prev.isFavorite === next.isFavorite
);

AdhkarCard.displayName = 'AdhkarCard';

const AdhkarHeader = memo<{ selectedFilter: FilterType; onFilterChange: (filter: FilterType) => void }>(({ selectedFilter, onFilterChange }) => {
  const { t } = useLanguageStore();

  return (
    <View style={styles.headerSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        <FilterButton filter="all" selectedFilter={selectedFilter} onPress={onFilterChange} label={t('allAdhkar')} />
        <FilterButton filter="morning" selectedFilter={selectedFilter} onPress={onFilterChange} label={t('morning')} />
        <FilterButton filter="evening" selectedFilter={selectedFilter} onPress={onFilterChange} label={t('evening')} />
        <FilterButton filter="after-prayer" selectedFilter={selectedFilter} onPress={onFilterChange} label={t('afterPrayer')} />
        <FilterButton filter="duas" selectedFilter={selectedFilter} onPress={onFilterChange} label={t('duas')} />
        <FilterButton filter="sleep" selectedFilter={selectedFilter} onPress={onFilterChange} label={t('sleepAdhkar')} />
        <FilterButton filter="wakeup" selectedFilter={selectedFilter} onPress={onFilterChange} label={t('wakeupAdhkar')} />
        <FilterButton filter="favorites" selectedFilter={selectedFilter} onPress={onFilterChange} label={t('favorites')} />
      </ScrollView>
    </View>
  );
});

AdhkarHeader.displayName = 'AdhkarHeader';

const EmptyStateComponent = memo(function EmptyStateComponent() {
  const { t } = useLanguageStore();
  return (
    <View style={styles.emptyContainer} testID="adhkar-empty">
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconCircle}>
          <Sparkles size={32} color={GOLD} />
        </View>
        <Text style={[styles.emptyTitle, androidTextFix]}>{t('noAdhkarInCategory')}</Text>
        <Text style={[styles.emptySubtitle, androidTextFix]}>{t('tryAnotherCategory')}</Text>
      </View>
    </View>
  );
});

interface ErrorBoundaryProps {
  children: React.ReactNode;
  t: (key: string) => string;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: unknown) { console.log('[AdhkarScreen] Caught error:', error); }
  handleRetry = () => { this.setState({ hasError: false }); };
  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.center, styles.errorContainer]} testID="adhkar-error">
          <Text style={[styles.emptyTitle, androidTextFix]}>{this.props.t('error')}</Text>
          <Text style={[styles.emptySubtitle, androidTextFix]}>{this.props.t('pleaseTryAgain')}</Text>
          <Pressable onPress={this.handleRetry} style={styles.retryButton} android_ripple={androidRipple('rgba(255,255,255,0.2)')} accessibilityRole="button">
            <Text style={[styles.retryText, androidTextFix]}>{this.props.t('retry')}</Text>
          </Pressable>
        </View>
      );
    }
    return <>{this.props.children}</>;
  }
}

function useReducedMotion(): boolean {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
  }
  return false;
}

export default function AdhkarScreen() {
  const { isLoading, t } = useLanguageStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const deferredFilter = useDeferredValue<FilterType>(selectedFilter);
  const flatListRef = useRef<FlatList<AdhkarItem>>(null);

  useEffect(() => {
    console.log(ADHKAR_TAG, 'Screen mounted');
  }, []);

  const filteredAdhkar = useMemo(() => {
    console.log(`${ADHKAR_TAG} Filtering adhkar for category: ${deferredFilter}`);
    let filtered = ADHKAR_LIST;
    if (deferredFilter === 'favorites') {
      filtered = ADHKAR_LIST.filter(item => isFavorite(item.id));
    } else if (deferredFilter !== 'all') {
      filtered = ADHKAR_LIST.filter(item => item.category === deferredFilter);
    }
    console.log(`${ADHKAR_TAG} Found ${filtered.length} adhkar items for filter: ${deferredFilter}`);
    return filtered;
  }, [deferredFilter, isFavorite]);

  const reducedMotion = useReducedMotion();

  const handleLockedPress = useCallback(() => {
    Alert.alert(t('comingSoon'), t('featureComingSoon'));
  }, [t]);

  const webCopyText = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      console.warn(ADHKAR_TAG, 'Modern Clipboard API blocked:', e);
    }
    try {
      if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (success) return true;
      }
    } catch (e) {
      console.warn(ADHKAR_TAG, 'Legacy execCommand copy failed:', e);
    }
    return false;
  }, []);

  const handleShareAdhkar = useCallback(async (item: AdhkarItem) => {
    try {
      const message = `${item.arabicText}\n\n${item.transliteration || ''}\n\n${item.translation || ''}\n\n— تطبيق الأذكار`;
      if (Platform.OS === 'web') {
        try {
          if (typeof navigator !== 'undefined' && navigator.share) {
            await navigator.share({ title: 'ذكر', text: message });
            console.log(`${ADHKAR_TAG} Shared adhkar via Web Share: ${item.id}`);
            return;
          }
        } catch (webError: any) {
          if (webError?.name === 'AbortError') return;
          console.warn(ADHKAR_TAG, 'Web Share API failed:', webError);
        }
        const copied = await webCopyText(message);
        if (copied) {
          Alert.alert('', 'تم النسخ إلى الحافظة');
        } else {
          Alert.alert('مشاركة', message);
        }
      } else {
        await Share.share({ message });
      }
      console.log(`${ADHKAR_TAG} Shared adhkar: ${item.id}`);
    } catch (error) {
      console.error(ADHKAR_TAG, 'Share error:', error);
    }
  }, [webCopyText]);

  const renderAdhkarItem = useCallback(({ item, index }: { item: AdhkarItem; index: number }) => {
    return (
      <AdhkarCard
        item={item}
        index={index}
        reducedMotion={reducedMotion}
        isFavorite={isFavorite(item.id)}
        onToggleFavorite={toggleFavorite}
        onShare={handleShareAdhkar}
        onLockedPress={handleLockedPress}
      />
    );
  }, [reducedMotion, isFavorite, toggleFavorite, handleShareAdhkar, handleLockedPress]);

  const keyExtractor = useCallback((item: AdhkarItem) => item.id, []);

  const handleFilterChange = useCallback((filter: FilterType) => {
    setSelectedFilter(filter);
    console.log(`${ADHKAR_TAG} Filter changed to: ${filter}`);
  }, []);

  const onScrollToIndexFailed = useCallback((info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
    console.log(`${ADHKAR_TAG} scrollToIndex failed:`, info);
    setTimeout(() => {
      try {
        flatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.3 });
      } catch (e) {
        console.log(`${ADHKAR_TAG} Retry scroll failed:`, e);
      }
    }, 500);
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]} testID="adhkar-loading">
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={[styles.loadingText, androidTextFix]}>{t('loadingAdhkar')}</Text>
      </View>
    );
  }

  return (
    <ThemedBackground testID="adhkar-screen">
      <ErrorBoundary t={t}>
        <UnifiedHeader title={t('adhkar') || 'الأذكار'} testID="adhkar-header" />
        <AdhkarHeader selectedFilter={selectedFilter} onFilterChange={handleFilterChange} />

        <View style={styles.contentContainer}>
          <FlatList
            ref={flatListRef}
            testID="adhkar-list"
            data={filteredAdhkar}
            renderItem={renderAdhkarItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={EmptyStateComponent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            removeClippedSubviews={Platform.OS === 'android'}
            maxToRenderPerBatch={Platform.OS === 'android' ? 4 : 5}
            windowSize={Platform.OS === 'android' ? 5 : 7}
            initialNumToRender={Platform.OS === 'android' ? 4 : 5}
            updateCellsBatchingPeriod={Platform.OS === 'android' ? 50 : 100}
            onEndReachedThreshold={0.3}
            onScrollToIndexFailed={onScrollToIndexFailed}
          />
        </View>
      </ErrorBoundary>
      <View style={{ paddingBottom: Math.max(insets.bottom, 10) }}>
  <AdBanner />
</View>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IVORY,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 24,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: DEEP_GREEN,
    borderRadius: 12,
    overflow: 'hidden' as const,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
    fontSize: 14,
  },
  loadingText: {
    fontSize: 15,
    color: TEXT_MUTED,
    marginTop: 12,
    fontWeight: '500' as const,
  },
  headerSection: {
    backgroundColor: CARD_WHITE,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: CARD_WHITE,
    overflow: 'hidden' as const,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    gap: 6,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: DEEP_GREEN,
  },
  contentContainer: {
    flex: 1,
  },
  adhkarCard: {
    borderRadius: 18,
    marginBottom: 14,
    backgroundColor: CREAM,
    borderWidth: 1,
    borderColor: GOLD + '35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 6,
  },
  adhkarCardTouchable: {
    padding: 18,
    overflow: 'hidden' as const,
    borderRadius: 18,
  },
  cardAccentBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 4,
    height: '100%',
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  adhkarCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  actionIcon: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    overflow: 'hidden' as const,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  androidCardBody: {
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 2,
    marginBottom: 4,
  },
  ornamentContainer: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ornamentDiamond: {
    width: 10,
    height: 10,
    backgroundColor: GOLD,
    transform: [{ rotate: '45deg' }],
    borderRadius: 1,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  dhikrTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: DEEP_GREEN,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  adhkarMainContentAndroid: {
    gap: 12,
    paddingVertical: 4,
  },
  adhkarArabicTextFull: {
    fontSize: 19,
    lineHeight: 34,
    color: DEEP_GREEN,
    textAlign: 'right',
    fontWeight: '700' as const,
    letterSpacing: 0.3,
    writingDirection: 'rtl',
    flexWrap: 'wrap',
  },
  adhkarTransliterationFull: {
    fontSize: 15,
    color: DEEP_GREEN,
    opacity: 0.65,
    textAlign: 'right',
    lineHeight: 26,
    fontStyle: 'italic',
    fontWeight: '500' as const,
    writingDirection: 'rtl',
  },
  adhkarTranslationFull: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'right',
    lineHeight: 26,
    fontWeight: '400' as const,
    writingDirection: 'rtl',
  },
  counterBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: GOLD + '20',
  },
  sideCounterButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: GOLD + '50',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden' as const,
    elevation: 2,
  },
  sideCounterButtonDisabled: {
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'rgba(0,0,0,0.03)',
    elevation: 0,
  },
  emptyContainer: {
    marginHorizontal: 20,
    marginTop: 60,
  },
  emptyCard: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    backgroundColor: CARD_WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: GOLD + '14',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: DEEP_GREEN,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: TEXT_MUTED,
    marginTop: 8,
    textAlign: 'center',
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 180,
  },
  playAllProgress: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: GOLD,
  },
});
