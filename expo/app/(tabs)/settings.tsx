import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
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
  TrendingUp,
  User,
  Mail,
  LogOut,
  Camera,
  X,
  Check,
  Save,
  Edit2,
  ImageIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';

import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTasbihStore } from '@/hooks/useTasbihStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { rateApp, shareApp, contactViaWhatsApp } from '@/utils/globalUtils';
import { useNotifications, sendTestNotification } from '@/hooks/useNotifications';
import { LanguagePicker } from '@/components/LanguagePicker';
import { ColorThemePicker } from '@/components/ColorThemePicker';
import AdBanner from '@/components/AdBanner';
import { androidTextFix, androidRipple } from '@/utils/androidOptimizations';
import UnifiedHeader from '@/components/UnifiedHeader';
import { Colors } from '@/constants/colors';

import { useTheme, type ColorThemeKey } from '@/theme/ThemeProvider';
import type { BackgroundThemeKey } from '@/hooks/useTasbihStore';

const SETTINGS_TAG = "[SettingsScreen]";

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
  const theme = useTheme();
  const handlePress = useCallback(() => {
    if (disabled) return;
    if (type === 'toggle' && onToggle) {
      onToggle();
    } else if (onPress) {
      onPress();
    }
  }, [type, onToggle, onPress, disabled]);

  const isDark = theme.mode === 'dark';
  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const textSecondary = isDark ? Colors.dark.textSecondary : Colors.light.textSecondary;
  const borderColor = isDark ? Colors.dark.border : Colors.light.border;
  const surfaceColor = isDark ? Colors.dark.surface : Colors.light.surface;
  const primaryColor = Colors.primary;

  return (
    <Pressable
      style={[
        styles.row,
        !isLast && styles.rowBorder,
        !isLast && { borderBottomColor: theme.border },
        disabled && styles.rowDisabled,
      ]}
      onPress={handlePress}
      accessibilityRole={type === 'toggle' ? 'switch' : 'button'}
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      accessibilityState={{ disabled: Boolean(disabled), checked: type === 'toggle' ? Boolean(value) : undefined }}
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
              true: primaryColor,
            }}
            thumbColor={Platform.OS === 'android' ? (value ? primaryColor : '#f4f3f4') : '#FFFFFF'}
            ios_backgroundColor="rgba(0,0,0,0.08)"
            style={Platform.OS === 'android' ? styles.switchAndroid : styles.switchIOS}
            pointerEvents="none"
          />
        ) : null}
        {type === 'select' && !badge ? (
          <View style={styles.selectContainer}>
            <ChevronLeft size={16} color={disabled ? '#78817B' : theme.textSecondary} />
            <Text style={[styles.selectValue, { color: theme.textSecondary }, disabled && styles.selectValueDisabled, androidTextFix]}>{String(value ?? '')}</Text>
          </View>
        ) : null}
        {type === 'action' ? (
          <ChevronLeft size={18} color={danger ? '#D45050' : theme.textSecondary} />
        ) : null}
      </View>
      <View style={styles.rowRight}>
        <View style={styles.rowTextContainer}>
          <Text style={[styles.rowTitle, { color: theme.text }, danger && styles.dangerText, disabled && styles.rowTitleDisabled, androidTextFix]}>{title}</Text>
          {subtitle ? <Text style={[styles.rowSubtitle, { color: theme.textSecondary }, disabled && styles.rowSubtitleDisabled, androidTextFix]}>{subtitle}</Text> : null}
        </View>
        <View style={[styles.rowIcon, { backgroundColor: theme.mode === 'dark' ? '#2D3446' : "#FFFFF0" }, danger && styles.rowIconDanger, disabled && styles.rowIconDisabled]}>
          {icon}
        </View>
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t, getCurrentLanguageInfo } = useLanguageStore();
  const { settings, updateSettings, resetAllData } = useTasbihStore();
  const { user, profile, logout, updateProfile, uploadProfilePhoto, deleteProfilePhoto } = useAuthStore();
  const router = useRouter();
  const isDark = theme.mode === 'dark';

  const [showLanguagePicker, setShowLanguagePicker] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState<string | null>(null);
  const [tempPhotoURL, setTempPhotoURL] = useState<string | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    toggleNotifications,
    toggleMorningReminder,
    toggleEveningReminder,
    isExpoGoEnvironment,
  } = useNotifications();
  const [notificationsLoading, setNotificationsLoading] = useState<boolean>(false);

  const textColor = isDark ? Colors.dark.text : Colors.light.text;
  const textSecondary = isDark ? Colors.dark.textSecondary : Colors.light.textSecondary;
  const backgroundColor = isDark ? Colors.dark.background : Colors.light.background;
  const surfaceColor = isDark ? Colors.dark.surface : Colors.light.surface;
  const cardColor = isDark ? Colors.dark.card : Colors.light.surface;
  const borderColor = isDark ? Colors.dark.border : Colors.light.border;
  const primaryColor = Colors.primary;

  const displayName = profile?.name || user?.displayName || t('user');
  const displayEmail = profile?.email || user?.email || t('noEmail');
  const photoURL = profile?.photoURL || user?.photoURL || null;

  useEffect(() => {
    if (isEditing) {
      setEditName(displayName);
      setEditPhotoURL(photoURL);
    }
  }, [isEditing, displayName, photoURL]);

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
    }
  }, [settings.theme, updateSettings]);

  const handleToggleVibration = useCallback(() => {
    updateSettings({ vibrationEnabled: !settings.vibrationEnabled });
    if (!settings.vibrationEnabled) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  }, [settings.vibrationEnabled, updateSettings]);

  const handleToggleSound = useCallback(() => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
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
    await rateApp();
  }, []);

  const handleShareApp = useCallback(async () => {
    await shareApp();
  }, []);

  const handleContactUs = useCallback(async () => {
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
              Alert.alert(t('error'), t('resetError'));
            }
          },
        },
      ]
    );
  }, [t, resetAllData]);

  const handleOpenStatistics = useCallback(() => {
    router.push('/statistics');
  }, [router]);

  const handleOpenPrivacy = useCallback(() => {
    router.push('/privacy-policy');
  }, [router]);

  const handleOpenTerms = useCallback(() => {
    router.push('/terms-of-use');
  }, [router]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      t('signOut'),
      t('logoutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('signOut'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/sign-in');
            } catch {
              Alert.alert(t('error'), t('logoutError'));
            }
          },
        },
      ]
    );
  }, [logout, router, t]);

  const handlePickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('error'), t('cameraPermissionDenied'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
        allowsMultipleSelection: false,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }
      const uri = result.assets[0].uri;
      if (!uri) {
        throw new Error('Selected image does not contain a valid URI.');
      }
      setTempPhotoURL(uri);
      setShowImagePreview(true);
      setShowImageOptions(false);
      setUploadProgress(0);
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      Alert.alert(t('error'), t('imagePickerError'));
    }
  }, [t]);

  const handleTakePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('error'), t('cameraPermissionDenied'));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }
      const uri = result.assets[0].uri;
      if (!uri) {
        throw new Error('Captured image does not contain a valid URI.');
      }
      setTempPhotoURL(uri);
      setShowImagePreview(true);
      setShowImageOptions(false);
      setUploadProgress(0);
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      Alert.alert(t('error'), t('cameraError'));
    }
  }, [t]);

  const handleConfirmImage = useCallback(async () => {
    if (!tempPhotoURL) return;
    setImageLoading(true);
    setUploadProgress(10);
    try {
      setUploadProgress(25);
      const downloadUrl = await uploadProfilePhoto(tempPhotoURL);
      setUploadProgress(90);
      setEditPhotoURL(downloadUrl);
      setTempPhotoURL(null);
      setShowImagePreview(false);
      setUploadProgress(100);
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert(t('success'), t('photoUploadedSuccessfully'));
    } catch (error) {
      Alert.alert(t('error'), t('photoUploadError'));
    } finally {
      setImageLoading(false);
      setUploadProgress(0);
    }
  }, [tempPhotoURL, uploadProfilePhoto, t]);

  const handleCancelImage = useCallback(() => {
    if (imageLoading) return;
    setTempPhotoURL(null);
    setShowImagePreview(false);
    setUploadProgress(0);
  }, [imageLoading]);

  const handleRemovePhoto = useCallback(() => {
    Alert.alert(
      t('removePhoto'),
      t('removePhotoConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('remove'),
          style: 'destructive',
          onPress: async () => {
            setImageLoading(true);
            try {
              await deleteProfilePhoto();
              setEditPhotoURL(null);
              setTempPhotoURL(null);
              setShowImageOptions(false);
              setShowImagePreview(false);
              if (Platform.OS !== 'web') {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              Alert.alert(t('success'), t('photoRemovedSuccessfully'));
            } catch (error) {
              Alert.alert(t('error'), t('photoRemoveError'));
            } finally {
              setImageLoading(false);
            }
          },
        },
      ]
    );
  }, [deleteProfilePhoto, t]);

  const handleSaveProfile = useCallback(async () => {
    if (!editName.trim()) {
      Alert.alert(t('error'), t('enterName'));
      return;
    }
    setIsLoading(true);
    try {
      await updateProfile({
        name: editName.trim(),
        photoURL: editPhotoURL,
      });
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setIsEditing(false);
      Alert.alert(t('success'), t('profileUpdated'));
    } catch (error) {
      Alert.alert(t('error'), t('updateProfileError'));
    } finally {
      setIsLoading(false);
    }
  }, [editName, editPhotoURL, updateProfile, t]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]} testID="settings-screen"
      accessibilityLabel="Settings Screen"
      accessibilityHint="Manage app preferences and data">
      <UnifiedHeader title={t('settings') || 'الإعدادات'} testID="settings-header" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 60 }]}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      >
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }, androidTextFix]}>{t('appearance')}</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SettingsRow
            icon={settings.theme === 'dark'
              ? <Moon size={20} color={primaryColor} />
              : <Sun size={20} color={primaryColor} />}
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

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }, androidTextFix]}>{t('statistics')}</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SettingsRow
            icon={<TrendingUp size={20} color="#2D8B6F" />}
            title={t('statistics') || 'الإحصائيات'}
            subtitle={t('totalDhikr') || 'إجمالي الذكر'}
            type="action"
            onPress={handleOpenStatistics}
            isLast
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }, androidTextFix]}>{t('interaction')}</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
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

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }, androidTextFix]}>{t('notifications')}</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <NotificationPreviewCard />
          {isExpoGoEnvironment ? (
            <View style={styles.expoGoWarning}>
              <Bell size={20} color={primaryColor} />
              <View style={styles.expoGoWarningText}>
                <Text style={[styles.expoGoWarningTitle, androidTextFix]}>{t('notificationsExpoGoTitle')}</Text>
                <Text style={[styles.expoGoWarningBody, androidTextFix]}>{t('notificationsExpoGoWarning')}</Text>
              </View>
            </View>
          ) : (
            <SettingsRow
              icon={<Bell size={20} color={primaryColor} />}
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
                icon={<Bell size={20} color={primaryColor} />}
                title={t('sendTestNotification')}
                subtitle={t('sendTestNotificationDescription')}
                type="action"
                onPress={handleSendTestNotification}
                isLast
              />
            </>
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }, androidTextFix]}>{t('contactSupport')}</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SettingsRow
            icon={<Star size={20} color={primaryColor} />}
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

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }, androidTextFix]}>{t('about')}</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SettingsRow
            icon={<Shield size={20} color={primaryColor} />}
            title={t('privacy')}
            subtitle={t('viewPrivacyPolicy')}
            type="action"
            onPress={handleOpenPrivacy}
          />
          <SettingsRow
            icon={<FileText size={20} color={primaryColor} />}
            title={t('terms')}
            subtitle={t('viewTerms')}
            type="action"
            onPress={handleOpenTerms}
          />
          <SettingsRow
            icon={<Info size={20} color={textSecondary} />}
            title={t('version')}
            subtitle={`v${appVersion} (${buildNumber})`}
            type="action"
            isLast
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }, androidTextFix]}>{t('dataManagement')}</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <SettingsRow
            icon={<RotateCcw size={20} color={primaryColor} />}
            title={t('resetSettings')}
            subtitle={t('resetSettingsDescription')}
            type="action"
            onPress={handleResetSettings}
          />
          <SettingsRow
            icon={<Trash2 size={20} color={Colors.error} />}
            title={t('deleteAllData')}
            subtitle={t('deleteAllDataDescription')}
            type="action"
            onPress={handleDeleteAllData}
            danger
            isLast
          />
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: Colors.error + '15' }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={20} color={Colors.error} />
          <Text style={[styles.logoutText, { color: Colors.error }]}>
            {t('signOut')}
          </Text>
        </TouchableOpacity>

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

      <Modal
        visible={isEditing}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.modalCloseBtn}>
              <X size={24} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              {t('editProfile') || 'تعديل الملف الشخصي'}
            </Text>
            <TouchableOpacity
              onPress={handleSaveProfile}
              style={[styles.modalSaveBtn, { backgroundColor: primaryColor }]}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Save size={20} color={Colors.white} />
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.modalAvatarSection}>
              <View style={styles.modalAvatarWrapper}>
                {editPhotoURL ? (
                  <Image source={{ uri: editPhotoURL }} style={[styles.modalAvatarImage, { borderColor: primaryColor }]} />
                ) : (
                  <View style={[styles.modalAvatarPlaceholder, { backgroundColor: surfaceColor, borderColor: primaryColor }]}>
                    <User size={48} color={primaryColor} />
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.modalAvatarEdit, { backgroundColor: primaryColor }]}
                  onPress={() => setShowImageOptions(true)}
                >
                  <Camera size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalFieldLabel, { color: textSecondary }]}>
                {t('name') || 'الاسم'}
              </Text>
              <TextInput
                style={[styles.modalInput, { color: textColor, borderColor, backgroundColor: surfaceColor }]}
                value={editName}
                onChangeText={setEditName}
                placeholder={t('enterName') || 'أدخل اسمك'}
                placeholderTextColor={textSecondary}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalFieldLabel, { color: textSecondary }]}>
                {t('enterEmail') || 'البريد الإلكتروني'}
              </Text>
              <TextInput
                style={[styles.modalInput, { color: textColor, borderColor, backgroundColor: surfaceColor }]}
                value={displayEmail}
                editable={false}
                placeholderTextColor={textSecondary}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showImageOptions} transparent animationType="fade" onRequestClose={() => setShowImageOptions(false)}>
        <Pressable style={styles.imageOptionsOverlay} onPress={() => setShowImageOptions(false)}>
          <View style={[styles.imageOptionsSheet, { backgroundColor: cardColor }]}>
            <View style={styles.imageOptionsHandle} />
            <Text style={[styles.imageOptionsTitle, { color: textColor }]}>
              {t('changeProfilePhoto') || 'تغيير الصورة الشخصية'}
            </Text>
            <TouchableOpacity style={styles.imageOption} onPress={handleTakePhoto} activeOpacity={0.7}>
              <Camera size={24} color={primaryColor} />
              <Text style={[styles.imageOptionText, { color: textColor }]}>
                {t('takePhoto') || 'التقاط صورة'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageOption} onPress={handlePickImage} activeOpacity={0.7}>
              <ImageIcon size={24} color={primaryColor} />
              <Text style={[styles.imageOptionText, { color: textColor }]}>
                {t('chooseFromGallery') || 'اختيار من المعرض'}
              </Text>
            </TouchableOpacity>
            {editPhotoURL && (
              <TouchableOpacity style={[styles.imageOption, styles.imageOptionDanger]} onPress={handleRemovePhoto} activeOpacity={0.7} disabled={imageLoading}>
                <X size={24} color={Colors.error} />
                <Text style={[styles.imageOptionText, { color: Colors.error }]}>
                  {t('removePhoto') || 'حذف الصورة'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.imageOptionCancel, { borderTopColor: borderColor }]} onPress={() => setShowImageOptions(false)} activeOpacity={0.7}>
              <Text style={[styles.imageOptionCancelText, { color: textSecondary }]}>
                {t('cancel') || 'إلغاء'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showImagePreview} transparent animationType="fade" onRequestClose={handleCancelImage}>
        <View style={styles.imagePreviewOverlay}>
          <View style={[styles.imagePreviewContainer, { backgroundColor: cardColor }]}>
            <View style={styles.previewHeader}>
              <Text style={[styles.imagePreviewTitle, { color: textColor }]}>
                {t('previewImage') || 'معاينة الصورة'}
              </Text>
              <TouchableOpacity onPress={handleCancelImage} disabled={imageLoading} style={styles.previewCloseButton}>
                <X size={22} color={textSecondary} />
              </TouchableOpacity>
            </View>
            {tempPhotoURL && (
              <View style={[styles.previewImageWrapper, { backgroundColor: surfaceColor }]}>
                <Image source={{ uri: tempPhotoURL }} style={styles.imagePreviewImage} resizeMode="cover" />
              </View>
            )}
            {imageLoading && (
              <View style={styles.uploadProgressContainer}>
                <ActivityIndicator size="large" color={primaryColor} />
                <Text style={[styles.uploadProgressText, { color: textSecondary }]}>
                  {uploadProgress > 0 ? `${Math.round(uploadProgress)}%` : t('uploading') || 'جاري الرفع...'}
                </Text>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <View style={[styles.uploadProgressBar, { backgroundColor: borderColor }]}>
                    <View style={[styles.uploadProgressFill, { width: `${uploadProgress}%`, backgroundColor: primaryColor }]} />
                  </View>
                )}
              </View>
            )}
            <View style={styles.imagePreviewButtons}>
              <TouchableOpacity style={[styles.imagePreviewButton, styles.imagePreviewCancel, { borderColor }]} onPress={handleCancelImage} activeOpacity={0.7} disabled={imageLoading}>
                <Text style={[styles.imagePreviewButtonText, { color: textSecondary }]}>
                  {t('cancel') || 'إلغاء'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.imagePreviewButton, styles.imagePreviewConfirm, { backgroundColor: primaryColor }]}
                onPress={handleConfirmImage}
                activeOpacity={0.7}
                disabled={imageLoading || !tempPhotoURL}
              >
                {imageLoading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Check size={20} color={Colors.white} />
                    <Text style={[styles.imagePreviewButtonText, { color: Colors.white }]}>
                      {t('confirm') || 'تأكيد'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AdBanner />
    </View>
  );
}

const notificationPreviewStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 6,
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
    marginBottom: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E8A317',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
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
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#1B4332',
    marginBottom: 1,
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
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1B4332',
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 22,
  },
  bodyText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#4A5D53',
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 20,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  avatarSection: { alignItems: 'center' },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  userEmail: { fontSize: 14 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: { fontSize: 12, fontWeight: '600' },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  editProfileText: { fontSize: 13, fontWeight: '600' },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#8A9B91',
    marginTop: 10,
    marginBottom: 6,
    marginRight: 4,
    textAlign: 'right' as const,
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 54,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F7F4EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  rowIconDanger: {
    backgroundColor: '#FEF2F2',
  },
  rowTextContainer: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#1B4332',
    textAlign: 'right' as const,
  },
  dangerText: {
    color: '#D45050',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#8A9B91',
    marginTop: 1,
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
    color: '#8A9B91',
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
    color: '#D4A853',
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
    paddingVertical: 16,
    gap: 4,
  },
  expoGoWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  expoGoWarningText: {
    flex: 1,
    gap: 4,
  },
  expoGoWarningTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1B4332',
    textAlign: 'right' as const,
  },
  expoGoWarningBody: {
    fontSize: 13,
    color: '#8A9B91',
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
    backgroundColor: '#D4A853',
    opacity: 0.3,
  },
  footerDiamond: {
    width: 5,
    height: 5,
    backgroundColor: '#D4A853',
    opacity: 0.3,
    transform: [{ rotate: '45deg' }],
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1B4332',
    opacity: 0.4,
  },
  footerVersion: {
    fontSize: 12,
    color: '#8A9B91',
    opacity: 0.5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalCloseBtn: { padding: 4, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalSaveBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalBody: { padding: 20 },
  modalAvatarSection: { alignItems: 'center', marginBottom: 24 },
  modalAvatarWrapper: { position: 'relative' },
  modalAvatarImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3 },
  modalAvatarPlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 3 },
  modalAvatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modalField: { marginBottom: 16 },
  modalFieldLabel: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  modalInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  imageOptionsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  imageOptionsSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingBottom: 28, paddingTop: 8 },
  imageOptionsHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.15)', alignSelf: 'center', marginBottom: 16 },
  imageOptionsTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  imageOption: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12 },
  imageOptionDanger: { marginTop: 4 },
  imageOptionText: { fontSize: 15, fontWeight: '500' },
  imageOptionCancel: { alignItems: 'center', paddingVertical: 14, marginTop: 8, borderTopWidth: 1 },
  imageOptionCancelText: { fontSize: 15, fontWeight: '600' },
  imagePreviewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  imagePreviewContainer: { width: '100%', maxWidth: 400, borderRadius: 20, padding: 20, alignItems: 'center' },
  previewHeader: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  imagePreviewTitle: { fontSize: 18, fontWeight: '700' },
  previewCloseButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  previewImageWrapper: { width: 260, height: 260, borderRadius: 130, overflow: 'hidden', marginBottom: 20, justifyContent: 'center', alignItems: 'center' },
  imagePreviewImage: { width: '100%', height: '100%' },
  imagePreviewButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  imagePreviewButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  imagePreviewCancel: { borderWidth: 1 },
  imagePreviewConfirm: { backgroundColor: '#D4A853' },
  imagePreviewButtonText: { fontSize: 16, fontWeight: '600' },
  uploadProgressContainer: { alignItems: 'center', marginVertical: 8, width: '100%' },
  uploadProgressBar: { height: 4, borderRadius: 2, width: '100%', marginTop: 8, overflow: 'hidden' },
  uploadProgressFill: { height: '100%', borderRadius: 2 },
  uploadProgressText: { fontSize: 12, marginTop: 4 },
});