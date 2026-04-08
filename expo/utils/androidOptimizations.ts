import { Platform, TextStyle, ViewStyle } from 'react-native';

export const androidTextFix: TextStyle = Platform.OS === 'android'
  ? { includeFontPadding: false, textAlignVertical: 'center' }
  : {};

export const androidArabicTextFix: TextStyle = Platform.OS === 'android'
  ? { includeFontPadding: false, textAlignVertical: 'center', lineHeight: undefined }
  : {};

export function androidRipple(color?: string, borderless?: boolean, radius?: number) {
  if (Platform.OS !== 'android') return undefined;
  return {
    color: color ?? 'rgba(0, 0, 0, 0.08)',
    borderless: borderless ?? false,
    radius: radius,
  };
}

export function androidElevation(level: number): ViewStyle {
  if (Platform.OS !== 'android') return {};
  return { elevation: level };
}

export const androidCardStyle: ViewStyle = Platform.OS === 'android'
  ? {
      elevation: 4,
      borderWidth: 0.5,
      borderColor: 'rgba(0,0,0,0.04)',
    }
  : {};

export const androidModalStyle: ViewStyle = Platform.OS === 'android'
  ? { elevation: 24 }
  : {};
