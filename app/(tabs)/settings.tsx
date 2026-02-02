import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { StyleSheet, View, Text, ScrollView, Share, Linking, Alert, Platform, StatusBar, TouchableOpacity } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Settings,
  ChevronLeft,
  Vibrate,
  Bell,
  BellRing,
  Moon,
  Type,
  Cloud,
  RotateCcw,
  Share2,
  Star,
  Shield,
  FileText,
  MessageCircle,
} from 'lucide-react-native';
import { useTasbihStore } from '@/hooks/useTasbihStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { LanguagePicker } from '@/components/LanguagePicker';
import { ColorThemePicker } from '@/components/ColorThemePicker';
import { AppearanceSettings } from '@/components/AppearanceSettings';
import { SettingsItem } from '@/components/SettingsItem';
import i18n from '@/constants/translations';
import { ColorThemeKey } from '@/theme/ThemeProvider';
import { adTracker } from '@/utils/adTracking';
import RewardedAd from '@/components/RewardedAd';

const SettingsScreen = memo(function SettingsScreen() {
  const { settings, updateSettings } = useTasbihStore();
  const { currentLanguage } = useLanguageStore();
  const insets = useSafeAreaInsets();
  const [showLanguagePicker, setShowLanguagePicker] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showAppearanceSettings, setShowAppearanceSettings] = useState<boolean>(false);
  const [showRewardedAd, setShowRewardedAd] = useState<boolean>(false);

  useEffect(() => {
    console.log('[SettingsScreen] Screen mounted - tracking KPI');
    adTracker.trackImpression('settings-screen', 'settings', 'screen-view');
  }, []);

  const handleToggleSetting = useCallback(
    (key: keyof typeof settings) => (value: boolean) => {
      console.log(`[SettingsScreen] Toggle setting: ${key} = ${value}`);
      adTracker.trackClick(`toggle-${key}`, 'settings', 'toggle-switch');
      updateSettings({ [key]: value });
    },
    [updateSettings]
  );

  const handleToggleDarkMode = useCallback((value: boolean) => {
    console.log(`[SettingsScreen] Toggle dark mode: ${value}`);
    adTracker.trackClick('toggle-dark-mode', 'settings', 'toggle-switch');
    updateSettings({ theme: value ? 'dark' : 'light' });
  }, [updateSettings]);

  const handleShareApp = useCallback(async () => {
    try {
      console.log('[SettingsScreen] Share app clicked');
      adTracker.trackClick('share-app', 'settings', 'share-button');
      const message = i18n.t('shareMessage') || 'Check out this Islamic app!';
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ title: 'Islamic Tasbih', text: message });
        } else {
          await navigator.clipboard.writeText(message);
          Alert.alert(i18n.t('success') || 'Success', i18n.t('copiedToClipboard') || 'Copied to clipboard');
        }
      } else {
        await Share.share({ message });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  }, []);

  const handleRateApp = useCallback(async () => {
    try {
      console.log('[SettingsScreen] Rate app clicked');
      adTracker.trackClick('rate-app', 'settings', 'rate-button');
      
      const isAvailable = await StoreReview.isAvailableAsync();
      
      if (isAvailable) {
        await StoreReview.requestReview();
      } else {
        Alert.alert(
          i18n.t('rateApp') || 'تقييم التطبيق',
          i18n.t('rateAppDescription') || 'شكراً لك على استخدام التطبيق!',
          [{ text: i18n.t('ok') || 'حسناً' }]
        );
      }
    } catch (error) {
      console.error('Rate app error:', error);
    }
  }, []);

  const handleContactUs = useCallback(async () => {
    try {
      console.log('[SettingsScreen] WhatsApp contact clicked');
      adTracker.trackClick('whatsapp-contact', 'settings', 'whatsapp-button');
      const phoneNumber = '0788625580';
      const message = i18n.t('whatsappMessage') || 'مرحبا، أريد التواصل معكم';
      const whatsappUrl = `whatsapp://send?phone=962${phoneNumber.slice(1)}&text=${encodeURIComponent(message)}`;
      const whatsappWebUrl = `https://wa.me/962${phoneNumber.slice(1)}?text=${encodeURIComponent(message)}`;
      
      if (Platform.OS === 'web') {
        window.open(whatsappWebUrl, '_blank');
      } else {
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        if (canOpen) {
          await Linking.openURL(whatsappUrl);
        } else {
          await Linking.openURL(whatsappWebUrl);
        }
      }
    } catch (error) {
      console.error('WhatsApp contact error:', error);
      Alert.alert(i18n.t('error') || 'خطأ', i18n.t('whatsappError') || 'فشل فتح واتساب');
    }
  }, []);

  const handleOpenPrivacy = useCallback(() => {
    console.log('[SettingsScreen] Privacy policy clicked');
    adTracker.trackClick('privacy-policy', 'settings', 'privacy-button');
    router.push('/privacy' as any);
  }, []);

  const handleOpenTerms = useCallback(() => {
    console.log('[SettingsScreen] Terms of use clicked');
    adTracker.trackClick('terms-of-use', 'settings', 'terms-button');
    router.push('/terms' as any);
  }, []);

  const handleSelectTheme = useCallback((themeKey: ColorThemeKey) => {
    console.log(`[SettingsScreen] Theme changed to: ${themeKey}`);
    adTracker.trackClick(`theme-${themeKey}`, 'settings', 'theme-picker');
    updateSettings({ colorTheme: themeKey });
    setShowColorPicker(false);
  }, [updateSettings]);

  const handleRewardedAdClose = useCallback((rewardClaimed: boolean) => {
    console.log(`[SettingsScreen] Rewarded ad closed, reward claimed: ${rewardClaimed}`);
    setShowRewardedAd(false);
    if (rewardClaimed) {
      setTimeout(() => {
        setShowColorPicker(true);
      }, 300);
    }
  }, []);

  const handleRewardClaimed = useCallback((rewardValue: number) => {
    console.log(`[SettingsScreen] Reward claimed: ${rewardValue}`);
  }, []);

  const handleBackupData = useCallback(() => {
    console.log('[SettingsScreen] Backup data clicked');
    Alert.alert(
      i18n.t('exportData') || 'النسخ الاحتياطي',
      i18n.t('exportDataDescription') || 'تم حفظ البيانات بنجاح',
      [{ text: i18n.t('ok') || 'حسناً' }]
    );
  }, []);

  const handleResetData = useCallback(() => {
    console.log('[SettingsScreen] Reset data clicked');
    Alert.alert(
      i18n.t('resetData') || 'إعادة تعيين البيانات',
      i18n.t('resetDataConfirm') || 'هل أنت متأكد من حذف جميع البيانات؟',
      [
        { text: i18n.t('cancel') || 'إلغاء', style: 'cancel' },
        { 
          text: i18n.t('delete') || 'حذف', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(i18n.t('success') || 'نجح', i18n.t('dataResetSuccess') || 'تم حذف البيانات');
          }
        }
      ]
    );
  }, []);

  const fontSizeLabel = useMemo(() => {
    const size = settings.fontSize || 'medium';
    const labels: Record<string, string> = {
      small: i18n.t('small') || 'صغير',
      medium: i18n.t('medium') || 'متوسط',
      large: i18n.t('large') || 'كبير',
    };
    return labels[size] || labels.medium;
  }, [settings.fontSize]);

  const themeLabel = useMemo(() => {
    return settings.theme === 'dark' 
      ? (i18n.t('darkMode') || 'داكن')
      : (i18n.t('lightModeEnabled') || 'فاتح');
  }, [settings.theme]);

  const isRTL = currentLanguage === 'ar' || currentLanguage === 'ur';

  return (
    <View style={[styles.container, { backgroundColor: '#f5f5f5' }]} testID="settings-screen">
      <StatusBar barStyle="light-content" backgroundColor="#1a5c4c" />
      
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <Settings size={24} color="#fff" />
            <Text style={styles.headerTitle}>{i18n.t('settings')}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        testID="settings-scroll"
      >
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>م</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>مستخدم TasbeehCounter</Text>
            <Text style={styles.profileEmail}>user@example.com</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>{i18n.t('general') || 'عام'}</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<Vibrate size={22} color="#fff" />}
              title={i18n.t('vibration')}
              subtitle={i18n.t('vibrationOnTap')}
              type="toggle"
              value={settings.vibrationEnabled ?? true}
              onToggle={handleToggleSetting('vibrationEnabled')}
              variant="grouped"
              iconBgColor="#4A90D9"
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={<Bell size={22} color="#fff" />}
              title={i18n.t('sound') || 'الصوت'}
              subtitle={i18n.t('soundOnInteraction')}
              type="toggle"
              value={settings.soundEnabled ?? true}
              onToggle={handleToggleSetting('soundEnabled')}
              variant="grouped"
              iconBgColor="#F5A623"
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={<BellRing size={22} color="#fff" />}
              title={i18n.t('notifications')}
              subtitle={i18n.t('dailyReminders')}
              type="toggle"
              value={settings.reminderEnabled ?? false}
              onToggle={handleToggleSetting('reminderEnabled')}
              variant="grouped"
              iconBgColor="#E8734A"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>{i18n.t('appearance') || 'المظهر'}</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<Moon size={22} color="#fff" />}
              title={i18n.t('appearance') || 'المظهر'}
              subtitle={themeLabel}
              type="action"
              onPress={() => handleToggleDarkMode(settings.theme !== 'dark')}
              variant="grouped"
              iconBgColor="#9B59B6"
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={<Type size={22} color="#fff" />}
              title={i18n.t('fontSize') || 'حجم الخط'}
              subtitle={fontSizeLabel}
              type="action"
              onPress={() => setShowAppearanceSettings(true)}
              variant="grouped"
              iconBgColor="#3498DB"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>{i18n.t('dataManagement') || 'البيانات والخصوصية'}</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<Cloud size={22} color="#fff" />}
              title={i18n.t('exportData') || 'النسخ الاحتياطي'}
              subtitle={i18n.t('exportDataDescription') || 'حفظ البيانات'}
              type="action"
              onPress={handleBackupData}
              variant="grouped"
              iconBgColor="#5DADE2"
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={<RotateCcw size={22} color="#fff" />}
              title={i18n.t('resetData') || 'إعادة تعيين البيانات'}
              subtitle={i18n.t('resetSettingsDescription') || 'حذف جميع البيانات'}
              type="action"
              onPress={handleResetData}
              variant="grouped"
              iconBgColor="#E74C3C"
              danger
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>{i18n.t('contactSupport')}</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<Share2 size={22} color="#fff" />}
              title={i18n.t('shareApp')}
              subtitle={i18n.t('shareAppDescription')}
              type="action"
              onPress={handleShareApp}
              variant="grouped"
              iconBgColor="#27AE60"
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={<Star size={22} color="#fff" />}
              title={i18n.t('rateApp')}
              subtitle={i18n.t('rateAppDescription')}
              type="action"
              onPress={handleRateApp}
              variant="grouped"
              iconBgColor="#F39C12"
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={<MessageCircle size={22} color="#fff" />}
              title={i18n.t('contactUs')}
              subtitle={i18n.t('contactUsWhatsApp')}
              type="action"
              onPress={handleContactUs}
              variant="grouped"
              iconBgColor="#25D366"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>{i18n.t('about')}</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<Shield size={22} color="#fff" />}
              title={i18n.t('privacy')}
              subtitle={i18n.t('viewPrivacyPolicy')}
              type="action"
              onPress={handleOpenPrivacy}
              variant="grouped"
              iconBgColor="#8E44AD"
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={<FileText size={22} color="#fff" />}
              title={i18n.t('terms')}
              subtitle={i18n.t('viewTerms')}
              type="action"
              onPress={handleOpenTerms}
              variant="grouped"
              iconBgColor="#2980B9"
            />
          </View>
        </View>
      </ScrollView>

      <LanguagePicker
        visible={showLanguagePicker}
        onClose={() => setShowLanguagePicker(false)}
      />

      <ColorThemePicker
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        currentTheme={settings.colorTheme || 'gold'}
        onSelectTheme={handleSelectTheme}
      />

      <AppearanceSettings
        visible={showAppearanceSettings}
        onClose={() => setShowAppearanceSettings(false)}
      />

      <RewardedAd
        visible={showRewardedAd}
        onClose={handleRewardedAdClose}
        onRewardClaimed={handleRewardClaimed}
        adId="color-theme-unlock"
        videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        rewardValue={1}
        rewardMessage="تم فتح سمات الألوان! اختر اللون المفضل لديك الآن"
        testID="color-theme-rewarded-ad"
      />
    </View>
  );
});

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1a5c4c',
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  backButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  profileCard: {
    backgroundColor: '#d4ede5',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a5c4c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1a5c4c',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#1a5c4c',
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionTitleRTL: {
    textAlign: 'right',
    marginLeft: 0,
    marginRight: 4,
  },
  settingsCard: {
    backgroundColor: '#d4ede5',
    borderRadius: 16,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(26, 92, 76, 0.15)',
    marginLeft: 76,
  },
});
