import { Platform, ViewStyle, TextStyle } from 'react-native';

/**
 * Platform-aware shadow utility.
 * On web: uses `boxShadow` (modern CSS, avoids deprecated `shadow*` prop warnings).
 * On native (iOS/Android): uses traditional `shadowColor/shadowOffset/shadowOpacity/shadowRadius`
 * plus `elevation` on Android — still the correct approach for native.
 *
 * Usage:
 *   const cardShadow = createShadow({ color: '#000', offsetY: 4, opacity: 0.15, blur: 12, elevation: 8 });
 *   <View style={[styles.card, cardShadow]} />
 */
export interface ShadowConfig {
  color?: string;
  offsetX?: number;
  offsetY?: number;
  opacity?: number;
  blur?: number;
  elevation?: number;
}

export function createShadow(config: ShadowConfig): ViewStyle {
  const {
    color = '#000',
    offsetX = 0,
    offsetY = 2,
    opacity = 0.1,
    blur = 6,
    elevation = 4,
  } = config;

  if (Platform.OS === 'web') {
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blur}px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    } as ViewStyle;
  }

  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blur,
    ...(Platform.OS === 'android' ? { elevation } : {}),
  };
}

/**
 * Platform-aware text shadow utility.
 * On web: uses `textShadow` (modern CSS, avoids deprecated `textShadow*` prop warnings).
 * On native: uses traditional `textShadowColor/textShadowOffset/textShadowRadius`.
 */
export interface TextShadowConfig {
  color?: string;
  offsetX?: number;
  offsetY?: number;
  blur?: number;
}

export function createTextShadow(config: TextShadowConfig): TextStyle {
  const {
    color = 'rgba(0,0,0,0.3)',
    offsetX = 0,
    offsetY = 1,
    blur = 2,
  } = config;

  if (Platform.OS === 'web') {
    return {
      textShadow: `${offsetX}px ${offsetY}px ${blur}px ${color}`,
    } as TextStyle;
  }

  return {
    textShadowColor: color,
    textShadowOffset: { width: offsetX, height: offsetY },
    textShadowRadius: blur,
  };
}

/**
 * Platform-aware pointerEvents style.
 * Use instead of the deprecated `pointerEvents` prop on View/Text.
 *
 * Usage:
 *   <View style={[styles.container, pointerEventsNone]} />
 */
export const pointerEventsNone: ViewStyle = { pointerEvents: 'none' as any };
export const pointerEventsAuto: ViewStyle = { pointerEvents: 'auto' as any };
export const pointerEventsBoxNone: ViewStyle = { pointerEvents: 'box-none' as any };
