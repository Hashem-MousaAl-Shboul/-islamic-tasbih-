import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, BookmarkCheck, Heart } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const WELCOME_SEEN_KEY = 'welcome_screen_seen';
const WELCOME_TAG = '[WelcomeScreen]';

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(25)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log(WELCOME_TAG, 'Screen mounted');
    Animated.sequence([
      Animated.parallel([
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cardSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(buttonFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(buttonSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeAnim, slideAnim, cardFade, cardSlide, buttonFade, buttonSlide, iconScale, iconOpacity]);

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
    <LinearGradient
      colors={['#1a6b4a', '#1b7d5a', '#1a8a6a', '#18796a']}
      locations={[0, 0.35, 0.65, 1]}
      style={styles.background}
      testID="welcome-background"
    >
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Animated.View
            style={[
              styles.iconCircle,
              {
                opacity: iconOpacity,
                transform: [{ scale: iconScale }],
              },
            ]}
          >
            <Sparkles size={32} color="#FFFFFF" strokeWidth={1.8} />
          </Animated.View>

          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.title} testID="welcome-title">تسبيح</Text>
            <Text style={styles.subtitle} testID="welcome-subtitle">
              عداد إلكتروني للأذكار والتسبيح
            </Text>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.cardsSection,
            {
              opacity: cardFade,
              transform: [{ translateY: cardSlide }],
            },
          ]}
        >
          <View style={styles.featureCard}>
            <View style={styles.cardIconContainer}>
              <BookmarkCheck size={22} color="#FFFFFF" strokeWidth={1.8} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>حفظ الأذكار</Text>
              <Text style={styles.cardDescription}>أضف أذكارك المفضلة وصنفها</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.cardIconContainer}>
              <Heart size={22} color="#FFFFFF" strokeWidth={1.8} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>تجربة روحانية</Text>
              <Text style={styles.cardDescription}>تصميم هادئ يساعدك على الخشوع</Text>
            </View>
          </View>
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
              accessibilityLabel="ابدأ التسبيح"
            >
              <Text style={styles.buttonText}>ابدأ التسبيح</Text>
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.hintText}>اضغط للبدء</Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: height * 0.1,
    paddingBottom: height * 0.06,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: height * 0.04,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(180, 160, 80, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontWeight: '400' as const,
    letterSpacing: 0.3,
  },
  cardsSection: {
    width: '100%',
    paddingHorizontal: 28,
    gap: 14,
  },
  featureCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(160, 140, 60, 0.35)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(200, 180, 100, 0.2)',
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(160, 140, 60, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  cardTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'right',
  },
  cardDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '400' as const,
    textAlign: 'right',
  },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 28,
  },
  button: {
    backgroundColor: '#1a3a2a',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    minWidth: width * 0.75,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  hintText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '400' as const,
    marginTop: 12,
  },
});
