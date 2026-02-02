export interface Dhikr {
  id: string;
  arabicText: string;
  transliteration?: string;
  translation?: string;
  count: number;
  targetCount: number;
  color: string;
  isCustom?: boolean;
  category?: string;
}

export interface DhikrCategory {
  id: string;
  name: string;
  nameArabic: string;
  icon: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  vibration: boolean;
  sound: boolean;
  autoAdvance: boolean;
  primaryColor: string;
  colorTheme?: 'blue' | 'green' | 'purple' | 'gold' | 'teal' | 'rose';
  notifications?: boolean;
  dataEncryption?: boolean;
  preventScreenshot?: boolean;
  developerMode?: boolean;
  fastAnimations?: boolean;
  typographyScale?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface UserStats {
  totalDhikr: number;
  dailyDhikr: number;
  weeklyDhikr: number;
  monthlyDhikr: number;
  streak: number;
  lastActive: string;
}