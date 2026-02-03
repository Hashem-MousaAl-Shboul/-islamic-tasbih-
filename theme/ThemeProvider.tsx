import { useMemo } from 'react';
import { Platform, ColorValue } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';
import { useTasbihStore } from '@/hooks/useTasbihStore';
import { Colors } from '@/constants/colors';

export type ColorThemeKey = 'blue' | 'green' | 'purple' | 'gold' | 'teal' | 'rose';
export type TypographyScale = 'sm' | 'md' | 'lg' | 'xl';

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
  const settings = tasbihStore?.settings ?? { theme: 'dark', colorTheme: 'gold', fontSize: 'medium' };
  const mode = settings.theme ?? 'dark';
  const primary = computePrimaryFromTheme(settings.colorTheme as ColorThemeKey | undefined, Colors.primary);
  
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
    };
  }, [mode, primary, scale]);

  return tokens;
});
