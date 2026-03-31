import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const DEEP_GREEN = '#1B4332';
const GOLD = '#D4A853';
const IVORY = '#F7F4EE';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "غير موجود" }} />
      <View style={styles.container} testID="not-found-screen">
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>٤٠٤</Text>
        </View>
        <Text style={styles.title}>هذه الصفحة غير موجودة</Text>
        <Text style={styles.subtitle}>الصفحة التي تبحث عنها غير متوفرة</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>العودة للرئيسية</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: IVORY,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GOLD + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: GOLD,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: DEEP_GREEN,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A9B91',
    textAlign: 'center',
    marginBottom: 24,
  },
  link: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: DEEP_GREEN,
    borderRadius: 16,
  },
  linkText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: '600' as const,
  },
});
