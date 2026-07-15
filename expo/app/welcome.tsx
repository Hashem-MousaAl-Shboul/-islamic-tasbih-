import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Sparkles,
  Fingerprint,
  BookOpen,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react-native';
import { androidTextFix, androidRipple } from '@/utils/androidOptimizations';

const { width } = Dimensions.get('window');
const WELCOME_SEEN_KEY = 'welcome_screen_seen';
const WELCOME_TAG = '[WelcomeScreen]';
console.log(WELCOME_TAG, 'Welcome module loaded');

const FEATURES = [
  {
    icon: Fingerprint,
    title: 'عداد التسبيح',
    description: 'عدّاد إلكتروني ذكي لتتبع أذكارك وتسبيحاتك بسهولة',
    accent: '#D4A853',
    accentBg: 'rgba(212, 168, 83, 0.25)',
  },
  {
    icon: BookOpen,
    title: 'الأذكار',
    description: 'أذكار الصباح والمساء وأدعية متنوعة من السنة النبوية',
    accent: '#A78BFA',
    accentBg: 'rgba(167, 139, 250, 0.25)',
  },
  {
    icon: TrendingUp,
    title: 'الإحصائيات',
    description: 'تتبع تقدمك اليومي والأسبوعي في الأذكار والتسبيح',
    accent: '#34D399',
    accentBg: 'rgba(52, 211, 153, 0.25)',
  },
  {
    icon: SlidersHorizontal,
    title: 'الإعدادات',
    description: 'تخصيص اللغة والمظهر والأصوات والاهتزاز حسب رغبتك',
    accent: '#FB923C',
    accentBg: 'rgba(251, 146, 60, 0.25)',
  },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const iconScale = useRef(new Animated.Value(0.4)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(24)).current;

  const cardAnims = useRef(
    FEATURES.map(() => ({
      fade: new Animated.Value(0),
      slide: new Animated.Value(30),
    }))
  ).current;

  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log(WELCOME_TAG, 'Welcome screen mounted');

    const cardSequence = cardAnims.map((anim) =>
      Animated.parallel([
        Animated.timing(anim.fade, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(anim.slide, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.sequence([
      Animated.parallel([
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 450,
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
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(120, cardSequence),
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
  }, [iconOpacity, iconScale, titleFade, titleSlide, cardAnims, buttonFade, buttonSlide]);

  const handleContinue = useCallback(async () => {
    console.log(WELCOME_TAG, 'Continue button pressed');

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.94,
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
      colors={['#0f3d2e', '#1a6b4a', '#1a8a6a', '#155e4a']}
      locations={[0, 0.3, 0.65, 1]}
      style={styles.background}
      testID="welcome-background"
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
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
            <Sparkles size={30} color="#FFFFFF" strokeWidth={1.8} />
          </Animated.View>

          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: titleFade,
                transform: [{ translateY: titleSlide }],
              },
            ]}
          >
            <Text style={[styles.title, androidTextFix]} testID="welcome-title">تسبيح</Text>
            <Text style={[styles.subtitle, androidTextFix]} testID="welcome-subtitle">
              عداد إلكتروني للأذكار والتسبيح
            </Text>
          </Animated.View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardsSection}>
          <Text style={[styles.sectionLabel, androidTextFix]}>مميزات التطبيق</Text>
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            const anim = cardAnims[index];
            return (
              <Animated.View
                key={feature.title}
                style={[
                  styles.featureCard,
                  {
                    opacity: anim.fade,
                    transform: [{ translateY: anim.slide }],
                  },
                ]}
              >
                <View style={[styles.cardIconCircle, { backgroundColor: feature.accentBg }]}>
                  <Icon size={22} color={feature.accent} strokeWidth={1.8} />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={[styles.cardTitle, androidTextFix]}>{feature.title}</Text>
                  <Text style={[styles.cardDescription, androidTextFix]}>{feature.description}</Text>
                </View>
              </Animated.View>
            );
          })}
        </View>

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
            <Pressable
              style={styles.button}
              onPress={handleContinue}
              android_ripple={androidRipple('rgba(212,168,83,0.25)')}
              testID="welcome-continue-btn"
              accessibilityRole="button"
            >
              <Text style={[styles.buttonText, androidTextFix]}>ابدأ التسبيح</Text>
            </Pressable>
          </Animated.View>
          <Text style={[styles.hintText, androidTextFix]}>اضغط للبدء</Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(212, 168, 83, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 83, 0.25)',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    fontWeight: '400' as const,
    letterSpacing: 0.3,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(212, 168, 83, 0.5)',
    alignSelf: 'center',
    marginVertical: 24,
    borderRadius: 1,
  },
  cardsSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'right',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  featureCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
  },
  cardTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'right',
  },
  cardDescription: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '400' as const,
    textAlign: 'right',
    lineHeight: 19,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  button: {
    backgroundColor: 'rgba(10, 26, 20, 0.7)',
    paddingVertical: 17,
    paddingHorizontal: 36,
    borderRadius: 28,
    minWidth: width * 0.72,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 83, 0.2)',
    overflow: 'hidden' as const,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  hintText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '400' as const,
    marginTop: 10,
  },
});
