import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useAuth } from '@/hooks/useAuthStore';
import { useTheme } from '@/theme/ThemeProvider';
import { LogIn } from 'lucide-react-native';
import { notificationService } from '@/utils/notificationService';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const { signInWithGoogle, isLoading } = useAuth();
  const tokens = useTheme();

  const requestNotificationPermission = useCallback(async () => {
    if (Platform.OS !== 'web') {
      try {
        await notificationService.registerForPushNotificationsAsync();
        console.log('[Login] Notification permission requested');
      } catch (error) {
        console.log('[Login] Notification permission error:', error);
      }
    }
  }, []);

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    await requestNotificationPermission();
    router.replace('/(tabs)/tasbih');
  };

  const handleSkip = async () => {
    await requestNotificationPermission();
    router.replace('/(tabs)/tasbih');
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.primary }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        
        <View style={styles.content}>
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <LogIn size={80} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>{t('welcomeBack')}</Text>
            <Text style={styles.subtitle}>{t('signInDescription')}</Text>
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity 
              style={[styles.googleButton, { backgroundColor: '#FFFFFF' }]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator color={tokens.primary} />
              ) : (
                <>
                  <Image 
                    source={{ uri: 'https://www.google.com/favicon.ico' }}
                    style={styles.googleIcon}
                  />
                  <Text style={[styles.googleButtonText, { color: '#333333' }]}>
                    {t('signInWithGoogle')}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>{t('skip')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    opacity: 0.9,
  },
  buttonSection: {
    gap: 16,
  },
  googleButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginEnd: 12,
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
