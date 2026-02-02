import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import i18n from '@/constants/translations';

export default function TermsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: i18n.t('terms'),
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
            {i18n.t('terms')}
          </Text>
          <Text style={[styles.date, { color: theme.textSecondary }]}>
            آخر تحديث: 14 أكتوبر 2025
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            1. قبول الشروط
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            باستخدامك لتطبيق سبّح، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام التطبيق.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            2. استخدام التطبيق
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            تطبيق سبّح مخصص للاستخدام الشخصي والديني فقط. يمكنك استخدام التطبيق لأداء الأذكار والتسبيح وتتبع عباداتك اليومية.
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            يحظر استخدام التطبيق لأي أغراض غير قانونية أو غير أخلاقية.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            3. الملكية الفكرية
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            جميع المحتويات والتصاميم والأكواد البرمجية في التطبيق محمية بحقوق الملكية الفكرية. لا يجوز نسخ أو توزيع أو تعديل أي جزء من التطبيق دون إذن كتابي مسبق.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            4. البيانات الشخصية
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            نحن نحترم خصوصيتك. يتم تخزين جميع بياناتك محلياً على جهازك ولا يتم إرسالها إلى أي خوادم خارجية. لمزيد من المعلومات، يرجى الاطلاع على سياسة الخصوصية.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            5. المحتوى الديني
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            نبذل قصارى جهدنا لضمان دقة المحتوى الديني في التطبيق. ومع ذلك، ننصح بالرجوع إلى العلماء والمراجع الموثوقة للتأكد من صحة الأذكار والأدعية.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            6. التحديثات والتغييرات
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            نحتفظ بالحق في تحديث وتعديل هذه الشروط في أي وقت. سيتم إخطارك بأي تغييرات جوهرية من خلال التطبيق.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            7. إخلاء المسؤولية
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            يتم توفير التطبيق &quot;كما هو&quot; دون أي ضمانات من أي نوع. لا نتحمل المسؤولية عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام التطبيق.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            8. الإعلانات
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            قد يحتوي التطبيق على إعلانات من أطراف ثالثة. نحن لسنا مسؤولين عن محتوى هذه الإعلانات أو سياسات الخصوصية الخاصة بالمعلنين.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            9. إنهاء الاستخدام
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            نحتفظ بالحق في إنهاء أو تعليق وصولك إلى التطبيق في أي وقت دون إشعار مسبق إذا انتهكت هذه الشروط.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            10. القانون الحاكم
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            تخضع هذه الشروط وتفسر وفقاً للقوانين المعمول بها في بلد الإقامة.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            11. التواصل معنا
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            إذا كان لديك أي أسئلة حول هذه الشروط، يرجى التواصل معنا عبر قسم الإعدادات في التطبيق.
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
  email: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginTop: 8,
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
