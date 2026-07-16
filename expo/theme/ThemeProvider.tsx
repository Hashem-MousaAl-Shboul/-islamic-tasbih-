import { useMemo } from 'react';
import { Platform, ColorValue } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { useTasbihStore } from '@/hooks/useTasbihStore';
import { Colors } from '@/constants/colors';
import type { BackgroundThemeKey } from '@/hooks/useTasbihStore';

export type ColorThemeKey = 'blue' | 'green' | 'purple' | 'gold' | 'teal' | 'rose';
export type TypographyScale = 'sm' | 'md' | 'lg' | 'xl';

export interface BackgroundThemeInfo {
  key: BackgroundThemeKey;
  customImage: string | null;
  type: 'solid' | 'gradient' | 'image';
  colors: readonly [string, string] | null;
  overlay: string;
  contentTint: 'light' | 'dark';
}

export interface ThemeTokens {
  mode: 'light' | 'dark';
  primary: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  tabBar: string;
  shadows: {
    cardShadow: ColorValue;
  };
  typography: {
    scale: TypographyScale;
    h1: number;
    h2: number;
    body: number;
    small: number;
  };
  backgroundTheme: BackgroundThemeInfo;
}

function computePrimaryFromTheme(colorTheme?: ColorThemeKey, fallback?: string) {
  switch (colorTheme) {
    case 'blue':
      return Colors.accent.blue.start;
    case 'green':
      return Colors.accent.green.start;
    case 'purple':
      return Colors.accent.purple.start;
    case 'gold':
      return Colors.accent.gold.start;
    case 'teal':
      return Colors.accent.teal.start;
    case 'rose':
      return Colors.accent.rose.start;
    default:
      return fallback ?? Colors.primary;
  }
}

const BACKGROUND_THEMES: Record<BackgroundThemeKey, { type: 'solid' | 'gradient'; colors: [string, string]; overlay: string; contentTint: 'light' | 'dark' }> = {
  default: { type: 'solid', colors: ['#F7F4EE', '#F7F4EE'], overlay: 'rgba(255,255,255,0)', contentTint: 'dark' },
  gold: { type: 'gradient', colors: ['#FFF9E6', '#F5E6C8'], overlay: 'rgba(255,255,255,0.15)', contentTint: 'dark' },
  blue: { type: 'gradient', colors: ['#EEF5FF', '#D6E8FA'], overlay: 'rgba(255,255,255,0.15)', contentTint: 'dark' },
  green: { type: 'gradient', colors: ['#E8F6F0', '#D0E9DD'], overlay: 'rgba(255,255,255,0.15)', contentTint: 'dark' },
  purple: { type: 'gradient', colors: ['#F5F0FF', '#E8DDFB'], overlay: 'rgba(255,255,255,0.15)', contentTint: 'dark' },
  teal: { type: 'gradient', colors: ['#E6FFFB', '#CFF5EF'], overlay: 'rgba(255,255,255,0.15)', contentTint: 'dark' },
  rose: { type: 'gradient', colors: ['#FFF0F2', '#FADBE2'], overlay: 'rgba(255,255,255,0.15)', contentTint: 'dark' },
  warm: { type: 'gradient', colors: ['#FFF4E6', '#FBE3D0'], overlay: 'rgba(255,255,255,0.15)', contentTint: 'dark' },
  cool: { type: 'gradient', colors: ['#E8F4FF', '#D3E9F7'], overlay: 'rgba(255,255,255,0.15)', contentTint: 'dark' },
  dark: { type: 'gradient', colors: ['#16213E', '#0F172A'], overlay: 'rgba(0,0,0,0.15)', contentTint: 'light' },
  custom: { type: 'solid', colors: ['#F7F4EE', '#F7F4EE'], overlay: 'rgba(0,0,0,0.35)', contentTint: 'dark' },
};

export function computeBackgroundTheme(
  backgroundTheme: BackgroundThemeKey,
  customImage: string | null
): BackgroundThemeInfo {
  const base = BACKGROUND_THEMES[backgroundTheme] ?? BACKGROUND_THEMES.default;
  return {
    key: backgroundTheme,
    customImage: backgroundTheme === 'custom' ? customImage : null,
    type: backgroundTheme === 'custom' ? 'image' : base.type,
    colors: base.colors,
    overlay: base.overlay,
    contentTint: base.contentTint,
  };
}

function computeTypography(scale: TypographyScale): ThemeTokens['typography'] {
  const base = { h1: 28, h2: 20, body: 16, small: 12 };
  const factor = scale === 'sm' ? 0.9 : scale === 'md' ? 1 : scale === 'lg' ? 1.1 : 1.2;
  return {
    scale,
    h1: Math.round(base.h1 * factor),
    h2: Math.round(base.h2 * factor),
    body: Math.round(base.body * factor),
    small: Math.round(base.small * factor),
  };
}

export const [ThemeProvider, useTheme] = createContextHook<ThemeTokens>(() => {
  const tasbihStore = useTasbihStore();
  const settings = tasbihStore?.settings ?? {
    theme: 'dark',
    colorTheme: 'gold',
    backgroundTheme: 'default',
    customBackgroundImage: null,
    fontSize: 'medium',
  };
  const mode = settings.theme ?? 'dark';
  const primary = computePrimaryFromTheme(settings.colorTheme as ColorThemeKey | undefined, Colors.primary);
  const backgroundTheme = computeBackgroundTheme(
    (settings.backgroundTheme as BackgroundThemeKey) ?? 'default',
    settings.customBackgroundImage ?? null
  );

  const fontSize = settings.fontSize || 'medium';
  let scale: TypographyScale = 'md';
  if (fontSize === 'small') scale = 'sm';
  if (fontSize === 'large') scale = 'lg';

  const tokens: ThemeTokens = useMemo(() => {
    const dark = mode === 'dark';
    return {
      mode,
      primary,
      background: dark ? Colors.dark.background : Colors.light.background,
      surface: dark ? Colors.dark.surface : Colors.light.surface,
      card: dark ? Colors.dark.card : Colors.light.surface,
      text: dark ? Colors.dark.text : Colors.light.text,
      textSecondary: dark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      border: dark ? Colors.dark.border : Colors.light.border,
      tabBar: dark ? Colors.dark.tabBar : Colors.light.tabBar,
      shadows: {
        cardShadow: Platform.select<ColorValue>({
          ios: '#000000',
          android: '#000000',
          web: 'rgba(0,0,0,0.1)'
        }) as ColorValue,
      },
      typography: computeTypography(scale),
      backgroundTheme,
    };
  }, [mode, primary, scale, backgroundTheme]);

  return tokens;
});
