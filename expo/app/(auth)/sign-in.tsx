import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
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
  AuthInput,
  AuthLink,
  AuthShell,
  authStyles,
} from "@/components/AuthShell";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useLanguageStore } from "@/hooks/useLanguageStore";

export default function SignIn() {
  const router = useRouter();
  const { signInWithGoogle, isLoading } = useAuthStore();
  const { t } = useLanguageStore();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setError("");

    // Continuous pulse glow animation for Google button
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 12001,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
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
              transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
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
                  marginTop: 10,
                  paddingVertical: 16,
                  shadowColor: "#1B4332",
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 5,
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
                  <Text style={[authStyles.googleButtonText, { fontSize: 16, fontWeight: "700" }]}>
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