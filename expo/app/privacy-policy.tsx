import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { contactViaWhatsApp } from '@/utils/globalUtils';

const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';
const IVORY = '#F7F4EE';
const CARD_WHITE = '#FFFFFF';
const TEXT_DARK = '#2C3E2D';
const TEXT_MUTED = '#8A9B91';

export default function PrivacyPolicyScreen() {
  console.log('[PrivacyPolicy] Screen rendered');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguageStore();

  return (
    <View style={styles.container} testID="privacy-policy-screen" accessibilityLabel="Privacy Policy Screen"
      accessibilityHint="Read our privacy policy">
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            testID="privacy-back-button"
          >
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('privacy')}</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.headerOrnament}>
          <View style={styles.ornamentLine} />
          <View style={styles.ornamentDiamond} />
          <View style={styles.ornamentLine} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.lastUpdated}>{t('lastUpdated')}</Text>

          <Text style={styles.sectionHeading}>{t('privacyIntroTitle')}</Text>
          <Text style={styles.bodyText}>{t('privacyIntroText')}</Text>

          <Text style={styles.sectionHeading}>{t('privacyInfoTitle')}</Text>
          <Text style={styles.bodyText}>
            {`\u2022 ${t('privacyInfoLocalData')}\n\n\u2022 ${t('privacyInfoNoPersonal')}\n\n\u2022 ${t('privacyInfoNoLocation')}\n\n\u2022 ${t('privacyInfoNoTracking')}`}
          </Text>

          <Text style={styles.sectionHeading}>{t('privacyUseTitle')}</Text>
          <Text style={styles.bodyText}>{t('privacyUseText')}</Text>

          <Text style={styles.sectionHeading}>{t('privacyStorageTitle')}</Text>
          <Text style={styles.bodyText}>{t('privacyStorageText')}</Text>

          <Text style={styles.sectionHeading}>{t('privacySharingTitle')}</Text>
          <Text style={styles.bodyText}>{t('privacySharingText')}</Text>

          <Text style={styles.sectionHeading}>{t('privacyChildrenTitle')}</Text>
          <Text style={styles.bodyText}>{t('privacyChildrenText')}</Text>

          <Text style={styles.sectionHeading}>{t('privacyChangesTitle')}</Text>
          <Text style={styles.bodyText}>{t('privacyChangesText')}</Text>

          <Text style={styles.sectionHeading}>{t('privacyContactTitle')}</Text>
          <Text style={styles.bodyText}>{t('privacyContactText')}</Text>

          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={contactViaWhatsApp}
            activeOpacity={0.7}
            testID="privacy-whatsapp-button"
          >
            <MessageCircle size={20} color="#fff" />
            <Text style={styles.whatsappButtonText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#fff',
    letterSpacing: 0.5,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  card: {
    backgroundColor: CARD_WHITE,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  lastUpdated: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: DEEP_GREEN,
    marginTop: 22,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: TEXT_DARK,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 18,
    gap: 10,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  whatsappButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    letterSpacing: 0.3,
  },
});
