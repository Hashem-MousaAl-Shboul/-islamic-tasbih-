import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useAuth } from '@/hooks/useAuthStore';
import { LogIn, Sparkles } from 'lucide-react-native';
import { notificationService } from '@/utils/notificationService';

const WELCOME_SEEN_KEY = 'welcome_screen_seen';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const { signInWithGoogle, isLoading } = useAuth();
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeAnim, slideAnim, buttonFade, scaleAnim]);

  const requestNotificationPermission = useCallback(async () => {
    if (Platform.OS !== 'web') {
      try {
        await notificationService.registerForPushNotificationsAsync();
        console.log('[Welcome] Notification permission requested');
      } catch (error) {
        console.log('[Welcome] Notification permission error:', error);
      }
    }
  }, []);

  const handleContinue = useCallback(async () => {
    try {
      setIsNavigating(true);
      await AsyncStorage.setItem(WELCOME_SEEN_KEY, 'true');
      await requestNotificationPermission();
      router.replace('/(tabs)/tasbih');
    } catch (error) {
      console.error('[Welcome] Error saving welcome status:', error);
      router.replace('/(tabs)/tasbih');
    } finally {
      setIsNavigating(false);
    }
  }, [router, requestNotificationPermission]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setIsNavigating(true);
      await AsyncStorage.setItem(WELCOME_SEEN_KEY, 'true');
      await signInWithGoogle();
      await requestNotificationPermission();
      router.replace('/(tabs)/tasbih');
    } catch (error) {
      console.error('[Welcome] Error during sign in:', error);
    } finally {
      setIsNavigating(false);
    }
  }, [router, signInWithGoogle, requestNotificationPermission]);

  const handleImageError = useCallback(() => {
    console.log('[Welcome] Image failed to load');
    setImageError(true);
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="light" />

        <View style={styles.content}>
          <Animated.View
            style={[
              styles.textSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.imageContainer}>
              {imageError ? (
                <View style={styles.fallbackIcon}>
                  <Sparkles size={64} color="#FFFFFF" />
                </View>
              ) : (
                <Image
                  source={{
                    uri: 'https://r2-pub.rork.com/generated-images/185d21e4-9ae3-4470-9101-ffcd089a568c.png',
                  }}
                  style={styles.image}
                  resizeMode="contain"
                  onError={handleImageError}
                />
              )}
            </View>
            <Text style={styles.title}>{t('welcomeTitle1')}</Text>
            <Text style={styles.subtitle}>{t('welcomeDesc1')}</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.buttonSection,
              {
                opacity: buttonFade,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.button, styles.googleButton]}
              onPress={handleGoogleSignIn}
              disabled={isLoading || isNavigating}
              activeOpacity={0.8}
              testID="welcome-google-signin"
            >
              {isLoading ? (
                <ActivityIndicator color="#1B6B5A" />
              ) : (
                <>
                  <LogIn size={20} color="#1B6B5A" style={styles.buttonIcon} />
                  <Text style={[styles.buttonText, styles.googleButtonText]}>
                    {t('signInWithGoogle')}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.continueButton]}
              onPress={handleContinue}
              disabled={isLoading || isNavigating}
              activeOpacity={0.8}
              testID="welcome-continue"
            >
              {isNavigating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {t('continueWithoutAccount')}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#145C4B',
  },
  bgTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1B7A62',
    height: '60%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  bgBottom: {
    ...StyleSheet.absoluteFillObject,
    top: '60%',
    backgroundColor: '#145C4B',
  },
  decorCircle1: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: SCREEN_WIDTH * 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    top: -SCREEN_WIDTH * 0.15,
    right: -SCREEN_WIDTH * 0.2,
  },
  decorCircle2: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    borderRadius: SCREEN_WIDTH * 0.25,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: SCREEN_WIDTH * 0.1,
    left: -SCREEN_WIDTH * 0.15,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: 160,
    height: 160,
    marginBottom: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  fallbackIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 130,
    height: 130,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 23,
    paddingHorizontal: 16,
  },
  buttonSection: {
    gap: 12,
    paddingBottom: 8,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  continueButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonIcon: {
    marginEnd: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  googleButtonText: {
    color: '#1B6B5A',
  },
});
