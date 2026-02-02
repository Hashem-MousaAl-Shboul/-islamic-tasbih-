import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Target, Award, Calendar } from 'lucide-react-native';

interface TasbihStatsProps {
  totalCount: number;
  todayCount: number;
  completedToday: number;
  totalItems: number;
  streakDays: number;
}

const TasbihStats = memo<TasbihStatsProps>(({ 
  totalCount, 
  todayCount, 
  completedToday, 
  totalItems, 
  streakDays
}) => {
  const completionPercentage = useMemo(() => {
    return totalItems > 0 ? Math.round((completedToday / totalItems) * 100) : 0;
  }, [completedToday, totalItems]);

  const statsData = useMemo(() => [
    {
      id: 'today',
      icon: TrendingUp,
      value: todayCount.toLocaleString('en-US'),
      label: 'اليوم',
      subtitle: 'تسبيحات',
      colors: ['#10B981', '#10B98140'] as const,
    },
    {
      id: 'completion',
      icon: Target,
      value: `${completionPercentage}%`,
      label: 'مكتمل',
      subtitle: `${completedToday}/${totalItems}`,
      colors: ['#3B82F6', '#3B82F640'] as const,
    },
    {
      id: 'total',
      icon: Award,
      value: totalCount.toLocaleString('en-US'),
      label: 'الإجمالي',
      subtitle: 'كل الوقت',
      colors: ['#8B5CF6', '#8B5CF640'] as const,
    },
    {
      id: 'streak',
      icon: Calendar,
      value: streakDays,
      label: 'متتالية',
      subtitle: 'أيام',
      colors: ['#F59E0B', '#F59E0B40'] as const,
    },
  ], [todayCount, completionPercentage, totalCount, streakDays, completedToday, totalItems]);

  return (
    <View style={styles.container} testID="tasbih-stats">
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إحصائيات العد اليومي</Text>
      </View>
      <View style={styles.statsGrid}>
        {statsData.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <LinearGradient
              key={stat.id}
              colors={stat.colors}
              style={styles.statCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <IconComponent size={18} color="#FFFFFF" />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              {stat.subtitle && (
                <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
              )}
            </LinearGradient>
          );
        })}
      </View>
    </View>
  );
});

TasbihStats.displayName = 'TasbihStats';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: Platform.select({ ios: 0.2, android: 0.3, web: 0.1 }),
    shadowRadius: 6,
    elevation: 6,
    gap: 3,
    minHeight: 60,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 8,
    fontWeight: '500' as const,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default TasbihStats;