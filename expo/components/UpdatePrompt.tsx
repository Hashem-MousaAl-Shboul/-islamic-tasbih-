import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { DownloadCloud } from 'lucide-react-native';

import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTheme } from '@/theme/ThemeProvider';
import { createShadow } from '@/utils/shadowUtils';

// ألوان هوية التطبيق (أخضر داكن + ذهبي)
const DEEP_GREEN = '#1B4332';
const GOLD = '#D4A853';

interface UpdatePromptProps {
  visible: boolean;
  mandatory: boolean;
  message: string;
  onUpdate: () => void;
  onDismiss: () => void;
}

/**
 * نافذة تنبيه التحديث داخل التطبيق — بهوية التطبيق (أخضر داكن/ذهبي).
 * زر «تحديث الآن» يفتح واجهة المتجر الرسمية لإتمام التثبيت.
 */
export default function UpdatePrompt({
  visible,
  mandatory,
  message,
  onUpdate,
  onDismiss,
}: UpdatePromptProps) {
  const { t } = useLanguageStore();
  const tokens = useTheme();
  const isDark = tokens.mode === 'dark';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} disabled={mandatory} />
        <View
          style={[
            styles.card,
            isDark && { backgroundColor: '#232838' },
            ...[createShadow({ offsetY: 6, opacity: 0.25, blur: 24, elevation: 12 })],
          ]}
        >
          <View style={styles.iconWrap}>
            <DownloadCloud size={30} color={GOLD} strokeWidth={1.8} />
          </View>

          <Text style={[styles.title, androidFix]}>
            {t('updateAvailableTitle')}
          </Text>
          <Text style={[styles.body, androidFix]} numberOfLines={4}>
            {message && message.trim().length > 0 ? message : t('updateAvailableBody')}
          </Text>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={onUpdate}
            activeOpacity={0.85}
            testID="update-now-button"
          >
            <DownloadCloud size={18} color={DEEP_GREEN} strokeWidth={2.2} />
            <Text style={[styles.updateButtonText, androidFix]}>
              {t('updateNow')}
            </Text>
          </TouchableOpacity>

          {!mandatory && (
            <TouchableOpacity onPress={onDismiss} activeOpacity={0.7} style={styles.laterButton}>
              <Text style={[styles.laterButtonText, androidFix]}>{t('updateLater')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

// تثبيت اتجاه نصوص العربية على أندرويد
const androidFix = { writingDirection: 'rtl' as const };

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27,31,46,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212,168,83,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: DEEP_GREEN,
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5A6B5E',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GOLD,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    width: '100%',
  },
  updateButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: DEEP_GREEN,
  },
  laterButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  laterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A9B91',
  },
});
