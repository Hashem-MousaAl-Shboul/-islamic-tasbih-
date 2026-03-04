import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Globe,
  Palette,
  Vibrate,
  Volume2,
  Bell,
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
  Coins,
} from 'lucide-react-native';
import * as StoreReview from 'expo-store-review';
import * as MailComposer from 'expo-mail-composer';
import * as Haptics from 'expo-haptics';
import * as NavigationBar from 'expo-navigation-bar';

import { useTheme } from '@/theme/ThemeProvider';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTasbihStore } from '@/hooks/useTasbihStore';
import { SettingsItem } from '@/components/SettingsItem';
import { LanguagePicker } from '@/components/LanguagePicker';
import { ColorThemePicker } from '@/components/ColorThemePicker';
import { CreditsPurchaseModal } from '@/components/CreditsPurchaseModal';
import { notificationService } from '@/utils/notificationService';
import { useCreditsStore } from '@/hooks/useCreditsStore';
import type { ColorThemeKey } from '@/theme/ThemeProvider';

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t, getCurrentLanguageInfo } = useLanguageStore();
  const { settings, updateSettings, resetAllData } = useTasbihStore();
  const { credits } = useCreditsStore();

  const [showLanguagePicker, setShowLanguagePicker] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showCreditsPurchase, setShowCreditsPurchase] = useState<boolean>(false);

  const languageInfo = useMemo(() => getCurrentLanguageInfo(), [getCurrentLanguageInfo]);

  const handleToggleDarkMode = useCallback(() => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });

    if (Platform.OS === 'android') {
      try {
        NavigationBar.setBackgroundColorAsync(
          newTheme === 'dark' ? '#0A0E1A' : '#F5F5F5'
        ).catch(() => {});
        NavigationBar.setButtonStyleAsync(
          newTheme === 'dark' ? 'light' : 'dark'
        ).catch(() => {});
      } catch (e) {
        console.log('[Settings] NavigationBar error:', e);
      }
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [settings.theme, updateSettings]);

  const handleToggleVibration = useCallback(() => {
    updateSettings({ vibrationEnabled: !settings.vibrationEnabled });
    if (!settings.vibrationEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  }, [settings.vibrationEnabled, updateSettings]);

  const handleToggleSound = useCallback(() => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  }, [settings.soundEnabled, updateSettings]);

  const handleToggleNotifications = useCallback(async () => {
    const newValue = !settings.reminderEnabled;
    updateSettings({ reminderEnabled: newValue });

    if (Platform.OS !== 'web') {
      try {
        const [hour, minute] = (settings.reminderTime || '20:00').split(':').map(Number);
        await notificationService.scheduleDailyReminder(newValue, hour, minute);
      } catch (e) {
        console.log('[Settings] Notification error:', e);
      }
    }
  }, [settings.reminderEnabled, settings.reminderTime, updateSettings]);

  const handleSelectColorTheme = useCallback((themeKey: ColorThemeKey) => {
    updateSettings({ colorTheme: themeKey });

    if (Platform.OS === 'android') {
      try {
        NavigationBar.setBackgroundColorAsync(
          settings.theme === 'dark' ? '#0A0E1A' : '#F5F5F5'
        ).catch(() => {});
      } catch (e) {
        console.log('[Settings] NavigationBar color error:', e);
      }
    }

    setShowColorPicker(false);
  }, [updateSettings, settings.theme]);

  const handleRateApp = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert(t('rateApp'), t('rateAppDescription'));
        return;
      }

      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      } else {
        Alert.alert(t('rateApp'), t('cantOpenStore'));
      }
    } catch (e) {
      console.log('[Settings] Store review error:', e);
      Alert.alert(t('error'), t('cantOpenStore'));
    }
  }, [t]);

  const handleShareApp = useCallback(async () => {
    try {
      const result = await Share.share({
        message: t('shareMessage'),
        title: t('appName'),
      });
      console.log('[Settings] Share result:', result);
    } catch (e) {
      console.log('[Settings] Share error:', e);
    }
  }, [t]);

  const handleContactUs = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        Linking.openURL('mailto:support@subbah.app?subject=Subbah%20App%20Support').catch(() => {
          Alert.alert(t('error'), t('noEmailApp'));
        });
        return;
      }

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
      console.log('[Settings] Mail error:', e);
      Alert.alert(t('error'), t('contactError'));
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
              console.log('[Settings] Reset error:', e);
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
              console.log('[Settings] Delete data error:', e);
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

  const sectionStyle = useMemo(() => [
    styles.section,
    { backgroundColor: theme.surface, borderColor: theme.border },
  ], [theme.surface, theme.border]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]} testID="settings-screen">
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>
          {t('settings')}
        </Text>
        <Text style={styles.headerSubtitle}>
          {t('customizeApp')}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          {t('appearance')}
        </Text>
        <View style={sectionStyle}>
          <SettingsItem
            icon={settings.theme === 'dark'
              ? <Moon size={22} color={theme.primary} />
              : <Sun size={22} color={theme.primary} />}
            title={t('darkMode')}
            subtitle={settings.theme === 'dark' ? t('darkModeEnabled') : t('lightModeEnabled')}
            type="toggle"
            value={settings.theme === 'dark'}
            onToggle={handleToggleDarkMode}
            variant="grouped"
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingsItem
            icon={<Palette size={22} color={theme.primary} />}
            title={t('colorTheme')}
            type="select"
            value={t(settings.colorTheme || 'gold')}
            onPress={() => setShowColorPicker(true)}
            variant="grouped"
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingsItem
            icon={<Globe size={22} color={theme.primary} />}
            title={t('language')}
            type="select"
            value={languageInfo?.nativeName || 'العربية'}
            onPress={() => setShowLanguagePicker(true)}
            variant="grouped"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          {t('buyCredits') || 'Credits'}
        </Text>
        <View style={sectionStyle}>
          <SettingsItem
            icon={<Coins size={22} color="#F59E0B" />}
            title={t('buyCredits') || 'Buy Credits'}
            subtitle={`${credits} ${t('credits') || 'credits'}`}
            type="action"
            onPress={() => setShowCreditsPurchase(true)}
            variant="grouped"
            iconBgColor="rgba(245,158,11,0.15)"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          {t('interaction')}
        </Text>
        <View style={sectionStyle}>
          <SettingsItem
            icon={<Vibrate size={22} color={theme.primary} />}
            title={t('vibration')}
            subtitle={t('vibrationOnTap')}
            type="toggle"
            value={settings.vibrationEnabled}
            onToggle={handleToggleVibration}
            variant="grouped"
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingsItem
            icon={<Volume2 size={22} color={theme.primary} />}
            title={t('sound')}
            subtitle={t('soundOnInteraction')}
            type="toggle"
            value={settings.soundEnabled}
            onToggle={handleToggleSound}
            variant="grouped"
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingsItem
            icon={<Bell size={22} color={theme.primary} />}
            title={t('notifications')}
            subtitle={t('dailyReminders')}
            type="toggle"
            value={settings.reminderEnabled}
            onToggle={handleToggleNotifications}
            variant="grouped"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          {t('contactSupport')}
        </Text>
        <View style={sectionStyle}>
          <SettingsItem
            icon={<Star size={22} color="#F59E0B" />}
            title={t('rateApp')}
            subtitle={t('rateAppDescription')}
            type="action"
            onPress={handleRateApp}
            variant="grouped"
            iconBgColor="rgba(245,158,11,0.15)"
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingsItem
            icon={<Share2 size={22} color="#3B82F6" />}
            title={t('shareApp')}
            subtitle={t('shareAppDescription')}
            type="action"
            onPress={handleShareApp}
            variant="grouped"
            iconBgColor="rgba(59,130,246,0.15)"
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingsItem
            icon={<Mail size={22} color="#10B981" />}
            title={t('contactUs')}
            subtitle={t('contactUsDescription')}
            type="action"
            onPress={handleContactUs}
            variant="grouped"
            iconBgColor="rgba(16,185,129,0.15)"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          {t('about')}
        </Text>
        <View style={sectionStyle}>
          <SettingsItem
            icon={<Shield size={22} color={theme.primary} />}
            title={t('privacy')}
            subtitle={t('viewPrivacyPolicy')}
            type="action"
            onPress={handleOpenPrivacy}
            variant="grouped"
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingsItem
            icon={<FileText size={22} color={theme.primary} />}
            title={t('terms')}
            subtitle={t('viewTerms')}
            type="action"
            onPress={handleOpenTerms}
            variant="grouped"
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingsItem
            icon={<Info size={22} color={theme.textSecondary} />}
            title={t('version')}
            subtitle="1.0.0"
            type="action"
            onPress={() => {}}
            variant="grouped"
            iconBgColor={`${theme.textSecondary}20`}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          {t('dataManagement')}
        </Text>
        <View style={sectionStyle}>
          <SettingsItem
            icon={<RotateCcw size={22} color="#F59E0B" />}
            title={t('resetSettings')}
            subtitle={t('resetSettingsDescription')}
            type="action"
            onPress={handleResetSettings}
            variant="grouped"
            iconBgColor="rgba(245,158,11,0.15)"
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <SettingsItem
            icon={<Trash2 size={22} color="#FF6B6B" />}
            title={t('deleteAllData')}
            subtitle={t('deleteAllDataDescription')}
            type="action"
            onPress={handleDeleteAllData}
            danger
            variant="grouped"
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.primary }]}>
            {t('appName')}
          </Text>
          <Text style={[styles.footerVersion, { color: theme.textSecondary }]}>
            v1.0.0
          </Text>
        </View>
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

      <CreditsPurchaseModal
        visible={showCreditsPurchase}
        onClose={() => setShowCreditsPurchase(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
    writingDirection: 'rtl',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 4,
  },
  section: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
      default: {},
    }),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 76,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500' as const,
    opacity: 0.5,
  },
  footerVersion: {
    fontSize: 12,
    opacity: 0.4,
  },
});
