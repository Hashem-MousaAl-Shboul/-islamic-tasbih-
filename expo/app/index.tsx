import { useRouter } from 'expo-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WELCOME_SEEN_KEY = 'welcome_screen_seen';
const GOLD = '#D4A853';
const BG_COLOR = '#0A1A14';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const hasNavigated = useRef<boolean>(false);

  const navigateToApp = useCallback(async () => {
    try {
      console.log('[Index] Checking welcome screen status');
      const val = await AsyncStorage.getItem(WELCOME_SEEN_KEY);
      const seen = val === 'true';

      if (hasNavigated.current) return;
      hasNavigated.current = true;
      setLoading(false);

      await new Promise<void>((resolve) => {
        setTimeout(resolve, Platform.OS === 'android' ? 150 : 50);
      });

      if (seen) {
        console.log('[Index] Welcome seen, navigating to tabs');
        router.replace('/(tabs)/tasbih');
      } else {
        console.log('[Index] First launch, showing welcome');
        router.replace('/welcome');
      }
    } catch (e) {
      console.log('[Index] Navigation error:', e);
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        setLoading(false);
        router.replace('/welcome');
      }
    }
  }, [router]);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      void navigateToApp();
    }, 100);

    return () => {
      clearTimeout(startTimeout);
    };
  }, [navigateToApp]);

  return (
    <View style={styles.loader} testID="index-screen">
      {loading && <ActivityIndicator size="large" color={GOLD} />}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG_COLOR,
  },
});
