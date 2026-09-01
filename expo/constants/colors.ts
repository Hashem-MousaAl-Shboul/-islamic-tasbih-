import type { HexColor } from '@/types';

/** Shared visual tokens used throughout Sabbah. */
export const Colors = {
  primary: '#1B4332',
  primaryDark: '#123126',
  primaryLight: '#DCEBE4',
  secondary: '#D4A853',
  white: '#FFFFFF',
  black: '#101712',
  dark: {
    background: '#1B1F2E',
    surface: '#232838',
    card: '#232838',
    text: '#FFFFFF',
    textSecondary: '#B9C3BD',
    border: '#353B4E',
    tabBar: '#171C29',
  },
  light: {
    background: '#F7F4EE',
    surface: '#FFFFFF',
    text: '#173B2D',
    textSecondary: '#5D6F66',
    border: '#D9E1DC',
    tabBar: '#FFFDF9',
  },
  accent: {
    purple: { start: '#7656A8', end: '#5F438F' },
    blue: { start: '#3777A8', end: '#285D87' },
    green: { start: '#2D8B6F', end: '#1F6D56' },
    gold: { start: '#D4A853', end: '#A87E2F' },
    teal: { start: '#238A86', end: '#176D69' },
    rose: { start: '#B85D78', end: '#96455E' },
  },
  success: '#2D8B6F',
  error: '#C84F4F',
  warning: '#C8902D',
  info: '#3777A8',
} as const;

export const Layout = {
  spacing: { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32 },
  radius: { sm: 10, md: 16, lg: 22, pill: 999 },
  touchTarget: 44,
  contentMaxWidth: 680,
} as const;

export const DefaultDhikrColors: Record<string, HexColor> = {
  'سبحان الله': '#2D8B6F',
  'الحمد لله': '#3777A8',
  'الله أكبر': '#7656A8',
  'لا إله إلا الله': '#238A86',
  'أستغفر الله': '#B27B25',
  default: '#238A86',
};
