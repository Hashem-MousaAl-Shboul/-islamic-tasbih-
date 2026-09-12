import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
} from "react-native";
import { useRouter } from "expo-router";

import { AuthShell, authStyles } from "@/components/AuthShell";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useLanguageStore } from "@/hooks/useLanguageStore";

export default function SignUp() {
  const router = useRouter();
  const { t } = useLanguageStore();

  const { signInWithGoogle, isLoading } = useAuthStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, []);

  const handleGoogleSignUp = async () => {
    if (busy || isLoading) return;

    setBusy(true);
    setError("");

    try {
      await signInWithGoogle();
    } catch (err: any) {
      const message = err?.message || t("accountCreationError");
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
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthShell
          title={t("createAccount") || t("welcomeBack")}
          subtitle={t("signUpToContinue") || t("signInToContinue")}
        >
          {!!error && <Text style={authStyles.error}>{error}</Text>}

          <Pressable
            disabled={busy || isLoading}
            onPress={handleGoogleSignUp}
            accessibilityRole="button"
            accessibilityLabel={t("signInWithGoogle")}
            style={({ pressed }) => [
              authStyles.googleButton,
              { marginTop: 24, paddingVertical: 16 },
              (pressed || busy || isLoading) && authStyles.googleButtonPressed,
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
                <Text style={[authStyles.googleButtonText, { fontSize: 16 }]}>
                  {t("signInWithGoogle")}
                </Text>
              </>
            )}
          </Pressable>
        </AuthShell>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}