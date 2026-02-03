import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuthStore';

const WELCOME_SEEN_KEY = 'welcome_screen_seen';

export default function Index() {
  const router = useRouter();
  const tokens = useTheme();
  const { isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    let mounted = true;

    const checkWelcomeStatus = async () => {
      if (isAuthLoading) {
        return;
      }

      try {
        const hasSeenWelcome = await AsyncStorage.getItem(WELCOME_SEEN_KEY);
        
        if (!mounted) return;

        if (hasSeenWelcome === 'true') {
          router.replace('/(tabs)/tasbih');
        } else {
          router.replace('/welcome');
        }
      } catch (error) {
        console.error('Error checking welcome status:', error);
        if (mounted) {
          router.replace('/welcome');
        }
      }
    };

    const timer = setTimeout(() => {
      checkWelcomeStatus();
    }, 500);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [router, isAuthLoading]);

  return (
    <View style={[styles.container, { backgroundColor: tokens.background }]}>
      <ActivityIndicator size="large" color={tokens.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
