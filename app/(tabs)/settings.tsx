import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { StyleSheet, View, Text, ScrollView, Share, Linking, Alert, Platform, StatusBar } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings,
  Vibrate,
  Bell,
  BellRing,

  Cloud,
  RotateCcw,
  Share2,
  Star,
  Shield,
  FileText,
  MessageCircle,
  User,
  Sparkles,
  Globe,

  Mic,
} from 'lucide-react-native';
import { useTasbihStore } from '@/hooks/useTasbihStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { LanguagePicker } from '@/components/LanguagePicker';

import { SettingsItem } from '@/components/SettingsItem';
import i18n, { AVAILABLE_LANGUAGES } from '@/constants/translations';
import { ColorThemeKey } from '@/theme/ThemeProvider';
import { notificationService } from '@/utils/notificationService';
import { adTracker } from '@/utils/adTracking';
import { adStrategy } from '@/utils/adStrategy';
import AdBanner from '@/components/AdBanner';
import RewardedAd from '@/components/RewardedAd';
import { ReciterPicker } from '@/components/ReciterPicker';
import { useReciterStore } from '@/hooks/useReciterStore';
import { ReciterId } from '@/utils/ttsService';

const SettingsScreen = memo(function SettingsScreen() {
  const { settings, updateSettings, resetAllData, tasbihItems, stats } = useTasbihStore();
  const { currentLanguage } = useLanguageStore();
  const { currentReciter, changeReciter, getCurrentReciterName } = useReciterStore();
  const insets = useSafeAreaInsets();
  const [showLanguagePicker, setShowLanguagePicker] = useState<boolean>(false);

  const [showReciterPicker, setShowReciterPicker] = useState<boolean>(false);
  const [showRewardedAd, setShowRewardedAd] = useState<boolean>(false);
  const [currentAd, setCurrentAd] = useState(adStrategy.getRandomBannerAd());

  useEffect(() => {
    console.log('[SettingsScreen] Screen mounted - tracking KPI');
    adTracker.trackImpression('settings-screen', 'settings', 'screen-view');

    const adRefreshInterval = setInterval(() => {
      setCurrentAd(adStrategy.getRandomBannerAd());
    }, 45000);

    return () => clearInterval(adRefreshInterval);
  }, []);

  const handleToggleSetting = useCallback(
    (key: keyof typeof settings) => async (value: boolean) => {
      console.log(`[SettingsScreen] Toggle setting: ${key} = ${value}`);
      adTracker.trackClick(`toggle-${key}`, 'settings', 'toggle-switch');
      updateSettings({ [key]: value });
      
      if (key === 'reminderEnabled') {
        await notificationService.scheduleDailyReminder(value);
      }
    },
    [updateSettings]
  );

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

  const handleSelectReciter = useCallback((reciterId: ReciterId) => {
    console.log(`[SettingsScreen] Reciter changed to: ${reciterId}`);
    adTracker.trackClick(`reciter-${reciterId}`, 'settings', 'reciter-picker');
    changeReciter(reciterId);
    setShowReciterPicker(false);
  }, [changeReciter]);

  const handleRewardedAdClose = useCallback((rewardClaimed: boolean) => {
    console.log(`[SettingsScreen] Rewarded ad closed, reward claimed: ${rewardClaimed}`);
    setShowRewardedAd(false);
  }, []);

  const handleRewardClaimed = useCallback((rewardValue: number) => {
    console.log(`[SettingsScreen] Reward claimed: ${rewardValue}`);
  }, []);

  const handleBackupData = useCallback(async () => {
    console.log('[SettingsScreen] Backup data clicked');
    try {
      const backupData = JSON.stringify({
        tasbihItems,
        settings,
        stats,
        meta: {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          platform: Platform.OS
        }
      }, null, 2);

      const message = i18n.t('shareBackup') || 'Tasbih App Backup Data';
      
      if (Platform.OS === 'web') {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(backupData);
          Alert.alert(
            i18n.t('success') || 'Success',
            i18n.t('backupCopied') || 'Backup data copied to clipboard'
          );
        } else {
           Alert.alert(i18n.t('error'), 'Clipboard not available');
        }
      } else {
        await Share.share({
          title: message,
          message: backupData,
        });
      }
      
      adTracker.trackClick('backup-data', 'settings', 'backup-button');
    } catch (error) {
      console.error('Backup error:', error);
      Alert.alert(i18n.t('error'), 'Failed to create backup');
    }
  }, [tasbihItems, settings, stats]);

  const handleResetData = useCallback(() => {
    console.log('[SettingsScreen] Reset data clicked');
    Alert.alert(
      i18n.t('resetData') || 'إعادة تعيين البيانات',
      i18n.t('resetDataConfirm') || 'هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.',
      [
        { text: i18n.t('cancel') || 'إلغاء', style: 'cancel' },
        { 
          text: i18n.t('delete') || 'حذف', 
          style: 'destructive',
          onPress: async () => {
            try {
              await resetAllData();
              adTracker.trackClick('reset-data', 'settings', 'reset-button');
              Alert.alert(i18n.t('success') || 'نجح', i18n.t('dataResetSuccess') || 'تم حذف البيانات بنجاح');
            } catch (error) {
              console.error('Reset error:', error);
              Alert.alert(i18n.t('error'), 'Failed to reset data');
            }
          }
        }
      ]
    );
  }, [resetAllData]);

  const isRTL = currentLanguage === 'ar' || currentLanguage === 'ur';

  const languageLabel = useMemo(() => {
    const lang = AVAILABLE_LANGUAGES.find(l => l.code === currentLanguage);
    return lang ? lang.nativeName : 'English';
  }, [currentLanguage]);

  return (
    <View style={styles.container} testID="settings-screen">
      <StatusBar barStyle="light-content" backgroundColor="#0d4d3e" />
      
      <LinearGradient
        colors={['#0d4d3e', '#1a5c4c', '#267261']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconContainer}>
              <Settings size={26} color="#fff" strokeWidth={2.5} />
            </View>
            <Text style={styles.headerTitle}>{i18n.t('settings')}</Text>
          </View>
        </View>
        
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatarContainer}>
            <LinearGradient
              colors={['#fff', '#f0f0f0']}
              style={styles.profileAvatar}
            >
              <User size={32} color="#1a5c4c" strokeWidth={2.5} />
            </LinearGradient>
          </View>
          <View style={styles.profileHeaderInfo}>
            <Text style={styles.profileHeaderName}>مستخدم TasbeehCounter</Text>
            <Text style={styles.profileHeaderEmail}>user@example.com</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        testID="settings-scroll"
      >

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Sparkles size={16} color="#1a5c4c" strokeWidth={2.5} />
            </View>
            <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>{i18n.t('general') || 'عام'}</Text>
          </View>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon={<Globe size={22} color="#fff" />}
              title={i18n.t('language') || 'اللغة'}
              subtitle={languageLabel}
              type="action"
              onPress={() => setShowLanguagePicker(true)}
              variant="grouped"
              iconBgColor="#8B5CF6"
            />
            <View style={styles.divider} />
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
            <View style={styles.divider} />
            <SettingsItem
              icon={<Mic size={22} color="#fff" />}
              title={i18n.t('reciter') || 'القارئ'}
              subtitle={getCurrentReciterName()}
              type="action"
              onPress={() => setShowReciterPicker(true)}
              variant="grouped"
              iconBgColor="#8B5CF6"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Sparkles size={16} color="#1a5c4c" strokeWidth={2.5} />
            </View>
            <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>{i18n.t('dataManagement') || 'البيانات والخصوصية'}</Text>
          </View>
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
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Sparkles size={16} color="#1a5c4c" strokeWidth={2.5} />
            </View>
            <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>{i18n.t('contactSupport')}</Text>
          </View>
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
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Sparkles size={16} color="#1a5c4c" strokeWidth={2.5} />
            </View>
            <Text style={[styles.sectionTitle, isRTL && styles.sectionTitleRTL]}>{i18n.t('about')}</Text>
          </View>
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

      <ReciterPicker
        visible={showReciterPicker}
        onClose={() => setShowReciterPicker(false)}
        onSelect={handleSelectReciter}
        currentReciter={currentReciter}
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

      <View style={styles.fixedAdContainer}>
        <AdBanner
          imageUrl={currentAd?.imageUrl || "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=400&h=200&fit=crop"}
          headline={currentAd?.headline || i18n.t('premiumIslamicContent') || 'محتوى إسلامي مميز'}
          cta={currentAd?.cta || i18n.t('explore') || 'استكشف'}
          destinationUrl={currentAd?.destinationUrl || "https://www.islamicfinder.org/"}
          variant={settings.theme === 'dark' ? 'dark' : 'light'}
          height={80}
          testID="settings-bottom-ad"
        />
      </View>
    </View>
  );
});

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faf9',
  },
  headerGradient: {
    paddingBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
    letterSpacing: 0.5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    justifyContent: 'flex-start',
  },
  profileAvatarContainer: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileHeaderInfo: {
    marginHorizontal: 16,
    flex: 1,
  },
  profileHeaderName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  profileHeaderEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.2,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  fixedAdContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(26, 92, 76, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1a5c4c',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionTitleRTL: {
    textAlign: 'right',
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(26, 92, 76, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(26, 92, 76, 0.08)',
    marginStart: 76,
  },
});
