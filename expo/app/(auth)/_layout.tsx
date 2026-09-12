import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useTheme } from '@/theme/ThemeProvider';

export default function AuthLayout() {
  const theme = useTheme();
  const { user, isLoading } = useAuthStore();

  // 1. حالة التحميل
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

  // 2. إذا كان المستخدم مسجل دخوله بالفعل، أرسله إلى الشاشة الرئيسية للتطبيق
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // 3. إذا لم يكن مسجلاً، اترك له حرية التصفح داخل صفحات Auth (تسجيل الدخول / إنشاء حساب)
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}