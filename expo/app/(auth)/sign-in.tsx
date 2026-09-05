import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import {
  AuthButton,
  AuthLink,
  AuthShell,
  authStyles,
} from "@/components/AuthShell";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useLanguageStore } from "@/hooks/useLanguageStore";

export default function SignIn() {
  const router = useRouter();
  const { signInWithGoogle, isConfigured, isLoading } = useAuthStore();
  const { t } = useLanguageStore();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, []);

  const handleGoogleSignIn = async () => {
    if (busy || !isConfigured) return;

    setBusy(true);
    setError("");

    try {
      await signInWithGoogle();
    } catch (err: any) {
      const message = err?.message || t("unexpectedError");
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthShell title={t("welcomeBack")} subtitle={t("signInToContinue")}>
          {!isConfigured && (
            <Text style={authStyles.error}>{t("firebaseNotConfigured")}</Text>
          )}

          {!!error && <Text style={authStyles.error}>{error}</Text>}

          <Pressable
            disabled={busy || !isConfigured || isLoading}
            onPress={handleGoogleSignIn}
            accessibilityRole="button"
            accessibilityLabel={t("signInWithGoogle")}
            accessibilityState={{
              disabled: busy || !isConfigured || isLoading,
              busy,
            }}
            style={({ pressed }) => [
              authStyles.googleButton,
              (pressed || busy || !isConfigured || isLoading) &&
                authStyles.googleButtonPressed,
            ]}
          >
            {busy || isLoading ? (
              <ActivityIndicator size="small" color="#1F1F1F" />
            ) : (
              <>
                <Image
                  source={require("@/assets/images/google-logo.png")}
                  style={authStyles.googleLogo}
                  resizeMode="contain"
                />
                <Text style={authStyles.googleButtonText}>
                  {t("signInWithGoogle")}
                </Text>
              </>
            )}
          </Pressable>

          <View style={authStyles.row}>
            <Text style={[authStyles.muted, { color: "#8A9B91" }]}>
              {t("noAccount")}
            </Text>
            <Text
              style={[
                authStyles.link,
                { color: "#D4A853", fontWeight: "700" },
              ]}
              onPress={() => router.push("/(auth)/sign-up")}
            >
              {t("createAccount")}
            </Text>
          </View>
        </AuthShell>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}