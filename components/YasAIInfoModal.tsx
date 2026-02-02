import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { X, Brain, Headphones, Volume2, Zap, Star, Globe } from 'lucide-react-native';
import { yasAI, AVAILABLE_RECITERS, DHIKR_AUDIO_LIBRARY } from '@/utils/yasAI';

interface YasAIInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export const YasAIInfoModal: React.FC<YasAIInfoModalProps> = ({ visible, onClose }) => {
  const [stats, setStats] = useState({
    totalDhikr: 0,
    totalReciters: 0,
    totalDuration: 0,
    supportedLanguages: 3
  });

  useEffect(() => {
    const dhikrList = Object.values(DHIKR_AUDIO_LIBRARY);
    const totalDuration = dhikrList.reduce((sum, dhikr) => sum + (dhikr.duration || 0), 0);
    
    setStats({
      totalDhikr: dhikrList.length,
      totalReciters: AVAILABLE_RECITERS.length,
      totalDuration: Math.round(totalDuration / 60), // بالدقائق
      supportedLanguages: 3
    });
  }, []);

  const features = [
    {
      icon: <Brain size={20} color="#10B981" />,
      title: 'ذكاء اصطناعي متقدم',
      description: 'تقنية TTS عالية الجودة لتحويل النص إلى كلام بصوت طبيعي'
    },
    {
      icon: <Headphones size={20} color="#3B82F6" />,
      title: 'أصوات المقرئين',
      description: 'مكتبة شاملة من أصوات كبار المقرئين مثل السديس والشريم والعفاسي'
    },
    {
      icon: <Volume2 size={20} color="#8B5CF6" />,
      title: 'تحكم كامل',
      description: 'تحكم في السرعة ومستوى الصوت وإعدادات التشغيل'
    },
    {
      icon: <Zap size={20} color="#F59E0B" />,
      title: 'أداء سريع',
      description: 'تشغيل فوري مع دعم التشغيل في الخلفية'
    },
    {
      icon: <Globe size={20} color="#EF4444" />,
      title: 'متعدد المنصات',
      description: 'يعمل على الويب والجوال بنفس الجودة'
    },
    {
      icon: <Star size={20} color="#FFD700" />,
      title: 'جودة عالية',
      description: 'ملفات صوتية عالية الجودة مع ضغط محسن'
    }
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Brain size={24} color="#10B981" />
            <Text style={styles.title}>YasAI Library</Text>
            <Text style={styles.subtitle}>مكتبة الذكاء الاصطناعي للأذكار</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* إحصائيات المكتبة */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>إحصائيات المكتبة</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.totalDhikr}</Text>
                <Text style={styles.statLabel}>ذكر وآية</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.totalReciters}</Text>
                <Text style={styles.statLabel}>مقرئ</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.totalDuration}</Text>
                <Text style={styles.statLabel}>دقيقة صوت</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.supportedLanguages}</Text>
                <Text style={styles.statLabel}>لهجة عربية</Text>
              </View>
            </View>
          </View>

          {/* المميزات */}
          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>المميزات الرئيسية</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  {feature.icon}
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* المقرئون المتاحون */}
          <View style={styles.recitersContainer}>
            <Text style={styles.sectionTitle}>المقرئون المتاحون</Text>
            {AVAILABLE_RECITERS.map((reciter) => (
              <View key={reciter.id} style={styles.reciterCard}>
                <View style={styles.reciterInfo}>
                  <Text style={styles.reciterName}>{reciter.nameArabic}</Text>
                  <Text style={styles.reciterNameEn}>{reciter.name}</Text>
                  <Text style={styles.reciterDescription}>{reciter.description}</Text>
                </View>
                <View style={styles.qualityBadge}>
                  <Text style={styles.qualityText}>{reciter.quality === 'high' ? 'عالية' : 'متوسطة'}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* معلومات تقنية */}
          <View style={styles.techContainer}>
            <Text style={styles.sectionTitle}>المعلومات التقنية</Text>
            <View style={styles.techCard}>
              <Text style={styles.techTitle}>تقنيات مدعومة:</Text>
              <Text style={styles.techItem}>• تحويل النص إلى كلام (TTS)</Text>
              <Text style={styles.techItem}>• تشغيل ملفات MP3 عالية الجودة</Text>
              <Text style={styles.techItem}>• دعم React Native Web</Text>
              <Text style={styles.techItem}>• تشغيل في الخلفية</Text>
              <Text style={styles.techItem}>• ضغط صوتي محسن</Text>
            </View>
          </View>

          {/* معلومات الإصدار */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionTitle}>YasAI Library v1.0.0</Text>
            <Text style={styles.versionDescription}>
              مكتبة متقدمة للذكاء الاصطناعي مصممة خصيصاً للتطبيقات الإسلامية.
              تجمع بين أحدث تقنيات الذكاء الاصطناعي وأصوات كبار المقرئين لتوفير تجربة روحانية فريدة.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'right',
  },
  statsContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'right',
  },
  featureDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
    textAlign: 'right',
  },
  recitersContainer: {
    marginBottom: 24,
  },
  reciterCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  reciterInfo: {
    flex: 1,
  },
  reciterName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    textAlign: 'right',
  },
  reciterNameEn: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
    textAlign: 'right',
  },
  reciterDescription: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
  },
  qualityBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qualityText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  techContainer: {
    marginBottom: 24,
  },
  techCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  techTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'right',
  },
  techItem: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
    textAlign: 'right',
  },
  versionContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  versionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#10B981',
    marginBottom: 8,
  },
  versionDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});