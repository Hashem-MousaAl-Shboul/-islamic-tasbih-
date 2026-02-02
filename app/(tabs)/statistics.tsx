import React, { memo, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, StatusBar, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BarChart3,
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

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  iconBgColor: string;
}

const StatCard = memo(function StatCard({ icon, title, value, subtitle, color, iconBgColor }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconContainer, { backgroundColor: iconBgColor }]}>
        {icon}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
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
        <View style={[styles.completionBadge, { backgroundColor: color + '20' }]}>
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
    console.log('[StatisticsScreen] Screen mounted - Stats:', JSON.stringify(stats));
    console.log('[StatisticsScreen] TasbihItems count:', tasbihItems.length);
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
    console.log('[StatisticsScreen] Reset stats button pressed');
    
    if (Platform.OS === 'web') {
      const confirmed = confirm(i18n.t('resetStatsConfirm') || 'هل تريد إعادة تعيين جميع الإحصائيات؟');
      if (confirmed) {
        resetStats();
        setTimeout(() => {
          saveData();
        }, 100);
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
              setTimeout(() => {
                saveData();
              }, 100);
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
    <View style={styles.container} testID="statistics-screen">
      <StatusBar barStyle="light-content" backgroundColor="#1a5c4c" />
      
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <BarChart3 size={24} color="#fff" />
            <Text style={styles.headerTitle}>{i18n.t('statistics') || 'الإحصائيات'}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        testID="statistics-scroll"
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconContainer}>
              <TrendingUp size={28} color="#1a5c4c" />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryTitle}>{i18n.t('totalDhikr') || 'إجمالي الذكر'}</Text>
              <Text style={styles.summaryValue}>{stats.totalCount.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{stats.todayCount}</Text>
              <Text style={styles.summaryStatLabel}>{i18n.t('today') || 'اليوم'}</Text>
            </View>
            <View style={styles.summaryStatDivider} />
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{stats.streakDays}</Text>
              <Text style={styles.summaryStatLabel}>{i18n.t('streakDays') || 'أيام متتالية'}</Text>
            </View>
            <View style={styles.summaryStatDivider} />
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{stats.completedSessions}</Text>
              <Text style={styles.summaryStatLabel}>{i18n.t('sessions') || 'جلسات'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>
            {i18n.t('dailyProgress') || 'التقدم اليومي'}
          </Text>
          <View style={styles.progressCard}>
            <ProgressBar
              progress={dailyGoalProgress}
              color="#1a5c4c"
              label={i18n.t('dailyGoal') || 'الهدف اليومي'}
              value={`${stats.todayCount}/${settings.dailyGoal || 300}`}
            />
            <View style={styles.progressDivider} />
            <ProgressBar
              progress={todayProgress}
              color="#F5A623"
              label={i18n.t('completedDhikr') || 'الأذكار المكتملة'}
              value={`${activeItems.filter(i => i.isCompleted).length}/${activeItems.length}`}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>
            {i18n.t('quickStats') || 'إحصائيات سريعة'}
          </Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon={<Calendar size={22} color="#fff" />}
              title={i18n.t('today') || 'اليوم'}
              value={stats.todayCount}
              color="#4A90D9"
              iconBgColor="#4A90D9"
            />
            <StatCard
              icon={<Flame size={22} color="#fff" />}
              title={i18n.t('streak') || 'متتالية'}
              value={stats.streakDays}
              subtitle={i18n.t('days') || 'أيام'}
              color="#E8734A"
              iconBgColor="#E8734A"
            />
            <StatCard
              icon={<Target size={22} color="#fff" />}
              title={i18n.t('sessions') || 'جلسات'}
              value={stats.completedSessions}
              color="#27AE60"
              iconBgColor="#27AE60"
            />
            <StatCard
              icon={<Award size={22} color="#fff" />}
              title={i18n.t('totalTarget') || 'الهدف الكلي'}
              value={totalTargetCount}
              color="#9B59B6"
              iconBgColor="#9B59B6"
            />
          </View>
        </View>

        {mostUsedDhikr && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>
              {i18n.t('favoritedhikr') || 'الذكر المفضل'}
            </Text>
            <View style={styles.favoriteCard}>
              <View style={styles.favoriteIconContainer}>
                <Star size={24} color="#F5A623" fill="#F5A623" />
              </View>
              <View style={styles.favoriteContent}>
                <Text style={styles.favoriteArabic}>{mostUsedDhikr.arabicText}</Text>
                <Text style={styles.favoriteStats}>
                  {i18n.t('completedTimes') || 'مكتمل'} {mostUsedDhikr.totalCompletions} {i18n.t('times') || 'مرات'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
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
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={handleResetStats} activeOpacity={0.8}>
          <RefreshCw size={20} color="#E74C3C" />
          <Text style={styles.resetButtonText}>{i18n.t('resetStats') || 'إعادة تعيين الإحصائيات'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
});

export default StatisticsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a5c4c',
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#fff',
  },

  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  summaryCard: {
    backgroundColor: '#d4ede5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#1a5c4c',
    opacity: 0.8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1a5c4c',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(26, 92, 76, 0.15)',
    marginVertical: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1a5c4c',
  },
  summaryStatLabel: {
    fontSize: 12,
    color: '#1a5c4c',
    opacity: 0.7,
    marginTop: 4,
  },
  summaryStatDivider: {
    width: 1,
    backgroundColor: 'rgba(26, 92, 76, 0.15)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionTitleRTL: {
    textAlign: 'right',
    marginLeft: 0,
    marginRight: 4,
  },
  progressCard: {
    backgroundColor: '#d4ede5',
    borderRadius: 16,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#1a5c4c',
    fontWeight: '500' as const,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(26, 92, 76, 0.15)',
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
  },
  statCard: {
    backgroundColor: '#d4ede5',
    borderRadius: 16,
    padding: 16,
    width: (SCREEN_WIDTH - 44) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    marginLeft: 12,
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: '#1a5c4c',
    opacity: 0.7,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  statSubtitle: {
    fontSize: 11,
    color: '#1a5c4c',
    opacity: 0.6,
  },
  favoriteCard: {
    backgroundColor: '#d4ede5',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteContent: {
    marginLeft: 16,
    flex: 1,
  },
  favoriteArabic: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1a5c4c',
    marginBottom: 4,
  },
  favoriteStats: {
    fontSize: 14,
    color: '#1a5c4c',
    opacity: 0.7,
  },
  dhikrListCard: {
    backgroundColor: '#d4ede5',
    borderRadius: 16,
    padding: 16,
  },
  dhikrStatItem: {
    paddingVertical: 12,
  },
  dhikrStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dhikrArabicText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1a5c4c',
    flex: 1,
  },
  completionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completionText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  dhikrProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dhikrProgressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(26, 92, 76, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  dhikrProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  dhikrCountText: {
    fontSize: 12,
    color: '#1a5c4c',
    opacity: 0.7,
    minWidth: 50,
    textAlign: 'right',
  },
  dhikrDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(26, 92, 76, 0.15)',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#E74C3C',
  },
});
