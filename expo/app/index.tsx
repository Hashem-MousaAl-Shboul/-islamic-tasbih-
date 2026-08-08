import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WELCOME_SEEN_KEY = 'welcome_screen_seen';
const GOLD = '#D4A853';
const BG_COLOR = '#0A1A14';
const INDEX_TAG = '[Index]';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const checkWelcomeStatus = async () => {
      try {
        console.log(INDEX_TAG, 'Checking welcome screen status...');
        const val = await AsyncStorage.getItem(WELCOME_SEEN_KEY);
        const seen = val === 'true';

        if (!isMounted) return;

        if (seen) {
          console.log(INDEX_TAG, 'Welcome seen, navigating to tabs');
          router.replace('/(tabs)/tasbih');
        } else {
          console.log(INDEX_TAG, 'First launch, showing welcome');
          router.replace('/welcome');
        }
      } catch (e) {
        console.log(INDEX_TAG, 'Navigation error:', e);
        if (isMounted) {
          router.replace('/welcome');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkWelcomeStatus();

    return () => {
      isMounted = false;
    };
  }, [router]);

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