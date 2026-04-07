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

export default function TermsOfUseScreen() {
  console.log('[TermsOfUse] Screen rendered');
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguageStore();

  return (
    <View style={styles.container} testID="terms-of-use-screen" accessibilityLabel="Terms of Use Screen"
      accessibilityHint="Read our terms of use">
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            testID="terms-back-button"
          >
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('terms')}</Text>
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

          <Text style={styles.sectionHeading}>1. Acceptance of Terms</Text>
          <Text style={styles.bodyText}>
            By downloading, installing, or using the Subbah (سبّح) application, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the application.
          </Text>

          <Text style={styles.sectionHeading}>2. Description of Service</Text>
          <Text style={styles.bodyText}>
            Subbah is a free Islamic Dhikr and Tasbih application designed to help Muslims in their daily remembrance of Allah. The app provides:{'\n\n'}
            • Digital tasbih (prayer bead) counter{'\n'}
            • Collection of morning, evening, and after-prayer adhkar{'\n'}
            • Statistics and progress tracking{'\n'}
            • Customizable themes and settings{'\n'}
            • Audio recitations of dhikr and Quran
          </Text>

          <Text style={styles.sectionHeading}>3. User Responsibilities</Text>
          <Text style={styles.bodyText}>
            As a user of Subbah, you agree to:{'\n\n'}
            • Use the app for its intended purpose of Islamic remembrance and worship{'\n'}
            • Not attempt to reverse-engineer, modify, or distribute the application{'\n'}
            • Not use the app for any unlawful purpose{'\n'}
            • Keep the app updated to the latest version for the best experience
          </Text>

          <Text style={styles.sectionHeading}>4. Intellectual Property</Text>
          <Text style={styles.bodyText}>
            All content, design, graphics, and code within the Subbah application are the intellectual property of the Subbah development team. The Islamic texts, adhkar, and duas are sourced from authentic Islamic references and are provided for educational and worship purposes.
          </Text>

          <Text style={styles.sectionHeading}>5. Disclaimer</Text>
          <Text style={styles.bodyText}>
            The app is provided "as is" without warranties of any kind. While we strive to ensure the accuracy of all Islamic content, we recommend verifying with qualified scholars for any religious questions. We are not responsible for any loss of data stored locally on your device.
          </Text>

          <Text style={styles.sectionHeading}>6. Limitation of Liability</Text>
          <Text style={styles.bodyText}>
            Subbah and its developers shall not be liable for any indirect, incidental, special, or consequential damages arising from the use or inability to use the application.
          </Text>

          <Text style={styles.sectionHeading}>7. In-App Purchases</Text>
          <Text style={styles.bodyText}>
            Some features may require in-app purchases. All purchases are final and non-refundable unless required by applicable law. Refund requests should be directed to the respective app store (Apple App Store or Google Play Store).
          </Text>

          <Text style={styles.sectionHeading}>8. Modifications to Terms</Text>
          <Text style={styles.bodyText}>
            We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting within the application. Continued use of the app after changes constitutes acceptance of the new terms.
          </Text>

          <Text style={styles.sectionHeading}>9. Termination</Text>
          <Text style={styles.bodyText}>
            We reserve the right to terminate or suspend access to the application at any time, without notice, for conduct that we believe violates these Terms of Use or is harmful to other users or the application.
          </Text>

          <Text style={styles.sectionHeading}>10. Contact Us</Text>
          <Text style={styles.bodyText}>
            If you have any questions about these Terms of Use, please contact us at:{'\n\n'}
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
});
