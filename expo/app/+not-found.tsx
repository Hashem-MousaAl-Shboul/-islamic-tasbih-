import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const DEEP_GREEN = '#1B4332';
const GOLD = '#D4A853';
const IVORY = '#F7F4EE';
const TEXT_MUTED = '#8A9B91';

export default function NotFoundScreen() {
  console.log('[NotFound] Rendering 404 screen');

  return (
    <>
      <Stack.Screen options={{ title: "\u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f" }} />
      <View style={styles.container} testID="not-found-screen">
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>\u0664\u0660\u0664</Text>
        </View>
        <Text style={styles.title}>\u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u063a\u064a\u0631 \u0645\u0648\u062c\u0648\u062f\u0629</Text>
        <Text style={styles.subtitle}>\u0627\u0644\u0635\u0641\u062d\u0629 \u0627\u0644\u062a\u064a \u062a\u0628\u062d\u062b \u0639\u0646\u0647\u0627 \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631\u0629</Text>
        <Link href="/" style={styles.link} testID="not-found-home-link">
          <Text style={styles.linkText}>\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0644\u0631\u0626\u064a\u0633\u064a\u0629</Text>
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
    color: TEXT_MUTED,
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
