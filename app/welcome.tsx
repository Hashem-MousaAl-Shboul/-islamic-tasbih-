import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguageStore } from '@/hooks/useLanguageStore';

const WELCOME_SEEN_KEY = 'welcome_screen_seen';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();

  const handlePress = useCallback(async () => {
    try {
      await AsyncStorage.setItem(WELCOME_SEEN_KEY, 'true');
      router.replace('/login');
    } catch (error) {
      console.error('Error saving welcome status:', error);
      router.replace('/login');
    }
  }, [router]);

  return (
    <View style={styles.backgroundImage}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        
        <View style={styles.content}>
        <View style={styles.textSection}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: 'https://r2-pub.rork.com/generated-images/185d21e4-9ae3-4470-9101-ffcd089a568c.png' }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>{t('welcomeTitle1')}</Text>
          <Text style={styles.subtitle}>{t('welcomeDesc1')}</Text>
        </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>{t('getStarted')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: 200,
    height: 200,
    marginBottom: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  button: {
    backgroundColor: '#128C7E',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
