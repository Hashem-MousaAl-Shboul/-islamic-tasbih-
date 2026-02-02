import React, { memo, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { X, Palette, Zap, Type } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useTasbihStore } from '@/hooks/useTasbihStore';
import { SettingsItem } from '@/components/SettingsItem';
import i18n from '@/constants/translations';

interface AppearanceSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export const AppearanceSettings = memo(function AppearanceSettings({
  visible,
  onClose,
}: AppearanceSettingsProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { settings, updateSettings } = useTasbihStore();

  const handleToggleSetting = useCallback(
    (key: keyof typeof settings) => (value: boolean) => {
      updateSettings({ [key]: value });
    },
    [updateSettings]
  );

  const handleFontSizeChange = useCallback((size: 'small' | 'medium' | 'large') => {
    updateSettings({ fontSize: size });
  }, [updateSettings]);

  const currentFontSize = settings.fontSize || 'medium';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>{i18n.t('appearance')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('display')}</Text>
            
            <View style={[styles.settingsGroup, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <SettingsItem
                icon={<Palette size={22} color={theme.primary} />}
                title={i18n.t('animations')}
                subtitle={i18n.t('enableAnimations')}
                type="toggle"
                value={settings.animationsEnabled ?? true}
                onToggle={handleToggleSetting('animationsEnabled')}
                variant="grouped"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('typography')}</Text>
            
            <View style={[styles.settingsGroup, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <View style={styles.fontSizeHeader}>
                <Type size={22} color={theme.primary} />
                <Text style={[styles.subsectionTitle, { color: theme.text, marginLeft: 12 }]}>
                  {i18n.t('fontSize')}
                </Text>
              </View>
              
              <View style={styles.fontSizeOptions}>
                {[
                  { key: 'small', label: i18n.t('small'), size: 14 },
                  { key: 'medium', label: i18n.t('medium'), size: 16 },
                  { key: 'large', label: i18n.t('large'), size: 18 }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.fontSizeOption,
                      { borderColor: theme.border, backgroundColor: theme.surface },
                      currentFontSize === option.key && { 
                        borderColor: theme.primary, 
                        backgroundColor: `${theme.primary}15`,
                        borderWidth: 2
                      }
                    ]}
                    onPress={() => handleFontSizeChange(option.key as 'small' | 'medium' | 'large')}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.fontSizeLabel,
                      { color: theme.text, fontSize: option.size },
                      currentFontSize === option.key && { color: theme.primary, fontWeight: '700' }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('performance')}</Text>
            
            <View style={[styles.settingsGroup, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <SettingsItem
                icon={<Zap size={22} color={theme.primary} />}
                title={i18n.t('reducedMotion')}
                subtitle={i18n.t('reduceAnimationsForBetterPerformance')}
                type="toggle"
                value={settings.reducedMotion ?? false}
                onToggle={handleToggleSetting('reducedMotion')}
                variant="grouped"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
});

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
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 0,
  },
  fontSizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  settingsGroup: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  fontSizeOptions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    ...Platform.select({
      web: {
        gap: 12,
      },
      default: {},
    }),
  },
  fontSizeOption: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  fontSizeLabel: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});