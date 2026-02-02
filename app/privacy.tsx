import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import i18n from '@/constants/translations';

export default function PrivacyScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: i18n.t('privacy'),
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          presentation: 'modal',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 40 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.title, { color: theme.text }]}>
            {i18n.t('privacy')}
          </Text>
          <Text style={[styles.date, { color: theme.textSecondary }]}>
            آخر تحديث: 14 أكتوبر 2025
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            1. المقدمة
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            نحن في تطبيق سبّح نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            2. البيانات التي نجمعها
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            تطبيق سبّح يعمل بشكل محلي على جهازك. نحن نجمع فقط:
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • عدد التسبيحات والأذكار التي تقوم بها
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • إعدادات التطبيق الخاصة بك (اللغة، السمة، إلخ)
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • الأذكار المخصصة التي تضيفها
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            جميع هذه البيانات يتم تخزينها محلياً على جهازك فقط.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            3. كيف نستخدم بياناتك
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            نستخدم البيانات المحلية فقط لـ:
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • تتبع تقدمك في الأذكار والتسبيح
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • حفظ تفضيلاتك وإعداداتك
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • تحسين تجربتك في استخدام التطبيق
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            4. مشاركة البيانات
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            نحن لا نشارك أو نبيع أو ننقل بياناتك الشخصية إلى أي طرف ثالث. جميع بياناتك تبقى على جهازك فقط.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            5. الإعلانات
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            قد يحتوي التطبيق على إعلانات من شركات إعلانية. هذه الشركات قد تجمع معلومات غير شخصية مثل:
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • نوع الجهاز ونظام التشغيل
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • معرف الإعلانات (Advertising ID)
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • معلومات الاستخدام العامة
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            يمكنك إيقاف الإعلانات المخصصة من إعدادات جهازك.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            6. أمان البيانات
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            نستخدم تقنيات التشفير والحماية لضمان أمان بياناتك المحلية. ومع ذلك، لا يمكن ضمان الأمان بنسبة 100% على الإنترنت.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            7. حقوقك
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            لديك الحق في:
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • الوصول إلى بياناتك المحلية
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • تصدير بياناتك
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • حذف جميع بياناتك من التطبيق
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            يمكنك القيام بذلك من خلال إعدادات التطبيق.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            8. خصوصية الأطفال
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            التطبيق مناسب لجميع الأعمار. نحن لا نجمع عمداً معلومات شخصية من الأطفال دون سن 13 عاماً.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            9. التغييرات على السياسة
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم إخطارك بأي تغييرات جوهرية من خلال التطبيق.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            10. التواصل معنا
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            إذا كان لديك أي أسئلة حول سياسة الخصوصية، يمكنك التواصل معنا من خلال إعدادات التطبيق.
          </Text>
        </View>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            © 2025 سبّح. جميع الحقوق محفوظة.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    padding: 8,
    marginLeft: Platform.OS === 'ios' ? 0 : 8,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  section: {
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    marginBottom: 8,
    textAlign: 'right',
  },
  date: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    marginBottom: 12,
    textAlign: 'right',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 12,
    textAlign: 'right',
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 8,
    paddingRight: 8,
    textAlign: 'right',
  },

  footer: {
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
