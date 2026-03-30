import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WELCOME_SEEN_KEY = 'welcome_screen_seen';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const hasNavigated = useRef<boolean>(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const navigate = async () => {
      try {
        const val = await AsyncStorage.getItem(WELCOME_SEEN_KEY);
        const seen = val === 'true';

        if (hasNavigated.current) return;
        hasNavigated.current = true;
        setLoading(false);

        await new Promise<void>((resolve) => {
          timeout = setTimeout(resolve, Platform.OS === 'android' ? 150 : 50);
        });

        if (seen) {
          router.replace('/(tabs)/tasbih');
        } else {
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
    };

    const startTimeout = setTimeout(navigate, 100);

    return () => {
      clearTimeout(startTimeout);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return (
    <View style={styles.loader}>
      {loading && <ActivityIndicator size="large" color="#D4A54A" />}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1A14',
  },
});
