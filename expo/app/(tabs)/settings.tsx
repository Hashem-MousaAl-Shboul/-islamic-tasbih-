import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Linking,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Globe,
  Palette,
  Vibrate,
  Volume2,
  Star,
  Share2,
  Mail,
  Shield,
  FileText,
  Trash2,
  RotateCcw,
  Moon,
  Sun,
  Info,

  ChevronRight,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTasbihStore } from '@/hooks/useTasbihStore';
import { rateApp, shareApp } from '@/utils/globalUtils';
import { LanguagePicker } from '@/components/LanguagePicker';
import { ColorThemePicker } from '@/components/ColorThemePicker';

import type { ColorThemeKey } from '@/theme/ThemeProvider';

const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';
const IVORY = '#F7F4EE';
const CARD_WHITE = '#FFFFFF';
const TEXT_MUTED = "#8A9B91";
const SETTINGS_TAG = "[SettingsScreen]";

interface SettingsRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'select' | 'action';
  value?: boolean | string;
  onPress?: () => void;
  onToggle?: () => void;
  danger?: boolean;
  isLast?: boolean;
}

function SettingsRow({ icon, title, subtitle, type, value, onPress, onToggle, danger, isLast }: SettingsRowProps) {
  const handlePress = useCallback(() => {
    if (type === 'toggle' && onToggle) {
      onToggle();
    } else if (onPress) {
      onPress();
    }
  }, [type, onToggle, onPress]);

  return (
    <TouchableOpacity
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={handlePress}
      activeOpacity={0.6}
      testID={`settings-row-${title}`}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
          {icon}
        </View>
        <View style={styles.rowTextContainer}>
          <Text style={[styles.rowTitle, danger && styles.dangerText]}>{title}</Text>
          {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={styles.rowRight}>
        {type === 'toggle' ? (
          <Switch
            value={Boolean(value)}
            onValueChange={() => onToggle?.()}
            trackColor={{
              false: Platform.OS === 'android' ? '#d0d0d0' : 'rgba(0,0,0,0.08)',
              true: DEEP_GREEN,
            }}
            thumbColor={Platform.OS === 'android' ? (value ? DEEP_GREEN : '#f4f3f4') : '#FFFFFF'}
            ios_backgroundColor="rgba(0,0,0,0.08)"
            style={Platform.OS === 'android' ? styles.switchAndroid : styles.switchIOS}
            pointerEvents="none"
          />
        ) : null}
        {type === 'select' ? (
          <View style={styles.selectContainer}>
            <Text style={styles.selectValue}>{String(value ?? '')}</Text>
            <ChevronRight size={16} color={TEXT_MUTED} />
          </View>
        ) : null}
        {type === 'action' ? (
          <ChevronRight size={18} color={danger ? '#D45050' : TEXT_MUTED} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { t, getCurrentLanguageInfo } = useLanguageStore();
  const { settings, updateSettings, resetAllData } = useTasbihStore();
  const [showLanguagePicker, setShowLanguagePicker] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

  const languageInfo = useMemo(() => getCurrentLanguageInfo(), [getCurrentLanguageInfo]);

  const handleToggleDarkMode = useCallback(() => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    console.log(SETTINGS_TAG, "Theme toggled to:", newTheme);
    }
  }, [settings.theme, updateSettings]);

  const handleToggleVibration = useCallback(() => {
    updateSettings({ vibrationEnabled: !settings.vibrationEnabled });
    if (!settings.vibrationEnabled) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    console.log(SETTINGS_TAG, "Vibration toggled");
    }
  }, [settings.vibrationEnabled, updateSettings]);

  const handleToggleSound = useCallback(() => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
    console.log(SETTINGS_TAG, 'Sound toggled to:', !settings.soundEnabled);
  }, [settings.soundEnabled, updateSettings]);

  const handleSelectColorTheme = useCallback((themeKey: ColorThemeKey) => {
    updateSettings({ colorTheme: themeKey });
    setShowColorPicker(false);
  }, [updateSettings]);

  const handleRateApp = useCallback(async () => {
    console.log(SETTINGS_TAG, 'Rate app tapped');
    await rateApp();
  }, []);

  const handleShareApp = useCallback(async () => {
    console.log(SETTINGS_TAG, 'Share app tapped');
    await shareApp();
  }, []);

  const handleContactUs = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        Linking.openURL('mailto:support@subbah.app?subject=Subbah%20App%20Support').catch(() => {
          Alert.alert(t('error'), t('noEmailApp'));
        });
        return;
      }
      const MailComposer = await import('expo-mail-composer');
      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: ['support@subbah.app'],
          subject: `${t('appName')} - ${t('contactSupport')}`,
          body: t('contactMessage'),
        });
      } else {
        Linking.openURL('mailto:support@subbah.app?subject=Subbah%20App%20Support').catch(() => {
          Alert.alert(t('error'), t('noEmailApp'));
        });
      }
    } catch (e) {
      console.log(SETTINGS_TAG, 'Mail error:', e);
      Linking.openURL('mailto:support@subbah.app').catch(() => {
        Alert.alert(t('error'), t('contactError'));
      });
    }
  }, [t]);

  const handleResetSettings = useCallback(() => {
    Alert.alert(
      t('resetSettings'),
      t('resetSettingsConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('resetButton'),
          style: 'destructive',
          onPress: async () => {
            try {
              await resetAllData();
              Alert.alert(t('success'), t('settingsResetSuccess'));
            } catch (e) {
              console.log(SETTINGS_TAG, 'Reset error:', e);
              Alert.alert(t('error'), t('resetError'));
            }
          },
        },
      ]
    );
  }, [t, resetAllData]);

  const handleDeleteAllData = useCallback(() => {
    Alert.alert(
      t('deleteAllData'),
      t('resetDataConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await resetAllData();
              Alert.alert(t('success'), t('dataResetSuccess'));
            } catch (e) {
              console.log(SETTINGS_TAG, 'Delete data error:', e);
              Alert.alert(t('error'), t('resetError'));
            }
          },
        },
      ]
    );
  }, [t, resetAllData]);

  const handleOpenPrivacy = useCallback(() => {
    Linking.openURL('https://subbah.app/privacy').catch(() => {
      Alert.alert(t('error'), t('cantOpenLink'));
    });
  }, [t]);

  const handleOpenTerms = useCallback(() => {
    Linking.openURL('https://subbah.app/terms').catch(() => {
      Alert.alert(t('error'), t('cantOpenLink'));
    });
  }, [t]);

  return (
    <View style={styles.container} testID="settings-screen"
      accessibilityLabel="Settings Screen">
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
        <View style={styles.headerOrnament}>
          <View style={styles.ornamentLine} />
          <View style={styles.ornamentDiamond} />
          <View style={styles.ornamentLine} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <Text style={styles.sectionTitle}>{t('appearance')}</Text>
        <View style={styles.card}>
          <SettingsRow
            icon={settings.theme === 'dark'
              ? <Moon size={20} color={DEEP_GREEN} />
              : <Sun size={20} color={GOLD} />}
            title={t('darkMode')}
            subtitle={settings.theme === 'dark' ? t('darkModeEnabled') : t('lightModeEnabled')}
            type="toggle"
            value={settings.theme === 'dark'}
            onToggle={handleToggleDarkMode}
          />
          <SettingsRow
            icon={<Palette size={20} color="#8B6BC4" />}
            title={t('colorTheme')}
            type="select"
            value={t(settings.colorTheme || 'gold')}
            onPress={() => setShowColorPicker(true)}
          />
          <SettingsRow
            icon={<Globe size={20} color="#3B7DD8" />}
            title={t('language')}
            type="select"
            value={languageInfo?.nativeName || 'العربية'}
            onPress={() => setShowLanguagePicker(true)}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>{t('interaction')}</Text>
        <View style={styles.card}>
          <SettingsRow
            icon={<Vibrate size={20} color="#E07A3A" />}
            title={t('vibration')}
            subtitle={t('vibrationOnTap')}
            type="toggle"
            value={settings.vibrationEnabled}
            onToggle={handleToggleVibration}
          />
          <SettingsRow
            icon={<Volume2 size={20} color="#2D8B6F" />}
            title={t('sound')}
            subtitle={t('soundOnInteraction')}
            type="toggle"
            value={settings.soundEnabled}
            onToggle={handleToggleSound}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>{t('contactSupport')}</Text>
        <View style={styles.card}>
          <SettingsRow
            icon={<Star size={20} color={GOLD} />}
            title={t('rateApp')}
            subtitle={t('rateAppDescription')}
            type="action"
            onPress={handleRateApp}
          />
          <SettingsRow
            icon={<Share2 size={20} color="#3B7DD8" />}
            title={t('shareApp')}
            subtitle={t('shareAppDescription')}
            type="action"
            onPress={handleShareApp}
          />
          <SettingsRow
            icon={<Mail size={20} color="#2D8B6F" />}
            title={t('contactUs')}
            subtitle={t('contactUsDescription')}
            type="action"
            onPress={handleContactUs}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>{t('about')}</Text>
        <View style={styles.card}>
          <SettingsRow
            icon={<Shield size={20} color={DEEP_GREEN} />}
            title={t('privacy')}
            subtitle={t('viewPrivacyPolicy')}
            type="action"
            onPress={handleOpenPrivacy}
          />
          <SettingsRow
            icon={<FileText size={20} color={DEEP_GREEN} />}
            title={t('terms')}
            subtitle={t('viewTerms')}
            type="action"
            onPress={handleOpenTerms}
          />
          <SettingsRow
            icon={<Info size={20} color={TEXT_MUTED} />}
            title={t('version')}
            subtitle="1.0.0"
            type="action"
            onPress={() => { console.log(SETTINGS_TAG, "Version tapped"); }}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>{t('dataManagement')}</Text>
        <View style={styles.card}>
          <SettingsRow
            icon={<RotateCcw size={20} color={GOLD} />}
            title={t('resetSettings')}
            subtitle={t('resetSettingsDescription')}
            type="action"
            onPress={handleResetSettings}
          />
          <SettingsRow
            icon={<Trash2 size={20} color="#D45050" />}
            title={t('deleteAllData')}
            subtitle={t('deleteAllDataDescription')}
            type="action"
            onPress={handleDeleteAllData}
            danger
            isLast
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.footerOrnament}>
            <View style={styles.footerLine} />
            <View style={styles.footerDiamond} />
            <View style={styles.footerLine} />
          </View>
          <Text style={styles.footerText}>{t('appName')}</Text>
          <Text style={styles.footerVersion}>v1.0.0</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <LanguagePicker
        visible={showLanguagePicker}
        onClose={() => setShowLanguagePicker(false)}
      />

      <ColorThemePicker
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        currentTheme={(settings.colorTheme as ColorThemeKey) || 'gold'}
        onSelectTheme={handleSelectColorTheme}
      />


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
  headerTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: '#fff',
    writingDirection: 'rtl',
    paddingTop: 18,
    letterSpacing: 1,
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: TEXT_MUTED,
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: CARD_WHITE,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 62,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: IVORY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  rowIconDanger: {
    backgroundColor: '#FEF2F2',
  },
  rowTextContainer: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: DEEP_GREEN,
  },
  dangerText: {
    color: '#D45050',
  },
  rowSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectValue: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: '500' as const,
  },
  switchIOS: {
    transform: [{ scale: 0.9 }],
  },
  switchAndroid: {
    transform: [{ scale: 1.0 }],
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 6,
  },
  footerOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  footerLine: {
    width: 24,
    height: 1,
    backgroundColor: GOLD,
    opacity: 0.3,
  },
  footerDiamond: {
    width: 5,
    height: 5,
    backgroundColor: GOLD,
    opacity: 0.3,
    transform: [{ rotate: '45deg' }],
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: DEEP_GREEN,
    opacity: 0.4,
  },
  footerVersion: {
    fontSize: 12,
    color: TEXT_MUTED,
    opacity: 0.5,
  },
});
