export interface Dhikr {
  id: string;
  arabicText: string;
  transliteration: string;
  translation: string;
  count: number;
  targetCount: number;
  color: string;
  category: string;
}

export interface DhikrCategory {
  id: string;
  name: string;
  nameArabic: string;
  icon: string;
}
