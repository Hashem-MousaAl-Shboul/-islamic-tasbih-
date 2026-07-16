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
  Pressable,
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
  MessageCircle,
  Shield,
  FileText,
  Trash2,
  RotateCcw,
  Moon,
  Sun,
  Info,
  ChevronLeft,
  Bell,
  Sunrise,
  Sunset,
  Sun as SunIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTasbihStore } from '@/hooks/useTasbihStore';
import { rateApp, shareApp, contactViaWhatsApp } from '@/utils/globalUtils';
import { useNotifications, sendTestNotification } from '@/hooks/useNotifications';
import { LanguagePicker } from '@/components/LanguagePicker';
import { ColorThemePicker } from '@/components/ColorThemePicker';
import AdBanner from '@/components/AdBanner';
import { androidTextFix, androidRipple } from '@/utils/androidOptimizations';
import UnifiedHeader from '@/components/UnifiedHeader';

import type { ColorThemeKey } from '@/theme/ThemeProvider';
import type { BackgroundThemeKey } from '@/hooks/useTasbihStore';

const GOLD = '#D4A853';
const DEEP_GREEN = '#1B4332';
const IVORY = '#F7F4EE';
const CARD_WHITE = '#FFFFFF';
const TEXT_MUTED = "#8A9B91";
const SETTINGS_TAG = "[SettingsScreen]";
console.log(SETTINGS_TAG, "Settings module loaded");

function NotificationPreviewCard() {
  const { t } = useLanguageStore();
  const appName = Constants.expoConfig?.name ?? 'تسبيح';

  return (
    <View style={notificationPreviewStyles.container}>
      <View style={notificationPreviewStyles.headerRow}>
        <View style={notificationPreviewStyles.iconCircle}>
          <SunIcon size={22} color="#FFFFFF" strokeWidth={2} />
        </View>
        <View style={notificationPreviewStyles.appInfo}>
          <Text style={[notificationPreviewStyles.appName, androidTextFix]}>{appName}</Text>
          <Text style={[notificationPreviewStyles.timeText, androidTextFix]}>{t('oneHourAgo')}</Text>
        </View>
      </View>
      <View style={notificationPreviewStyles.body}>
        <Text style={[notificationPreviewStyles.title, androidTextFix]}>{t('morningAdhkar')}</Text>
        <Text style={[notificationPreviewStyles.bodyText, androidTextFix]}>{t('morningReminderBody')}</Text>
      </View>
    </View>
  );
}

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
  disabled?: boolean;
  badge?: string;
}

function SettingsRow({ icon, title, subtitle, type, value, onPress, onToggle, danger, isLast, disabled, badge }: SettingsRowProps) {
  const handlePress = useCallback(() => {
    if (disabled) return;
    if (type === 'toggle' && onToggle) {
      onToggle();
    } else if (onPress) {
      onPress();
    }
  }, [type, onToggle, onPress, disabled]);

  return (
    <Pressable
      style={[styles.row, !isLast && styles.rowBorder, disabled && styles.rowDisabled]}
      onPress={handlePress}
      android_ripple={disabled ? undefined : androidRipple('rgba(27,67,50,0.06)')}
      testID={`settings-row-${title}`}
    >
      <View style={styles.rowLeft}>
        {badge ? (
          <View style={styles.comingSoonBadge}>
            <Text style={[styles.comingSoonText, androidTextFix]}>{badge}</Text>
          </View>
        ) : null}
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
        {type === 'select' && !badge ? (
          <View style={styles.selectContainer}>
            <ChevronLeft size={16} color={disabled ? '#ccc' : TEXT_MUTED} />
            <Text style={[styles.selectValue, disabled && styles.selectValueDisabled, androidTextFix]}>{String(value ?? '')}</Text>
          </View>
        ) : null}
        {type === 'action' ? (
          <ChevronLeft size={18} color={danger ? '#D45050' : TEXT_MUTED} />
        ) : null}
      </View>
      <View style={styles.rowRight}>
        <View style={styles.rowTextContainer}>
          <Text style={[styles.rowTitle, danger && styles.dangerText, disabled && styles.rowTitleDisabled, androidTextFix]}>{title}</Text>
          {subtitle ? <Text style={[styles.rowSubtitle, disabled && styles.rowSubtitleDisabled, androidTextFix]}>{subtitle}</Text> : null}
        </View>
        <View style={[styles.rowIcon, danger && styles.rowIconDanger, disabled && styles.rowIconDisabled]}>
          {icon}
        </View>
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { t, getCurrentLanguageInfo } = useLanguageStore();
  const { settings, updateSettings, resetAllData } = useTasbihStore();
  const router = useRouter();
  const [showLanguagePicker, setShowLanguagePicker] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const {
    toggleNotifications,
    toggleMorningReminder,
    toggleEveningReminder,
    isExpoGoEnvironment,
  } = useNotifications();
  const [notificationsLoading, setNotificationsLoading] = useState<boolean>(false);

  const handleToggleNotifications = useCallback(async () => {
    if (notificationsLoading) return;
    setNotificationsLoading(true);
    try {
      await toggleNotifications(!settings.notificationsEnabled);
    } finally {
      setNotificationsLoading(false);
    }
  }, [notificationsLoading, settings.notificationsEnabled, toggleNotifications]);

  const handleSendTestNotification = useCallback(async () => {
    if (isExpoGoEnvironment) {
      Alert.alert(t('notificationsExpoGoTitle'), t('notificationsExpoGoWarning'));
      return;
    }
    if (!settings.notificationsEnabled) {
      Alert.alert(t('notificationsDisabledTitle'), t('notificationsDisabledMessage'));
      return;
    }
    try {
      await sendTestNotification();
    } catch (e) {
      console.log(SETTINGS_TAG, 'Test notification error:', e);
    }
  }, [isExpoGoEnvironment, settings.notificationsEnabled, t]);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const buildNumber = Platform.OS === 'ios'
    ? (Constants.expoConfig?.ios?.buildNumber ?? '1')
    : String(Constants.expoConfig?.android?.versionCode ?? 1);

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
  }, [updateSettings]);

  const handleSelectBackground = useCallback((backgroundKey: BackgroundThemeKey, imageUri?: string | null) => {
    updateSettings({
      backgroundTheme: backgroundKey,
      customBackgroundImage: backgroundKey === 'custom' ? imageUri ?? null : null,
    });
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
    console.log(SETTINGS_TAG, 'Contact us via WhatsApp tapped');
    await contactViaWhatsApp();
  }, []);

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
    console.log(SETTINGS_TAG, 'Opening in-app privacy policy');
    router.push('/privacy-policy');
  }, [router]);

  const handleOpenTerms = useCallback(() => {
    console.log(SETTINGS_TAG, 'Opening in-app terms of use');
    router.push('/terms-of-use');
  }, [router]);

  return (
    <View style={styles.container} testID="settings-screen"
      accessibilityLabel="Settings Screen"
      accessibilityHint="Manage app preferences and data">
      <UnifiedHeader title={t('settings') || 'الإعدادات'} testID="settings-header" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 60 }]}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <Text style={[styles.sectionTitle, androidTextFix]}>{t('appearance')}</Text>
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
            value={t(settings.backgroundTheme || 'default')}
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

        <Text style={[styles.sectionTitle, androidTextFix]}>{t('interaction')}</Text>
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

        <Text style={[styles.sectionTitle, androidTextFix]}>{t('notifications')}</Text>
        <View style={styles.card}>
          <NotificationPreviewCard />
          {isExpoGoEnvironment ? (
            <View style={styles.expoGoWarning}>
              <Bell size={20} color={GOLD} />
              <View style={styles.expoGoWarningText}>
                <Text style={[styles.expoGoWarningTitle, androidTextFix]}>{t('notificationsExpoGoTitle')}</Text>
                <Text style={[styles.expoGoWarningBody, androidTextFix]}>{t('notificationsExpoGoWarning')}</Text>
              </View>
            </View>
          ) : (
            <SettingsRow
              icon={<Bell size={20} color={GOLD} />}
              title={t('notifications')}
              subtitle={t('notificationsDescription')}
              type="toggle"
              value={settings.notificationsEnabled}
              onToggle={handleToggleNotifications}
              disabled={notificationsLoading}
            />
          )}
          {settings.notificationsEnabled && !isExpoGoEnvironment ? (
            <>
              <SettingsRow
                icon={<Sunrise size={20} color="#E07A3A" />}
                title={t('morningReminder')}
                subtitle={settings.morningReminderTime}
                type="toggle"
                value={settings.morningReminderEnabled}
                onToggle={() => toggleMorningReminder(!settings.morningReminderEnabled)}
              />
              <SettingsRow
                icon={<Sunset size={20} color="#8B5CF6" />}
                title={t('eveningReminder')}
                subtitle={settings.eveningReminderTime}
                type="toggle"
                value={settings.eveningReminderEnabled}
                onToggle={() => toggleEveningReminder(!settings.eveningReminderEnabled)}
              />
              <SettingsRow
                icon={<Bell size={20} color={GOLD} />}
                title={t('sendTestNotification')}
                subtitle={t('sendTestNotificationDescription')}
                type="action"
                onPress={handleSendTestNotification}
                isLast
              />
            </>
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, androidTextFix]}>{t('contactSupport')}</Text>
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
            icon={<MessageCircle size={20} color="#25D366" />}
            title={t('contactUs')}
            subtitle={t('contactUsWhatsApp')}
            type="action"
            onPress={handleContactUs}
            isLast
          />
        </View>

        <Text style={[styles.sectionTitle, androidTextFix]}>{t('about')}</Text>
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
            subtitle={`v${appVersion} (${buildNumber})`}
            type="action"
            onPress={() => { console.log(SETTINGS_TAG, "Version:", appVersion, "Build:", buildNumber); }}
            isLast
          />
        </View>

        <Text style={[styles.sectionTitle, androidTextFix]}>{t('dataManagement')}</Text>
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
          <Text style={[styles.footerText, androidTextFix]}>{t('appName')}</Text>
          <Text style={[styles.footerVersion, androidTextFix]}>v{appVersion} ({buildNumber})</Text>
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
        currentBackground={(settings.backgroundTheme as BackgroundThemeKey) || 'default'}
        customBackgroundImage={settings.customBackgroundImage}
        onSelectBackground={handleSelectBackground}
      />

      <AdBanner />
    </View>
  );
}

const notificationPreviewStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E8A317',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    shadowColor: '#E8A317',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  appInfo: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1B4332',
    marginBottom: 2,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#8A9B91',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  body: {
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#1B4332',
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 24,
  },
  bodyText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#4A5D53',
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 22,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IVORY,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: TEXT_MUTED,
    marginTop: 14,
    marginBottom: 8,
    marginRight: 4,
    textAlign: 'right' as const,
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: CARD_WHITE,
    borderRadius: 18,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
    ...Platform.select({ android: { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.04)' } }),
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
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: IVORY,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 14,
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
    textAlign: 'right' as const,
  },
  dangerText: {
    color: '#D45050',
  },
  rowSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
    textAlign: 'right' as const,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
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
  selectValueDisabled: {
    opacity: 0.4,
  },
  rowDisabled: {
    opacity: 0.55,
  },
  rowIconDisabled: {
    opacity: 0.5,
  },
  rowTitleDisabled: {
    opacity: 0.6,
  },
  rowSubtitleDisabled: {
    opacity: 0.5,
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(212, 168, 83, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: GOLD,
    letterSpacing: 0.3,
  },
  switchIOS: {
    transform: [{ scale: 0.9 }],
  },
  switchAndroid: {
    transform: [{ scale: 1.05 }],
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  expoGoWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  expoGoWarningText: {
    flex: 1,
    gap: 4,
  },
  expoGoWarningTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: DEEP_GREEN,
    textAlign: 'right' as const,
  },
  expoGoWarningBody: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: 'right' as const,
    lineHeight: 19,
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
