import React, { useState, useCallback, useMemo, memo, useDeferredValue, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Platform, ScrollView, Pressable, Share, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguageStore } from '@/hooks/useLanguageStore';

import { useFavoritesStore } from '@/hooks/useFavoritesStore';
import { ADHKAR_LIST } from '@/constants/dhikr';
import { Sparkles, Sun, Moon, Clock, Heart, Star, Share2, MoonStar, Sunrise, Volume2, VolumeX, Square, Headphones } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ttsService } from '@/utils/ttsService';

const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';
const IVORY = '#F7F4EE';
const CARD_WHITE = '#FFFFFF';
const TEXT_MUTED = '#8A9B91';

const ADHKAR_TAG = '[AdhkarScreen]';
console.log(ADHKAR_TAG, 'module loaded');

interface AdhkarItem {
  id: string;
  arabicText: string;
  transliteration?: string;
  translation?: string;
  category: string;
}

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
        accessibilityRole="button"
        accessibilityLabel={`تصفية ${label}`}
      >
        <View style={styles.filterButtonContent}>
          {renderIcon()}
          <Text style={[styles.filterButtonText, isSelected && styles.filterButtonTextActive]}>
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
  speakingId: string | null;
  onSpeak: (item: AdhkarItem) => void;
  onStopSpeak: () => void;
}

const AdhkarCardComponent: React.FC<AdhkarCardProps> = ({ item, index: _index, reducedMotion: _reducedMotion, isFavorite, onToggleFavorite, onShare, speakingId, onSpeak, onStopSpeak }) => {
  const { t } = useLanguageStore();
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleCardPress = useCallback(() => {
    if (Platform.OS !== 'web') {
      try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (error) { console.log('Haptic error:', error); }
    }
    setExpanded(prev => !prev);
  }, []);

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

  const isSpeaking = speakingId === item.id;

  const handleSpeak = useCallback((e?: any) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (Platform.OS !== 'web') {
      try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (error) { console.log('Haptic error:', error); }
    }
    if (isSpeaking) {
      onStopSpeak();
    } else {
      onSpeak(item);
    }
  }, [item, isSpeaking, onSpeak, onStopSpeak]);

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

  return (
    <View style={styles.adhkarCard} testID={`adhkar-card-${item.id}`}>
      <Pressable
        style={styles.adhkarCardTouchable}
        testID={`adhkar-item-${item.id}`}
        onPress={handleCardPress}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={[styles.cardAccentBar, { backgroundColor: accent }]} />

        <View style={styles.adhkarCardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: accent + '14' }]}>
            {getCategoryIcon(item.category)}
            <Text style={[styles.categoryText, { color: accent }]}>{getCategoryLabel(item.category)}</Text>
          </View>
          <View style={styles.headerActions}>
            {Platform.OS === 'web' ? (
              <>
                <View
                  style={[styles.actionIcon, isFavorite && { backgroundColor: GOLD + '20' }]}
                  onStartShouldSetResponder={() => true}
                  onResponderRelease={handleToggleFavorite}
                  testID="adhkar-favorite-button"
                >
                  <Star size={16} color={isFavorite ? GOLD : TEXT_MUTED} fill={isFavorite ? GOLD : 'transparent'} strokeWidth={1.5} />
                </View>
                <View
                  style={styles.actionIcon}
                  onStartShouldSetResponder={() => true}
                  onResponderRelease={handleShare}
                  testID="adhkar-share-button"
                >
                  <Share2 size={15} color={TEXT_MUTED} strokeWidth={1.5} />
                </View>
              </>
            ) : (
              <>
                <Pressable
                  style={[styles.actionIcon, isFavorite && { backgroundColor: GOLD + '20' }]}
                  onPress={handleToggleFavorite}
                  testID="adhkar-favorite-button"
                  accessibilityRole="button"
                >
                  <Star size={16} color={isFavorite ? GOLD : TEXT_MUTED} fill={isFavorite ? GOLD : 'transparent'} strokeWidth={1.5} />
                </Pressable>
                <Pressable
                  style={styles.actionIcon}
                  onPress={handleShare}
                  testID="adhkar-share-button"
                  accessibilityRole="button"
                >
                  <Share2 size={15} color={TEXT_MUTED} strokeWidth={1.5} />
                </Pressable>
              </>
            )}
          </View>
        </View>

        <View style={styles.speakRow}>
          {Platform.OS === 'web' ? (
            <View
              style={[styles.speakButton, isSpeaking && styles.speakButtonActive]}
              onStartShouldSetResponder={() => true}
              onResponderRelease={handleSpeak}
              testID="adhkar-speak-button"
            >
              {isSpeaking ? (
                <VolumeX size={16} color="#FFFFFF" />
              ) : (
                <Volume2 size={16} color={accent} />
              )}
              <Text style={[styles.speakButtonText, isSpeaking && styles.speakButtonTextActive]}>
                {isSpeaking ? t('stopListening') : t('listenToAdhkar')}
              </Text>
            </View>
          ) : (
            <Pressable
              style={[styles.speakButton, isSpeaking && { backgroundColor: accent }]}
              onPress={handleSpeak}
              testID="adhkar-speak-button"
              accessibilityRole="button"
            >
              {isSpeaking ? (
                <VolumeX size={16} color="#FFFFFF" />
              ) : (
                <Volume2 size={16} color={accent} />
              )}
              <Text style={[styles.speakButtonText, isSpeaking && styles.speakButtonTextActive]}>
                {isSpeaking ? t('stopListening') : t('listenToAdhkar')}
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.adhkarMainContent}>
          <Text
            style={[styles.adhkarArabicText, expanded && styles.adhkarArabicTextExpanded]}
            testID="adhkar-arabic-text"
            selectable
          >
            {item.arabicText}
          </Text>

          {item.transliteration && (
            <Text
              style={[styles.adhkarTransliteration, expanded && styles.adhkarTransliterationExpanded]}
              numberOfLines={expanded ? undefined : 3}
              selectable
            >
              {item.transliteration}
            </Text>
          )}

          {item.translation && (
            <Text
              style={[styles.adhkarTranslation, expanded && styles.adhkarTranslationExpanded]}
              numberOfLines={expanded ? undefined : 3}
              selectable
            >
              {item.translation}
            </Text>
          )}
        </View>

        <View style={styles.adhkarFooter}>
          <View style={styles.readingIndicator}>
            <View style={[styles.readingDot, { backgroundColor: expanded ? accent : TEXT_MUTED }]} />
            <Text style={[styles.readingText, expanded && { color: accent }]}>
              {expanded ? t('readingModeActive') : t('tapToRead')}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const AdhkarCard = memo(
  AdhkarCardComponent,
  (prev, next) => prev.item.id === next.item.id && prev.item.arabicText === next.item.arabicText && prev.item.transliteration === next.item.transliteration && prev.item.translation === next.item.translation && prev.index === next.index && prev.reducedMotion === next.reducedMotion && prev.isFavorite === next.isFavorite && prev.speakingId === next.speakingId
);

AdhkarCard.displayName = 'AdhkarCard';

const AudioWaveAnimation: React.FC<{ color: string; isPlaying: boolean }> = memo(({ color, isPlaying }) => {
  const bars = useRef([0, 1, 2, 3].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    if (isPlaying) {
      const animations = bars.map((bar, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: 1,
              duration: 300 + i * 100,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(bar, {
              toValue: 0.3,
              duration: 300 + i * 100,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
          ])
        )
      );
      animations.forEach(a => a.start());
      return () => animations.forEach(a => a.stop());
    } else {
      bars.forEach(bar => bar.setValue(0.3));
    }
  }, [isPlaying, bars]);

  return (
    <View style={styles.audioWaveContainer}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={[
            styles.audioWaveBar,
            {
              backgroundColor: color,
              height: bar.interpolate({
                inputRange: [0.3, 1],
                outputRange: [6, 16],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
});

AudioWaveAnimation.displayName = 'AudioWaveAnimation';

interface PlayAllButtonProps {
  isPlayingAll: boolean;
  onPlayAll: () => void;
  onStopAll: () => void;
  itemCount: number;
  currentIndex: number;
}

const PlayAllButtonComponent: React.FC<PlayAllButtonProps> = ({ isPlayingAll, onPlayAll, onStopAll, itemCount, currentIndex }) => {
  const { t } = useLanguageStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPlayingAll) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlayingAll, pulseAnim]);

  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) { console.log('Haptic error:', e); }
    }
    if (isPlayingAll) {
      onStopAll();
    } else {
      onPlayAll();
    }
  }, [isPlayingAll, onPlayAll, onStopAll]);

  if (itemCount === 0) return null;

  return (
    <Animated.View style={[styles.playAllContainer, { transform: [{ scale: pulseAnim }] }]}>
      <Pressable
        style={[styles.playAllButton, isPlayingAll && styles.playAllButtonActive]}
        onPress={handlePress}
        testID="play-all-button"
        accessibilityRole="button"
      >
        <View style={styles.playAllLeft}>
          <View style={[styles.playAllIconCircle, isPlayingAll && styles.playAllIconCircleActive]}>
            {isPlayingAll ? (
              <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <Headphones size={18} color={DEEP_GREEN} />
            )}
          </View>
          <View style={styles.playAllTextContainer}>
            <Text style={[styles.playAllTitle, isPlayingAll && styles.playAllTitleActive]}>
              {isPlayingAll ? t('stopListening') : t('listenToAdhkar')}
            </Text>
            {isPlayingAll ? (
              <Text style={styles.playAllProgress}>
                {currentIndex + 1} / {itemCount}
              </Text>
            ) : (
              <Text style={styles.playAllSubtitle}>
                {itemCount} {t('adhkar')}
              </Text>
            )}
          </View>
        </View>
        {isPlayingAll && <AudioWaveAnimation color="#FFFFFF" isPlaying={true} />}
      </Pressable>
    </Animated.View>
  );
};

const PlayAllButton = memo(PlayAllButtonComponent);
PlayAllButton.displayName = 'PlayAllButton';

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
        <Text style={styles.emptyTitle}>{t('noAdhkarInCategory')}</Text>
        <Text style={styles.emptySubtitle}>{t('tryAnotherCategory')}</Text>
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
          <Text style={styles.emptyTitle}>{this.props.t('error')}</Text>
          <Text style={styles.emptySubtitle}>{this.props.t('pleaseTryAgain')}</Text>
          <Pressable onPress={this.handleRetry} style={styles.retryButton} accessibilityRole="button">
            <Text style={styles.retryText}>{this.props.t('retry')}</Text>
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
  const { isLoading } = useLanguageStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const deferredFilter = useDeferredValue<FilterType>(selectedFilter);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [playAllIndex, setPlayAllIndex] = useState<number>(0);
  const playAllCancelledRef = useRef<boolean>(false);
  const flatListRef = useRef<FlatList<AdhkarItem>>(null);

  useEffect(() => {
    console.log(ADHKAR_TAG, 'Screen mounted');
    return () => {
      playAllCancelledRef.current = true;
      ttsService.stop().catch(() => {});
    };
  }, []);

  const filteredAdhkar = useMemo(() => {
    console.log(`${ADHKAR_TAG} Filtering adhkar for category: ${deferredFilter}`);
    let filtered = ADHKAR_LIST;
    if (deferredFilter === 'favorites') {
      filtered = ADHKAR_LIST.filter(item => isFavorite(item.id));
    } else if (deferredFilter !== 'all') {
      filtered = ADHKAR_LIST.filter(item => item.category === deferredFilter);
    }
    console.log(`${ADHKAR_TAG} Found ${filtered.length} adhkar items`);
    return filtered;
  }, [deferredFilter, isFavorite]);

  const reducedMotion = useReducedMotion();

  const handleSpeakAdhkar = useCallback(async (item: AdhkarItem) => {
    try {
      if (isPlayingAll) {
        playAllCancelledRef.current = true;
        await ttsService.stop();
        setIsPlayingAll(false);
      }
      console.log(`${ADHKAR_TAG} Speaking adhkar: ${item.id}`);
      setSpeakingId(item.id);
      await ttsService.playDhikr(item.arabicText);
      setSpeakingId(null);
    } catch (error) {
      console.error(ADHKAR_TAG, 'Speech error:', error);
      setSpeakingId(null);
    }
  }, [isPlayingAll]);

  const handleStopSpeak = useCallback(async () => {
    try {
      console.log(ADHKAR_TAG, 'Stopping speech');
      playAllCancelledRef.current = true;
      await ttsService.stop();
      setSpeakingId(null);
      setIsPlayingAll(false);
      setPlayAllIndex(0);
    } catch (error) {
      console.error(ADHKAR_TAG, 'Stop speech error:', error);
      setSpeakingId(null);
      setIsPlayingAll(false);
    }
  }, []);

  const handlePlayAll = useCallback(async () => {
    if (filteredAdhkar.length === 0) return;
    try {
      console.log(`${ADHKAR_TAG} Playing all ${filteredAdhkar.length} adhkar`);
      playAllCancelledRef.current = false;
      setIsPlayingAll(true);
      setPlayAllIndex(0);

      for (let i = 0; i < filteredAdhkar.length; i++) {
        if (playAllCancelledRef.current) {
          console.log(`${ADHKAR_TAG} Play all cancelled at index ${i}`);
          break;
        }
        const item = filteredAdhkar[i];
        setPlayAllIndex(i);
        setSpeakingId(item.id);

        try {
          flatListRef.current?.scrollToIndex({ index: i, animated: true, viewPosition: 0.3 });
        } catch (scrollErr) {
          console.log(`${ADHKAR_TAG} Scroll error:`, scrollErr);
        }

        await ttsService.playDhikr(item.arabicText);

        if (i < filteredAdhkar.length - 1 && !playAllCancelledRef.current) {
          await new Promise(resolve => setTimeout(resolve, 1200));
        }
      }

      setSpeakingId(null);
      setIsPlayingAll(false);
      setPlayAllIndex(0);
      console.log(`${ADHKAR_TAG} Play all completed`);
    } catch (error) {
      console.error(ADHKAR_TAG, 'Play all error:', error);
      setSpeakingId(null);
      setIsPlayingAll(false);
      setPlayAllIndex(0);
    }
  }, [filteredAdhkar]);

  const handleStopAll = useCallback(async () => {
    playAllCancelledRef.current = true;
    await handleStopSpeak();
  }, [handleStopSpeak]);

  const handleShareAdhkar = useCallback(async (item: AdhkarItem) => {
    try {
      const message = `${item.arabicText}\n\n${item.transliteration || ''}\n\n${item.translation || ''}\n\n— تطبيق الأذكار`;
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ title: 'ذكر', text: message });
        } else {
          await navigator.clipboard.writeText(message);
        }
      } else {
        await Share.share({ message });
      }
      console.log(`${ADHKAR_TAG} Shared adhkar: ${item.id}`);
    } catch (error) {
      console.error(ADHKAR_TAG, 'Share error:', error);
    }
  }, []);

  const renderAdhkarItem = useCallback(({ item, index }: { item: AdhkarItem; index: number }) => {
    return (
      <AdhkarCard
        item={item}
        index={index}
        reducedMotion={reducedMotion}
        isFavorite={isFavorite(item.id)}
        onToggleFavorite={toggleFavorite}
        onShare={handleShareAdhkar}
        speakingId={speakingId}
        onSpeak={handleSpeakAdhkar}
        onStopSpeak={handleStopSpeak}
      />
    );
  }, [reducedMotion, isFavorite, toggleFavorite, handleShareAdhkar, speakingId, handleSpeakAdhkar, handleStopSpeak]);

  const keyExtractor = useCallback((item: AdhkarItem) => item.id, []);

  const handleFilterChange = useCallback((filter: FilterType) => {
    if (isPlayingAll) {
      playAllCancelledRef.current = true;
      ttsService.stop().catch(() => {});
      setIsPlayingAll(false);
      setSpeakingId(null);
      setPlayAllIndex(0);
    }
    setSelectedFilter(filter);
    console.log(`${ADHKAR_TAG} Filter changed to: ${filter}`);
  }, [isPlayingAll]);

  const { t } = useLanguageStore();

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
        <Text style={styles.loadingText}>{t('loadingAdhkar')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="adhkar-screen"
      accessibilityLabel="Adhkar Screen">
      <ErrorBoundary t={t}>
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>{t('adhkar')}</Text>
          <View style={styles.topBarOrnament}>
            <View style={styles.ornamentLine} />
            <View style={styles.ornamentDiamond} />
            <View style={styles.ornamentLine} />
          </View>
        </View>
        <AdhkarHeader selectedFilter={selectedFilter} onFilterChange={handleFilterChange} />

        <PlayAllButton
          isPlayingAll={isPlayingAll}
          onPlayAll={handlePlayAll}
          onStopAll={handleStopAll}
          itemCount={filteredAdhkar.length}
          currentIndex={playAllIndex}
        />

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
            removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={7}
            initialNumToRender={5}
            updateCellsBatchingPeriod={100}
            onEndReachedThreshold={0.3}
            onScrollToIndexFailed={onScrollToIndexFailed}
          />
        </View>
      </ErrorBoundary>
    </View>
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
  topBar: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: DEEP_GREEN,
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    textAlign: 'center',
    color: '#fff',
    writingDirection: 'rtl',
    letterSpacing: 1,
  },
  topBarOrnament: {
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
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
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
    overflow: 'hidden',
    backgroundColor: CARD_WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  adhkarCardTouchable: {
    padding: 18,
  },
  cardAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    height: '100%',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
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
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adhkarMainContent: {
    gap: 10,
    marginBottom: 12,
  },
  adhkarArabicText: {
    fontSize: 18,
    lineHeight: 32,
    color: DEEP_GREEN,
    textAlign: 'right',
    fontWeight: '700' as const,
    letterSpacing: 0.3,
    paddingVertical: 4,
    writingDirection: 'rtl',
    flexWrap: 'wrap',
  },
  adhkarArabicTextExpanded: {
    fontSize: 22,
    lineHeight: 38,
  },
  adhkarTransliteration: {
    fontSize: 15,
    color: DEEP_GREEN,
    opacity: 0.65,
    textAlign: 'right',
    lineHeight: 24,
    fontStyle: 'italic',
    fontWeight: '500' as const,
    writingDirection: 'rtl',
  },
  adhkarTransliterationExpanded: {
    fontSize: 16,
    lineHeight: 26,
  },
  adhkarTranslation: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'right',
    lineHeight: 24,
    fontWeight: '400' as const,
    writingDirection: 'rtl',
  },
  adhkarTranslationExpanded: {
    fontSize: 15,
    lineHeight: 26,
  },
  adhkarFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  readingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  readingText: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: '500' as const,
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
    elevation: 2,
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
  speakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(27,67,50,0.06)',
  },
  speakButtonActive: {
    backgroundColor: DEEP_GREEN,
  },
  speakButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: DEEP_GREEN,
  },
  speakButtonTextActive: {
    color: '#FFFFFF',
  },
  audioWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 18,
  },
  audioWaveBar: {
    width: 3,
    borderRadius: 2,
  },
  playAllContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: IVORY,
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: CARD_WHITE,
    borderWidth: 1.5,
    borderColor: DEEP_GREEN + '20',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  playAllButtonActive: {
    backgroundColor: DEEP_GREEN,
    borderColor: DEEP_GREEN,
    shadowOpacity: 0.15,
  },
  playAllLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  playAllIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DEEP_GREEN + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playAllIconCircleActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  playAllTextContainer: {
    gap: 2,
  },
  playAllTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: DEEP_GREEN,
  },
  playAllTitleActive: {
    color: '#FFFFFF',
  },
  playAllSubtitle: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: TEXT_MUTED,
  },
  playAllProgress: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: GOLD,
  },
});
