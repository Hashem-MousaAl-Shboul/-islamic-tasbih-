import { Redirect, Stack, useSegments } from 'expo-router';
import { ActivityIndicator, Platform, View } from 'react-native';
import { useEffect } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useTheme } from '@/theme/ThemeProvider';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function AuthLayout() {
  const theme = useTheme();
  const { user, isLoading } = useAuthStore();
  const segments = useSegments();

  // ✅ منع خطأ الويب: تشغيل فقط على الهاتف
  useEffect(() => {
    if (Platform.OS !== 'web') {
      GoogleSignin.maybeCompleteAuthSession();
    }
  }, []);

  const isVerifyScreen = (segments as string[]).includes('verify-email');

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      />
    );
  }

  return <Redirect href="/(tabs)/tasbih" />;
}

export function redirectSystemPath({
  path,
  initial,
}: { path: string; initial: boolean }) {
  if (initial) {
    return '/';
  }
  return path || '/';
}
