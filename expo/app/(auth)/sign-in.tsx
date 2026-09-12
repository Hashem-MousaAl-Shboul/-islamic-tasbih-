import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
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

export default function SignIn() {
  const router = useRouter();
  const { signInWithGoogle, isLoading } = useAuthStore();
  const { t } = useLanguageStore();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // قيمة الحركة الرئيسية
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setError("");

    // تأثير النبض الضوئي لخيار تسجيل الدخول
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 1200,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [scaleAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const handleGoogleSignIn = async () => {
    if (busy || isLoading) return;
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
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthShell title={t("welcomeBack")} subtitle={t("signInToContinue")}>
          {!!error && <Text style={authStyles.error}>{error}</Text>}

          <Animated.View
            style={{
              width: "100%",
              transform: [{ scale: scaleAnim }],
            }}
          >
            <Pressable
              disabled={busy || isLoading}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleGoogleSignIn}
              accessibilityRole="button"
              accessibilityLabel={t("signInWithGoogle")}
              style={({ pressed }) => [
                authStyles.googleButton,
                {
                  marginTop: 24,
                  paddingVertical: 16,
                  boxShadow: "0px 4px 10px rgba(212, 168, 83, 0.3)",
                },
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
                  <Text
                    style={[
                      authStyles.googleButtonText,
                      { fontSize: 16, fontWeight: "700" },
                    ]}
                  >
                    {t("signInWithGoogle")}
                  </Text>
                </>
              )}
            </Pressable>
          </Animated.View>
        </AuthShell>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}