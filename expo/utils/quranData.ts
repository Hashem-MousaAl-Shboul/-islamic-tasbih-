import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { SURAHS } from '@/constants/quran-meta';

interface SurahDisplayProps {
  surahNumber: number;
  verses: string[];
}

export default function SurahDisplay({ surahNumber, verses }: SurahDisplayProps) {
  const surah = SURAHS.find(s => s.number === surahNumber);

  if (!surah) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.page}>
          {/* رأس الصفحة */}
          <View style={styles.pageHeader}>
            <Text style={styles.surahTitle}>{surah.name}</Text>
            <Text style={styles.surahSubtitle}>{surah.englishTranslation}</Text>
          </View>

          {/* الحدود العلوية */}
          <View style={styles.borderTop}>
            <View style={styles.borderLine} />
            <View style={styles.cornerOrnament} />
            <View style={styles.borderLine} />
          </View>

          {/* محتوى الآيات مثل المصحف */}
          <View style={styles.ayatContainer}>
            {verses.map((verse, index) => (
              <View key={index} style={styles.ayatWrapper}>
                <Text style={styles.ayahText}>{verse}</Text>
                <View style={styles.ayahNumber}>
                  <Text style={styles.ayahNumberText}>{index + 1}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* الحدود السفلية */}
          <View style={styles.borderBottom}>
            <View style={styles.cornerOrnament} />
            <View style={styles.borderLine} />
            <View style={styles.cornerOrnament} />
          </View>

          {/* رقم الصفحة */}
          <View style={styles.pageNumber}>
            <Text style={styles.pageNumberText}>1</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DDE6D6',
  },
  scrollContent: {
    padding: 12,
    alignItems: 'center',
  },
  page: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#F8F5E6',
    borderRadius: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: '#B8976A',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  pageHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  surahTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1B4332',
  },
  surahSubtitle: {
    fontSize: 14,
    color: '#52796F',
  },
  borderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  borderBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  borderLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#B8976A',
  },
  cornerOrnament: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D8F3DC',
    borderWidth: 1,
    borderColor: '#B8976A',
  },
  ayatContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    writingDirection: 'rtl',
    gap: 0,
  },
  ayatWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  ayahText: {
    fontSize: 20,
    lineHeight: 38,
    color: '#1B4332',
    textAlign: 'right',
  },
  ayahNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#B8976A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  ayahNumberText: {
    fontSize: 11,
    color: '#1B4332',
    fontWeight: '600',
  },
  pageNumber: {
    marginTop: 8,
    alignSelf: 'center',
  },
  pageNumberText: {
    fontSize: 12,
    color: '#748C7F',
  },
});
