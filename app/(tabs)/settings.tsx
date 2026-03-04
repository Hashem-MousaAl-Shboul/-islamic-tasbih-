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
  TouchableOpacity,
  Switch,
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
  ChevronRight,
  Settings,
} from 'lucide-react-native';
import * as StoreReview from 'expo-store-review';
import * as Haptics from 'expo-haptics';

import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTasbihStore } from '@/hooks/useTasbihStore';
import { LanguagePicker } from '@/components/LanguagePicker';
import { ColorThemePicker } from '@/components/ColorThemePicker';
import { CreditsPurchaseModal } from '@/components/CreditsPurchaseModal';
import { notificationService } from '@/utils/notificationService';
import { useCreditsStore } from '@/hooks/useCreditsStore';
import type { ColorThemeKey } from '@/theme/ThemeProvider';

const PRIMARY = '#1a5c4c';
const CARD_BG = '#d4ede5';
const SCREEN_BG = '#f5f5f5';
const TEXT_PRIMARY = '#1a5c4c';
const TEXT_SECONDARY = '#666666';

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
              false: Platform.OS === 'android' ? '#d0d0d0' : 'rgba(0,0,0,0.1)',
              true: PRIMARY,
            }}
            thumbColor={Platform.OS === 'android' ? (value ? PRIMARY : '#f4f3f4') : '#FFFFFF'}
            ios_backgroundColor="rgba(0,0,0,0.1)"
            style={Platform.OS === 'android' ? styles.switchAndroid : styles.switchIOS}
            pointerEvents="none"
          />
        ) : null}
        {type === 'select' ? (
          <View style={styles.selectContainer}>
            <Text style={styles.selectValue}>{String(value ?? '')}</Text>
            <ChevronRight size={16} color={TEXT_SECONDARY} />
          </View>
        ) : null}
        {type === 'action' ? (
          <ChevronRight size={18} color={danger ? '#E74C3C' : TEXT_SECONDARY} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
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
        import('expo-navigation-bar').then((NavigationBar) => {
          NavigationBar.setBackgroundColorAsync(
            newTheme === 'dark' ? '#0A0E1A' : '#F5F5F5'
          ).catch(() => {});
          NavigationBar.setButtonStyleAsync(
            newTheme === 'dark' ? 'light' : 'dark'
          ).catch(() => {});
        }).catch(() => {});
      } catch (e) {
        console.log('[Settings] NavigationBar error:', e);
      }
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [settings.theme, updateSettings]);

  const handleToggleVibration = useCallback(() => {
    updateSettings({ vibrationEnabled: !settings.vibrationEnabled });
    if (!settings.vibrationEnabled) {
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
    setShowColorPicker(false);
  }, [updateSettings]);

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
      await Share.share({
        message: t('shareMessage'),
        title: t('appName'),
      });
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
      console.log('[Settings] Mail error:', e);
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

  return (
    <View style={styles.container} testID="settings-screen">
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <Settings size={24} color="#fff" />
            <Text style={styles.headerTitle}>{t('settings')}</Text>
          </View>
          <Text style={styles.headerSubtitle}>{t('customizeApp')}</Text>
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
              ? <Moon size={20} color={PRIMARY} />
              : <Sun size={20} color={PRIMARY} />}
            title={t('darkMode')}
            subtitle={settings.theme === 'dark' ? t('darkModeEnabled') : t('lightModeEnabled')}
            type="toggle"
            value={settings.theme === 'dark'}
            onToggle={handleToggleDarkMode}
          />
          <SettingsRow
            icon={<Palette size={20} color={PRIMARY} />}
            title={t('colorTheme')}
            type="select"
            value={t(settings.colorTheme || 'gold')}
            onPress={() => setShowColorPicker(true)}
          />
          <SettingsRow
            icon={<Globe size={20} color={PRIMARY} />}
            title={t('language')}
            type="select"
            value={languageInfo?.nativeName || 'العربية'}
            onPress={() => setShowLanguagePicker(true)}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>{t('buyCredits') || 'Credits'}</Text>
        <View style={styles.card}>
          <SettingsRow
            icon={<Coins size={20} color="#F5A623" />}
            title={t('buyCredits') || 'Buy Credits'}
            subtitle={`${credits} ${t('credits') || 'credits'}`}
            type="action"
            onPress={() => setShowCreditsPurchase(true)}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>{t('interaction')}</Text>
        <View style={styles.card}>
          <SettingsRow
            icon={<Vibrate size={20} color={PRIMARY} />}
            title={t('vibration')}
            subtitle={t('vibrationOnTap')}
            type="toggle"
            value={settings.vibrationEnabled}
            onToggle={handleToggleVibration}
          />
          <SettingsRow
            icon={<Volume2 size={20} color={PRIMARY} />}
            title={t('sound')}
            subtitle={t('soundOnInteraction')}
            type="toggle"
            value={settings.soundEnabled}
            onToggle={handleToggleSound}
          />
          <SettingsRow
            icon={<Bell size={20} color={PRIMARY} />}
            title={t('notifications')}
            subtitle={t('dailyReminders')}
            type="toggle"
            value={settings.reminderEnabled}
            onToggle={handleToggleNotifications}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>{t('contactSupport')}</Text>
        <View style={styles.card}>
          <SettingsRow
            icon={<Star size={20} color="#F5A623" />}
            title={t('rateApp')}
            subtitle={t('rateAppDescription')}
            type="action"
            onPress={handleRateApp}
          />
          <SettingsRow
            icon={<Share2 size={20} color="#4A90D9" />}
            title={t('shareApp')}
            subtitle={t('shareAppDescription')}
            type="action"
            onPress={handleShareApp}
          />
          <SettingsRow
            icon={<Mail size={20} color="#27AE60" />}
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
            icon={<Shield size={20} color={PRIMARY} />}
            title={t('privacy')}
            subtitle={t('viewPrivacyPolicy')}
            type="action"
            onPress={handleOpenPrivacy}
          />
          <SettingsRow
            icon={<FileText size={20} color={PRIMARY} />}
            title={t('terms')}
            subtitle={t('viewTerms')}
            type="action"
            onPress={handleOpenTerms}
          />
          <SettingsRow
            icon={<Info size={20} color={TEXT_SECONDARY} />}
            title={t('version')}
            subtitle="1.0.0"
            type="action"
            onPress={() => {}}
            isLast
          />
        </View>

        <Text style={styles.sectionTitle}>{t('dataManagement')}</Text>
        <View style={styles.card}>
          <SettingsRow
            icon={<RotateCcw size={20} color="#F5A623" />}
            title={t('resetSettings')}
            subtitle={t('resetSettingsDescription')}
            type="action"
            onPress={handleResetSettings}
          />
          <SettingsRow
            icon={<Trash2 size={20} color="#E74C3C" />}
            title={t('deleteAllData')}
            subtitle={t('deleteAllDataDescription')}
            type="action"
            onPress={handleDeleteAllData}
            danger
            isLast
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('appName')}</Text>
          <Text style={styles.footerVersion}>v1.0.0</Text>
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
    backgroundColor: SCREEN_BG,
  },
  header: {
    backgroundColor: PRIMARY,
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#fff',
    writingDirection: 'rtl',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 4,
    marginLeft: 34,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: TEXT_SECONDARY,
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 60,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(26, 92, 76, 0.15)',
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  rowIconDanger: {
    backgroundColor: '#fee2e2',
  },
  rowTextContainer: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: TEXT_PRIMARY,
  },
  dangerText: {
    color: '#E74C3C',
  },
  rowSubtitle: {
    fontSize: 13,
    color: TEXT_PRIMARY,
    opacity: 0.6,
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
    color: TEXT_SECONDARY,
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
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: PRIMARY,
    opacity: 0.5,
  },
  footerVersion: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    opacity: 0.4,
  },
});
