import React, { useState, useCallback, useMemo, memo, useDeferredValue, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Platform, ScrollView, Pressable, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLanguageStore } from '@/hooks/useLanguageStore';

import { useFavoritesStore } from '@/hooks/useFavoritesStore';
import { ADHKAR_LIST } from '@/constants/dhikr';
import { Sparkles, Sun, Moon, Clock, Heart, Star, Share2, MoonStar, Sunrise } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';


console.log('[AdhkarScreen] module loaded');

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

const FilterButtonComponent: React.FC<FilterButtonProps> = ({ filter, selectedFilter, onPress, label }) => {
  const isSelected = selectedFilter === filter;

  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
    
    onPress(filter);
  }, [filter, onPress]);

  const iconColor = isSelected ? '#FFFFFF' : undefined;
  const renderIcon = () => {
    switch (filter) {
      case 'all':
        return <Sparkles size={16} color={iconColor ?? '#1a5c4c'} />;
      case 'morning':
        return <Sun size={16} color={iconColor ?? '#F59E0B'} />;
      case 'evening':
        return <Moon size={16} color={iconColor ?? '#8B5CF6'} />;
      case 'after-prayer':
        return <Clock size={16} color={iconColor ?? '#10B981'} />;
      case 'duas':
        return <Heart size={16} color={iconColor ?? '#EF4444'} />;
      case 'sleep':
        return <MoonStar size={16} color={iconColor ?? '#6366F1'} />;
      case 'wakeup':
        return <Sunrise size={16} color={iconColor ?? '#F97316'} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.filterButtonContainer} testID={`filter-${filter}`}>
      <Pressable 
        style={[styles.filterButton, isSelected && styles.filterButtonActive]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`تصفية ${label}`}
      >
        <View style={styles.filterButtonGradient}>
          <View style={styles.filterButtonIcon}>
            {renderIcon()}
          </View>
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
}

const AdhkarCardComponent: React.FC<AdhkarCardProps> = ({ item, index, reducedMotion, isFavorite, onToggleFavorite, onShare }) => {
  const { t } = useLanguageStore();
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleCardPress = useCallback(() => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
    setExpanded(prev => !prev);
  }, []);

  const handleToggleFavorite = useCallback((e?: any) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
    onToggleFavorite(item.id);
  }, [item.id, onToggleFavorite]);

  const handleShare = useCallback((e?: any) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptic feedback error:', error);
      }
    }
    onShare(item);
  }, [item, onShare]);


  const getCategoryIcon = (category: string) => {
    const size = 16;
    switch (category) {
      case 'morning': return <Sun size={size} color="#F59E0B" />;
      case 'evening': return <Moon size={size} color="#8B5CF6" />;
      case 'after-prayer': return <Clock size={size} color="#10B981" />;
      case 'duas': return <Heart size={size} color="#EF4444" />;
      case 'sleep': return <MoonStar size={size} color="#6366F1" />;
      case 'wakeup': return <Sunrise size={size} color="#F97316" />;
      default: return <Sparkles size={size} color="#F59E0B" />;
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'morning': return { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.36)' };
      case 'evening': return { bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.36)' };
      case 'after-prayer': return { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.36)' };
      case 'duas': return { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.36)' };
      case 'sleep': return { bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.36)' };
      case 'wakeup': return { bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.36)' };
      default: return { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.36)' };
    }
  };

  const categoryColors = getCategoryColor(item.category);

  return (
    <View 
      style={[
        styles.adhkarCard,
        { 
          shadowColor: categoryColors.border,
        }
      ]}
      testID={`adhkar-card-${item.id}`}
    >
      <Pressable 
        style={styles.adhkarCardTouchable}
        testID={`adhkar-item-${item.id}`}
        onPress={handleCardPress}
        accessibilityRole="button"
        accessibilityLabel="فتح وضع القراءة"
        accessibilityState={{ expanded }}
      >
        <View style={styles.adhkarCardHeader}>
          <View style={[styles.categoryContainer, { 
            backgroundColor: categoryColors.bg
          }]}
          >
            {getCategoryIcon(item.category)}
            <Text style={styles.categoryText}>{getCategoryLabel(item.category)}</Text>
          </View>
          <View style={styles.headerActions}>
            {Platform.OS === 'web' ? (
              <>
                <View
                  style={[styles.favoriteIcon, isFavorite && styles.favoriteIconActive]}
                  onStartShouldSetResponder={() => true}
                  onResponderRelease={handleToggleFavorite}
                  testID="adhkar-favorite-button"
                  accessibilityLabel="إضافة للمفضلة"
                >
                  <Star 
                    size={18} 
                    color={isFavorite ? '#FFFFFF' : '#F59E0B'} 
                    fill={isFavorite ? '#F59E0B' : 'transparent'} 
                    strokeWidth={1.5} 
                  />
                </View>
                <View
                  style={styles.shareIcon}
                  onStartShouldSetResponder={() => true}
                  onResponderRelease={handleShare}
                  testID="adhkar-share-button"
                  accessibilityLabel="مشاركة الذكر"
                >
                  <Share2 size={16} color="#3B82F6" strokeWidth={1.5} />
                </View>
              </>
            ) : (
              <>
                <Pressable 
                  style={[styles.favoriteIcon, isFavorite && styles.favoriteIconActive]}
                  onPress={handleToggleFavorite}
                  testID="adhkar-favorite-button"
                  accessibilityRole="button"
                  accessibilityLabel="إضافة للمفضلة"
                >
                  <Star 
                    size={18} 
                    color={isFavorite ? '#FFFFFF' : '#F59E0B'} 
                    fill={isFavorite ? '#F59E0B' : 'transparent'} 
                    strokeWidth={1.5} 
                  />
                </Pressable>
                <Pressable 
                  style={styles.shareIcon}
                  onPress={handleShare}
                  testID="adhkar-share-button"
                  accessibilityRole="button"
                  accessibilityLabel="مشاركة الذكر"
                >
                  <Share2 size={16} color="#3B82F6" strokeWidth={1.5} />
                </Pressable>
              </>
            )}

          </View>
        </View>

        <View style={styles.adhkarMainContent}>
          <View style={styles.arabicTextContainer}>
            <Text
              style={[styles.adhkarArabicText, expanded && styles.adhkarArabicTextExpanded]}
              testID="adhkar-arabic-text"
              selectable
            >
              {item.arabicText}
            </Text>
          </View>

          {item.transliteration && (
            <View style={styles.transliterationContainer}>
              <View style={styles.transliterationIcon}>
                <View style={styles.transliterationDot} />
              </View>
              <Text
                style={[styles.adhkarTransliteration, expanded && styles.adhkarTransliterationExpanded]}
                numberOfLines={expanded ? undefined : 3}
                selectable
              >
                {item.transliteration}
              </Text>
            </View>
          )}

          {item.translation && (
            <View style={styles.translationContainer}>
              <View style={styles.translationIcon}>
                <View style={styles.translationDot} />
              </View>
              <Text
                style={[styles.adhkarTranslation, expanded && styles.adhkarTranslationExpanded]}
                numberOfLines={expanded ? undefined : 3}
                selectable
              >
                {item.translation}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.adhkarFooter}>
          <View style={styles.readingIndicator}>
            <View style={styles.readingDot} />
            <Text style={styles.readingText}>{expanded ? t('readingModeActive') : t('tapToRead')}</Text>
          </View>
        </View>


      </Pressable>
    </View>
  );
};

const AdhkarCard = memo(
  AdhkarCardComponent,
  (prev, next) => prev.item.id === next.item.id && prev.item.arabicText === next.item.arabicText && prev.item.transliteration === next.item.transliteration && prev.item.translation === next.item.translation && prev.index === next.index && prev.reducedMotion === next.reducedMotion
);

AdhkarCard.displayName = 'AdhkarCard';

const AdhkarHeader = memo<{ selectedFilter: FilterType; onFilterChange: (filter: FilterType) => void }>(({ selectedFilter, onFilterChange }) => {
  const { t } = useLanguageStore();
  
  return (
    <View style={styles.headerSection}>
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
          style={styles.filterScrollView}
        >
          <FilterButton
            filter="all"
            selectedFilter={selectedFilter}
            onPress={onFilterChange}
            label={t('allAdhkar')}
          />
          <FilterButton
            filter="morning"
            selectedFilter={selectedFilter}
            onPress={onFilterChange}
            label={t('morning')}
          />
          <FilterButton
            filter="evening"
            selectedFilter={selectedFilter}
            onPress={onFilterChange}
            label={t('evening')}
          />
          <FilterButton
            filter="after-prayer"
            selectedFilter={selectedFilter}
            onPress={onFilterChange}
            label={t('afterPrayer')}
          />
          <FilterButton
            filter="duas"
            selectedFilter={selectedFilter}
            onPress={onFilterChange}
            label={t('duas')}
          />
          <FilterButton
            filter="sleep"
            selectedFilter={selectedFilter}
            onPress={onFilterChange}
            label={t('sleepAdhkar')}
          />
          <FilterButton
            filter="wakeup"
            selectedFilter={selectedFilter}
            onPress={onFilterChange}
            label={t('wakeupAdhkar')}
          />
          <FilterButton
            filter="favorites"
            selectedFilter={selectedFilter}
            onPress={onFilterChange}
            label={t('favorites')}
          />
        </ScrollView>
      </View>
    </View>
  );
});

AdhkarHeader.displayName = 'AdhkarHeader';

const EmptyStateComponent = memo(function EmptyStateComponent() {
  const { t } = useLanguageStore();
  return (
    <View style={styles.emptyContainer} testID="adhkar-empty">
      <View style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Sparkles size={48} color="#F59E0B" />
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
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.log('[AdhkarScreen] Caught error:', error);
  }
  handleRetry = () => {
    this.setState({ hasError: false });
  };
  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.center, styles.errorContainer]} testID="adhkar-error">
          <Text style={styles.emptyTitle}>{this.props.t('error')}</Text>
          <Text style={styles.emptySubtitle}>{this.props.t('pleaseTryAgain')}</Text>
          <Pressable onPress={this.handleRetry} style={[styles.actionButton, styles.retryButton]} accessibilityRole="button">
            <Text style={styles.readingText}>{this.props.t('retry')}</Text>
          </Pressable>
        </View>
      );
    }
    return <>{this.props.children}</>;
  }
}

function useReducedMotion(): boolean {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  }
  return false;
}

export default function AdhkarScreen() {
  const { isLoading } = useLanguageStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const deferredFilter = useDeferredValue<FilterType>(selectedFilter);


  useEffect(() => {
    console.log('[AdhkarScreen] Screen mounted');
  }, []);

  const filteredAdhkar = useMemo(() => {
    console.log(`[AdhkarScreen] Filtering adhkar for category: ${deferredFilter}`);
    let filtered = ADHKAR_LIST;
    
    if (deferredFilter === 'favorites') {
      filtered = ADHKAR_LIST.filter(item => isFavorite(item.id));
    } else if (deferredFilter !== 'all') {
      filtered = ADHKAR_LIST.filter(item => item.category === deferredFilter);
    }
    
    console.log(`[AdhkarScreen] Found ${filtered.length} adhkar items`);
    return filtered;
  }, [deferredFilter, isFavorite]);

  const reducedMotion = useReducedMotion();

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
      
      console.log(`[AdhkarScreen] Shared adhkar: ${item.id}`);
    } catch (error) {
      console.error('[AdhkarScreen] Share error:', error);
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
      />
    );
  }, [reducedMotion, isFavorite, toggleFavorite, handleShareAdhkar]);

  const keyExtractor = useCallback((item: AdhkarItem) => item.id, []);

  const handleFilterChange = useCallback((filter: FilterType) => {
    const next = filter;
    setSelectedFilter(next);
    console.log(`[AdhkarScreen] Filter changed to: ${filter}`);
  }, []);

  const { t } = useLanguageStore();
  
  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]} testID="adhkar-loading">
        <ActivityIndicator size="large" color="#1a5c4c" />
        <Text style={styles.loadingText}>{t('loadingAdhkar')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="adhkar-screen">
      <ErrorBoundary t={t}>
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>{t('adhkar')}</Text>
        </View>
        <AdhkarHeader selectedFilter={selectedFilter} onFilterChange={handleFilterChange} />
        
        <View style={styles.contentContainer}>
          <FlatList
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
            getItemLayout={(data, index) => ({
              length: 200,
              offset: 200 * index,
              index,
            })}
          />
        </View>

      </ErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  },
  loadingText: {
    fontSize: 15,
    color: '#666',
    marginTop: 12,
    fontWeight: '500' as const,
  },
  topBar: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#1a5c4c',
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    textAlign: 'left',
    color: '#fff',
    writingDirection: 'rtl',
  },
  headerSection: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e8e5',
    paddingBottom: 8,
  },
  filterSection: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  filterScrollView: {
    maxHeight: 50,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e8e5',
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    minWidth: 80,
  },
  filterButtonActive: {
    borderColor: '#1a5c4c',
    backgroundColor: '#1a5c4c',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  filterButtonContainer: {
  },
  filterButtonIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  adhkarCard: {
    position: 'relative',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#d4ede5',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  adhkarCardTouchable: {
    padding: 20,
    width: '100%',
  },

  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheen: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderRadius: 30,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    opacity: 0.9,
  },
  adhkarCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#1a5c4c',
  },
  favoriteIcon: {
    padding: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  favoriteIconActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  adhkarMainContent: {
    gap: 14,
    marginBottom: 16,
  },
  arabicTextContainer: {
    backgroundColor: 'transparent',
    padding: 0,
    width: '100%',
    minHeight: 80,
  },
  adhkarArabicText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#1a5c4c',
    textAlign: 'right',
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    paddingVertical: 6,
    paddingHorizontal: 4,
    writingDirection: 'rtl',
    flexWrap: 'wrap',
  },
  adhkarArabicTextExpanded: {
    fontSize: 20,
    lineHeight: 34,
    paddingVertical: 8,
  },
  transliterationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    padding: 0,
    gap: 10,
  },
  transliterationIcon: {
    marginTop: 4,
  },
  transliterationDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#F5A623',
  },
  adhkarTransliteration: {
    flex: 1,
    fontSize: 16,
    color: '#1a5c4c',
    opacity: 0.8,
    textAlign: 'right',
    lineHeight: 26,
    fontStyle: 'italic',
    fontWeight: '600' as const,
    writingDirection: 'rtl',
  },
  adhkarTransliterationExpanded: {
    fontSize: 17,
    lineHeight: 28,
  },
  translationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    padding: 0,
    gap: 10,
  },
  translationIcon: {
    marginTop: 4,
  },
  translationDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#4A90D9',
  },
  adhkarTranslation: {
    flex: 1,
    fontSize: 16,
    color: '#1a5c4c',
    opacity: 0.65,
    textAlign: 'right',
    lineHeight: 26,
    fontStyle: 'italic',
    fontWeight: '600' as const,
    writingDirection: 'rtl',
  },
  adhkarTranslationExpanded: {
    fontSize: 17,
    lineHeight: 28,
  },
  adhkarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  readingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#1a5c4c',
  },
  readingText: {
    fontSize: 12,
    color: '#1a5c4c',
    opacity: 0.6,
    fontWeight: '600' as const,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(26, 92, 76, 0.08)',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(26, 92, 76, 0.15)',
  },
  tasbihButton: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tasbihButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  tasbihButtonText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emptyContainer: {
    marginHorizontal: 20,
    marginTop: 40,
  },
  emptyCard: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#d4ede5',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1a5c4c',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  flatListContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 110,
  },

  emptyIcon: {
    opacity: 0.7,
  },
  shareIcon: {
    padding: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});
