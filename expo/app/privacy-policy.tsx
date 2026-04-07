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
import { ArrowLeft } from 'lucide-react-native';
import { useLanguageStore } from '@/hooks/useLanguageStore';

const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';
const IVORY = '#F7F4EE';
const CARD_WHITE = '#FFFFFF';
const TEXT_DARK = '#2C3E2D';
const TEXT_MUTED = '#8A9B91';

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguageStore();

  return (
    <View style={styles.container} testID="privacy-policy-screen" accessibilityLabel="Privacy Policy Screen">
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
          <Text style={styles.lastUpdated}>Last Updated: April 7, 2026</Text>

          <Text style={styles.sectionHeading}>1. Introduction</Text>
          <Text style={styles.bodyText}>
            Welcome to Subbah (سبّح). Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our Islamic Dhikr and Tasbih application.
          </Text>

          <Text style={styles.sectionHeading}>2. Information We Collect</Text>
          <Text style={styles.bodyText}>
            Subbah is designed with your privacy in mind. We collect minimal data:{'\n\n'}
            • <Text style={styles.boldText}>Local Data:</Text> Your tasbih counts, dhikr preferences, app settings, and statistics are stored locally on your device.{'\n\n'}
            • <Text style={styles.boldText}>No Personal Information:</Text> We do not collect your name, email address, phone number, or any personally identifiable information.{'\n\n'}
            • <Text style={styles.boldText}>No Location Data:</Text> We do not access or store your location.{'\n\n'}
            • <Text style={styles.boldText}>No Third-Party Tracking:</Text> We do not use third-party analytics or tracking services.
          </Text>

          <Text style={styles.sectionHeading}>3. How We Use Your Data</Text>
          <Text style={styles.bodyText}>
            All data stored by the app is used solely to provide you with the best dhikr experience:{'\n\n'}
            • Saving your tasbih counter progress{'\n'}
            • Remembering your preferred language and theme settings{'\n'}
            • Displaying your daily and total statistics{'\n'}
            • Maintaining your favorite dhikr selections
          </Text>

          <Text style={styles.sectionHeading}>4. Data Storage</Text>
          <Text style={styles.bodyText}>
            All your data is stored locally on your device using secure storage mechanisms. We do not transmit your personal data to any external servers. If you delete the app, all locally stored data will be permanently removed.
          </Text>

          <Text style={styles.sectionHeading}>5. Data Sharing</Text>
          <Text style={styles.bodyText}>
            We do not sell, trade, or share your data with any third parties. Your dhikr practice is personal and remains private to you.
          </Text>

          <Text style={styles.sectionHeading}>6. Children's Privacy</Text>
          <Text style={styles.bodyText}>
            Subbah is suitable for users of all ages. We do not knowingly collect any personal information from children or any other users.
          </Text>

          <Text style={styles.sectionHeading}>7. Changes to This Policy</Text>
          <Text style={styles.bodyText}>
            We may update this Privacy Policy from time to time. Any changes will be reflected in the app with an updated date. We encourage you to review this policy periodically.
          </Text>

          <Text style={styles.sectionHeading}>8. Contact Us</Text>
          <Text style={styles.bodyText}>
            If you have any questions or concerns about this Privacy Policy, please contact us at:{'\n\n'}
            support@subbah.app
          </Text>
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
  boldText: {
    fontWeight: '600' as const,
    color: DEEP_GREEN,
  },
});
