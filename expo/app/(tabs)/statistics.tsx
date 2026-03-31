import React, { memo, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TrendingUp,
  Calendar,
  Target,
  Award,
  Flame,
  Star,
  RefreshCw,
} from 'lucide-react-native';
import { useTasbihStore } from '@/hooks/useTasbihStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import i18n from '@/constants/translations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';
const IVORY = '#F7F4EE';
const CARD_WHITE = '#FFFFFF';
const TEXT_MUTED = "#8A9B91";
const STATS_TAG = "[StatisticsScreen]";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
}

const StatCard = memo(function StatCard({ icon, title, value, subtitle, color }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '14' }]}>
        {icon}
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );
});

interface ProgressBarProps {
  progress: number;
  color: string;
  label: string;
  value: string;
}

const ProgressBar = memo(function ProgressBar({ progress, color, label, value }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={[styles.progressValue, { color }]}>{value}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${clampedProgress}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
});

interface DhikrStatItemProps {
  arabicText: string;
  count: number;
  targetCount: number;
  totalCompletions: number;
  color: string;
}

const DhikrStatItem = memo(function DhikrStatItem({ arabicText, count, targetCount, totalCompletions, color }: DhikrStatItemProps) {
  const progress = targetCount > 0 ? (count / targetCount) * 100 : 0;

  return (
    <View style={styles.dhikrStatItem}>
      <View style={styles.dhikrStatHeader}>
        <Text style={styles.dhikrArabicText}>{arabicText}</Text>
        <View style={[styles.completionBadge, { backgroundColor: color + '14' }]}>
          <Text style={[styles.completionText, { color }]}>{totalCompletions}x</Text>
        </View>
      </View>
      <View style={styles.dhikrProgressContainer}>
        <View style={styles.dhikrProgressTrack}>
          <View style={[styles.dhikrProgressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.dhikrCountText}>{count}/{targetCount}</Text>
      </View>
    </View>
  );
});

const StatisticsScreen = memo(function StatisticsScreen() {
  const { stats, tasbihItems, settings, resetStats, saveData } = useTasbihStore();
  const { currentLanguage } = useLanguageStore();
  const insets = useSafeAreaInsets();

  const isRTL = currentLanguage === 'ar' || currentLanguage === 'ur';

  useEffect(() => {
    console.log(STATS_TAG, 'Screen mounted - Stats:', JSON.stringify(stats));
    console.log(STATS_TAG, 'TasbihItems count:', tasbihItems.length);
  }, [stats, tasbihItems]);

  const activeItems = useMemo(() => {
    return tasbihItems.filter(item => !item.isDeleted);
  }, [tasbihItems]);

  const todayProgress = useMemo(() => {
    const completed = activeItems.filter(item => item.isCompleted).length;
    const total = activeItems.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [activeItems]);

  const mostUsedDhikr = useMemo(() => {
    if (activeItems.length === 0) return null;
    return activeItems.reduce((max, item) =>
      item.totalCompletions > (max?.totalCompletions || 0) ? item : max
    , activeItems[0]);
  }, [activeItems]);

  const totalTargetCount = useMemo(() => {
    return activeItems.reduce((sum, item) => sum + item.targetCount, 0);
  }, [activeItems]);

  const dailyGoalProgress = useMemo(() => {
    const goal = settings.dailyGoal || 300;
    return Math.min(Math.round((stats.todayCount / goal) * 100), 100);
  }, [stats.todayCount, settings.dailyGoal]);

  const sortedDhikrItems = useMemo(() => {
    return [...activeItems].sort((a, b) => b.totalCompletions - a.totalCompletions);
  }, [activeItems]);

  const handleResetStats = useCallback(() => {
    console.log(STATS_TAG, 'Reset stats button pressed');

    if (Platform.OS === 'web') {
      const confirmed = confirm(i18n.t('resetStatsConfirm') || 'هل تريد إعادة تعيين جميع الإحصائيات؟');
      if (confirmed) {
        resetStats();
        setTimeout(() => { void saveData(); }, 100);
        alert(i18n.t('statsResetSuccess') || 'تم إعادة تعيين الإحصائيات بنجاح');
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
            onPress: () => {
              resetStats();
              setTimeout(() => { void saveData(); }, 100);
              Alert.alert(
                i18n.t('success') || 'نجاح',
                i18n.t('statsResetSuccess') || 'تم إعادة تعيين الإحصائيات بنجاح'
              );
            },
          },
        ]
      );
    }
  }, [resetStats, saveData]);

  return (
    <View style={styles.container} testID="statistics-screen"
      accessibilityLabel="Statistics Screen">
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>{i18n.t('statistics') || 'الإحصائيات'}</Text>
        <View style={styles.headerOrnament}>
          <View style={styles.ornamentLine} />
          <View style={styles.ornamentDiamond} />
          <View style={styles.ornamentLine} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        testID="statistics-scroll"
        accessibilityLabel="Statistics scroll view"
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIconCircle}>
              <TrendingUp size={24} color={GOLD} />
            </View>
            <Text style={styles.heroLabel}>{i18n.t('totalDhikr') || 'إجمالي الذكر'}</Text>
          </View>
          <Text style={styles.heroValue}>{stats.totalCount.toLocaleString()}</Text>
          <View style={styles.heroDivider} />
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{stats.todayCount}</Text>
              <Text style={styles.heroStatLabel}>{i18n.t('today') || 'اليوم'}</Text>
            </View>
            <View style={styles.heroStatSep} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{stats.streakDays}</Text>
              <Text style={styles.heroStatLabel}>{i18n.t('streakDays') || 'أيام متتالية'}</Text>
            </View>
            <View style={styles.heroStatSep} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{stats.completedSessions}</Text>
              <Text style={styles.heroStatLabel}>{i18n.t('sessions') || 'جلسات'}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>
          {i18n.t('dailyProgress') || 'التقدم اليومي'}
        </Text>
        <View style={styles.progressCard}>
          <ProgressBar
            progress={dailyGoalProgress}
            color={DEEP_GREEN}
            label={i18n.t('dailyGoal') || 'الهدف اليومي'}
            value={`${stats.todayCount}/${settings.dailyGoal || 300}`}
          />
          <View style={styles.progressDivider} />
          <ProgressBar
            progress={todayProgress}
            color={GOLD}
            label={i18n.t('completedDhikr') || 'الأذكار المكتملة'}
            value={`${activeItems.filter(i => i.isCompleted).length}/${activeItems.length}`}
          />
        </View>

        <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>
          {i18n.t('quickStats') || 'إحصائيات سريعة'}
        </Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon={<Calendar size={20} color="#3B7DD8" />}
            title={i18n.t('today') || 'اليوم'}
            value={stats.todayCount}
            color="#3B7DD8"
          />
          <StatCard
            icon={<Flame size={20} color="#E07A3A" />}
            title={i18n.t('streak') || 'متتالية'}
            value={stats.streakDays}
            subtitle={i18n.t('days') || 'أيام'}
            color="#E07A3A"
          />
          <StatCard
            icon={<Target size={20} color="#2D8B6F" />}
            title={i18n.t('sessions') || 'جلسات'}
            value={stats.completedSessions}
            color="#2D8B6F"
          />
          <StatCard
            icon={<Award size={20} color="#8B6BC4" />}
            title={i18n.t('totalTarget') || 'الهدف الكلي'}
            value={totalTargetCount}
            color="#8B6BC4"
          />
        </View>

        {mostUsedDhikr && (
          <>
            <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>
              {i18n.t('favoritedhikr') || 'الذكر المفضل'}
            </Text>
            <View style={styles.favoriteCard}>
              <View style={styles.favoriteIconCircle}>
                <Star size={22} color={GOLD} fill={GOLD} />
              </View>
              <View style={styles.favoriteContent}>
                <Text style={styles.favoriteArabic}>{mostUsedDhikr.arabicText}</Text>
                <Text style={styles.favoriteStats}>
                  {i18n.t('completedTimes') || 'مكتمل'} {mostUsedDhikr.totalCompletions} {i18n.t('times') || 'مرات'}
                </Text>
              </View>
            </View>
          </>
        )}

        <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>
          {i18n.t('dhikrDetails') || 'تفاصيل الأذكار'}
        </Text>
        <View style={styles.dhikrListCard}>
          {sortedDhikrItems.map((item, index) => (
            <View key={item.id}>
              <DhikrStatItem
                arabicText={item.arabicText}
                count={item.count}
                targetCount={item.targetCount}
                totalCompletions={item.totalCompletions}
                color={item.color}
              />
              {index < sortedDhikrItems.length - 1 && <View style={styles.dhikrDivider} />}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={handleResetStats} activeOpacity={0.8}
          testID="reset-stats-button"
          accessibilityRole="button">
          <RefreshCw size={18} color="#D45050" />
          <Text style={styles.resetButtonText}>{i18n.t('resetStats') || 'إعادة تعيين الإحصائيات'}</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
});

export default StatisticsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IVORY,
  },
  header: {
    backgroundColor: DEEP_GREEN,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: '#fff',
    writingDirection: 'rtl',
    paddingTop: 18,
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
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  heroCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: GOLD + '18',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GOLD + '14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: '500' as const,
    writingDirection: 'rtl',
  },
  heroValue: {
    fontSize: 44,
    fontWeight: '800' as const,
    color: DEEP_GREEN,
    marginTop: 4,
    textAlign: 'center',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 18,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: DEEP_GREEN,
  },
  heroStatLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 4,
  },
  heroStatSep: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: TEXT_MUTED,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  sectionTitleRTL: {
    textAlign: 'right',
    marginLeft: 0,
    marginRight: 4,
  },
  progressCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    color: DEEP_GREEN,
    fontWeight: '500' as const,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressDivider: {
    height: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 18,
    padding: 16,
    width: (SCREEN_WIDTH - 44) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statTitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800' as const,
  },
  statSubtitle: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  favoriteCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: GOLD + '18',
  },
  favoriteIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: GOLD + '14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteContent: {
    marginLeft: 16,
    flex: 1,
  },
  favoriteArabic: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: DEEP_GREEN,
    marginBottom: 4,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  favoriteStats: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  dhikrListCard: {
    backgroundColor: CARD_WHITE,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  dhikrStatItem: {
    paddingVertical: 14,
  },
  dhikrStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dhikrArabicText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: DEEP_GREEN,
    flex: 1,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  completionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  completionText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  dhikrProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dhikrProgressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  dhikrProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  dhikrCountText: {
    fontSize: 12,
    color: TEXT_MUTED,
    minWidth: 50,
    textAlign: 'right',
  },
  dhikrDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#D45050',
  },
});
