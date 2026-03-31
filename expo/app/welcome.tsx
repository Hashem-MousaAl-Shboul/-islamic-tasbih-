import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const WELCOME_SEEN_KEY = 'welcome_screen_seen';
const WELCOME_TAG = '[WelcomeScreen]';

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log(WELCOME_TAG, 'Screen mounted');
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(buttonFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(buttonSlide, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeAnim, slideAnim, buttonFade, buttonSlide]);

  const handleContinue = useCallback(async () => {
    console.log(WELCOME_TAG, 'Continue button pressed');

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {
        console.log(WELCOME_TAG, 'Haptic error:', e);
      }
    }

    try {
      await AsyncStorage.setItem(WELCOME_SEEN_KEY, 'true');
      console.log(WELCOME_TAG, 'Welcome seen state saved');
    } catch (e) {
      console.log(WELCOME_TAG, 'Error saving welcome seen state:', e);
    }
    router.replace('/(tabs)/tasbih');
  }, [router, buttonScale]);

  return (
    <ImageBackground
      source={require('@/assets/images/welcome-bg.jpg')}
      style={styles.background}
      resizeMode="cover"
      testID="welcome-background"
    >
      <View style={styles.overlay} />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.bismillah} testID="welcome-bismillah">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </Text>
          <Text style={styles.title} testID="welcome-title">سبّح</Text>
          <Text style={styles.subtitle} testID="welcome-subtitle">
            تطبيق التسبيح والأذكار
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.bottomSection,
            {
              opacity: buttonFade,
              transform: [{ translateY: buttonSlide }],
            },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleContinue}
              activeOpacity={0.8}
              testID="welcome-continue-btn"
              accessibilityRole="button"
              accessibilityLabel="ابدأ الآن"
            >
              <Text style={styles.buttonText}>ابدأ الآن</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 40, 20, 0.35)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.12,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: height * 0.28,
  },
  bismillah: {
    fontSize: 18,
    color: '#E8D5A3',
    fontWeight: '500' as const,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 52,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    fontWeight: '400' as const,
    letterSpacing: 0.3,
  },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: '#D4A54A',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    minWidth: width * 0.65,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
});
