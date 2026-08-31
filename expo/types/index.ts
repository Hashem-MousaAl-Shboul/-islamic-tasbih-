export type HexColor = `#${string}`;
export type CategoryId = string;

interface BaseDhikr {
  id: string;
  arabicText: string;
  transliteration?: string;
  translation?: string;
  category: CategoryId;
}

export interface Dhikr extends BaseDhikr {
  transliteration: string;
  translation: string;
  count: number;
  targetCount: number;
  color: HexColor;
}

export interface DhikrCategory {
  id: CategoryId;
  name: string;
  nameArabic: string;
  icon: string;
}

export interface AdhkarItem extends BaseDhikr {
  title?: string;
  repeatCount?: number;
}
