import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { useLanguageStore } from "@/hooks/useLanguageStore";
import { Moon, Star } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

const mosqueImage = require("@/assets/images/mosque-silhouette.png");

interface AuthShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showDecoration?: boolean;
}

export function AuthShell({
  children,
  title,
  subtitle,
  showDecoration = true,
}: AuthShellProps) {
  const theme = useTheme();

  return (
    <LinearGradient
      colors={
        theme.mode === "dark"
          ? [theme.background, theme.surface, "#0D1B2A"]
          : [theme.background, theme.surface, "#E8DCD1"]
      }
      style={styles.root}
    >
      {showDecoration && (
        <View pointerEvents="none" style={styles.mosqueContainer}>
          <Image
            source={mosqueImage}
            style={styles.mosqueImage}
            resizeMode="cover"
          />
        </View>
      )}

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {showDecoration && (
              <View style={styles.decorationContainer}>
                <Star size={16} color={theme.primary} style={styles.star1} />
                <Star size={12} color={theme.primary} style={styles.star2} />
                <Star size={20} color={theme.primary} style={styles.star3} />
              </View>
            )}

            <View style={styles.logoContainer}>
              <Text
                style={[styles.logo, { color: theme.primary }]}
                accessibilityRole="header"
              >
                Sabbah
              </Text>
            </View>

            {title && (
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.mode === "dark" ? "#F8FAFC" : "#2C241B",
                  },
                ]}
              >
                {title}
              </Text>
            )}

            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: theme.mode === "dark" ? "#CBD5E1" : "#756B5F",
                  },
                ]}
              >
                {subtitle}
              </Text>
            )}

            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

interface AuthInputProps extends React.ComponentProps<typeof TextInput> {
  label?: string;
}

export function AuthInput({ label, ...props }: AuthInputProps) {
  const theme = useTheme();
  const { isRTL } = useLanguageStore();

  return (
    <View style={styles.inputGroup}>
      {label && (
        <Text
          style={[
            styles.inputLabel,
            { color: theme.textSecondary, textAlign: isRTL ? "right" : "left" },
          ]}
        >
          {label}
        </Text>
      )}

      <TextInput
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            color: theme.text,
            borderColor: theme.border || theme.primary + "40",
            backgroundColor: theme.surface || "rgba(255,255,255,0.6)",
            textAlign: isRTL ? "right" : "left",
          },
        ]}
        selectionColor={theme.primary}
        {...props}
      />
    </View>
  );
}

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "google";
}

export function AuthButton({
  title,
  onPress,
  disabled = false,
  variant = "primary",
}: AuthButtonProps) {
  const theme = useTheme();

  const getButtonStyle = () => {
    if (variant === "secondary") {
      return {
        backgroundColor: "transparent",
        borderColor: theme.primary,
        borderWidth: 2,
      };
    }
    if (variant === "google") {
      return {
        backgroundColor: "#FFFFFF",
        borderColor: "#DADCE0",
        borderWidth: 1,
      };
    }
    return {
      backgroundColor: theme.primary,
    };
  };

  const getTextStyle = () => {
    if (variant === "secondary") {
      return { color: theme.primary };
    }
    if (variant === "google") {
      return { color: "#1F1F1F" };
    }
    return { color: "#FFFFFF" };
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled, busy: disabled }}
      style={({ pressed }) => [
        styles.button,
        getButtonStyle(),
        (disabled || pressed) && styles.dim,
        variant === "primary" && styles.primaryShadow,
      ]}
    >
      <Text style={[styles.buttonText, getTextStyle()]}>{title}</Text>
    </Pressable>
  );
}

interface AuthLinkProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export function AuthLink({ title, onPress, disabled = false }: AuthLinkProps) {
  const theme = useTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.linkContainer,
        pressed && styles.linkPressed,
        disabled && styles.linkDisabled,
      ]}
    >
      <Text style={[styles.link, { color: theme.primary }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 20,
    gap: 16,
  },
  decorationContainer: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    width: "100%",
    height: 60,
  },
  star1: {
    position: "absolute",
    top: 10,
    right: 40,
  },
  star2: {
    position: "absolute",
    top: 30,
    left: 50,
  },
  star3: {
    position: "absolute",
    top: 0,
    right: 80,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 10,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 12,
    opacity: 0.7,
  },
  inputGroup: {
    width: "100%",
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  input: {
    minHeight: 52,
    fontSize: 15,
    textAlign: "right",
    borderRadius: 26,
    borderWidth: 1.5,
    paddingHorizontal: 20,
  },
  button: {
    minHeight: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  primaryShadow: {
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  dim: {
    opacity: 0.65,
  },
  linkContainer: {
    alignSelf: "center",
    paddingVertical: 6,
  },
  linkPressed: {
    opacity: 0.7,
  },
  linkDisabled: {
    opacity: 0.5,
  },
  link: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  muted: {
    fontSize: 13,
    textAlign: "center",
  },
  error: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    color: "#E05252",
  },
  helper: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
  },
  googleButton: {
    width: "100%",
    minHeight: 52,
    marginTop: 4,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DADCE0",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  googleButtonPressed: {
    opacity: 0.7,
  },
  googleLogo: {
    width: 21,
    height: 21,
  },
  googleButtonText: {
    color: "#1F1F1F",
    fontSize: 14.5,
    fontWeight: "600",
    textAlign: "center",
  },
  mosqueContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: 240,
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 0,
  },
  mosqueImage: {
    width: "100%",
    height: "100%",
    opacity: 0.02,
  },
});

export const authStyles = {
  root: styles.root,
  safe: styles.safe,
  flex: styles.flex,
  content: styles.content,
  logo: styles.logo,
  logoContainer: styles.logoContainer,
  logoIcon: styles.logoIcon,
  title: styles.title,
  subtitle: styles.subtitle,
  inputGroup: styles.inputGroup,
  inputLabel: styles.inputLabel,
  input: styles.input,
  button: styles.button,
  buttonText: styles.buttonText,
  dim: styles.dim,
  linkContainer: styles.linkContainer,
  linkPressed: styles.linkPressed,
  linkDisabled: styles.linkDisabled,
  link: styles.link,
  row: styles.row,
  muted: styles.muted,
  error: styles.error,
  helper: styles.helper,
  googleButton: styles.googleButton,
  googleButtonPressed: styles.googleButtonPressed,
  googleLogo: styles.googleLogo,
  googleButtonText: styles.googleButtonText,
  mosqueContainer: styles.mosqueContainer,
  mosqueImage: styles.mosqueImage,
  decorationContainer: styles.decorationContainer,
  star1: styles.star1,
  star2: styles.star2,
  star3: styles.star3,
};