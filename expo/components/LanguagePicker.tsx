import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Check, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTheme } from '@/theme/ThemeProvider';
import { AVAILABLE_LANGUAGES } from '@/constants/translations';

interface LanguagePickerProps {
  visible: boolean;
  onClose: () => void;
}

export const LanguagePicker: React.FC<LanguagePickerProps> = ({
  visible,
  onClose,
}) => {
  const { currentLanguage, changeLanguage, t } = useLanguageStore();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguage);

  const handleLanguageSelect = async (languageCode: string) => {
    if (!languageCode?.trim() || languageCode.length > 10) return;
    const sanitizedCode = languageCode.trim();
    setSelectedLanguage(sanitizedCode);
    await changeLanguage(sanitizedCode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{t('language')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
          {AVAILABLE_LANGUAGES.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageItem,
                { backgroundColor: theme.surface, borderColor: theme.border },
                selectedLanguage === language.code && { 
                  backgroundColor: theme.primary + '15',
                  borderColor: theme.primary,
                  borderWidth: 2
                },
              ]}
              onPress={() => handleLanguageSelect(language.code)}
              activeOpacity={0.7}
            >
              <View style={styles.languageInfo}>
                <Text style={[
                  styles.languageName, 
                  { color: theme.text },
                  selectedLanguage === language.code && { color: theme.primary, fontWeight: '700' }
                ]}>
                  {language.nativeName}
                </Text>
                <Text style={[
                  styles.languageCode, 
                  { color: theme.textSecondary },
                  selectedLanguage === language.code && { color: theme.primary, opacity: 0.8 }
                ]}>
                  {language.name}
                </Text>
              </View>
              
              {selectedLanguage === language.code && (
                <View style={[styles.checkContainer, { backgroundColor: theme.primary }]}>
                  <Check size={18} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            {t('language')} • {AVAILABLE_LANGUAGES.length} languages
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    minHeight: 72,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  languageCode: {
    fontSize: 14,
    opacity: 0.7,
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.6,
  },
});