import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

// ─────────────────── الأنواع ───────────────────
type Dhikr = {
  id: string;
  arabicText: string;
  count?: number;
  targetCount?: number;
  color?: string;
  category: string;
  repeatCount?: number;
};

type DhikrCategory = {
  id: string;
  name: string;
  nameArabic: string;
  icon: string;
};

// أنواع معاملات الشاشة
type AdhkarItemScreenParams = {
  categoryId: string;
  itemId: string;
};

// ─────────────────── الألوان الافتراضية ───────────────────
const DefaultDhikrColors: Record<string, string> = {
  "سبحان الله": "#D4AF67",
  "الحمد لله": "#8A692D",
  "الله أكبر": "#1A473B",
  "لا إله إلا الله": "#B48C3A",
  "أستغفر الله": "#5C7A6F",
};

// ─────────────────── أذكار التسبيح العامة ───────────────────
export const DEFAULT_DHIKR_LIST: Dhikr[] = [
  {
    id: "1",
    arabicText: "سبحان الله",
    count: 0,
    targetCount: 33,
    color: DefaultDhikrColors["سبحان الله"],
    category: "general",
  },
  {
    id: "2",
    arabicText: "الحمد لله",
    count: 0,
    targetCount: 33,
    color: DefaultDhikrColors["الحمد لله"],
    category: "general",
  },
  {
    id: "3",
    arabicText: "الله أكبر",
    count: 0,
    targetCount: 33,
    color: DefaultDhikrColors["الله أكبر"],
    category: "general",
  },
  {
    id: "4",
    arabicText: "لا إله إلا الله",
    count: 0,
    targetCount: 100,
    color: DefaultDhikrColors["لا إله إلا الله"],
    category: "general",
  },
  {
    id: "5",
    arabicText: "أستغفر الله",
    count: 0,
    targetCount: 100,
    color: DefaultDhikrColors["أستغفر الله"],
    category: "general",
  },
];

// ─────────────────── تصنيفات الأقسام كاملة ───────────────────
export const DHIKR_CATEGORIES: DhikrCategory[] = [
  { id: "all", name: "الكل", nameArabic: "الكل", icon: "✨" },
  { id: "morning", name: "الصباح", nameArabic: "أذكار الصباح", icon: "☀️" },
  { id: "evening", name: "المساء", nameArabic: "أذكار المساء", icon: "🌙" },
  { id: "after-prayer", name: "بعد الصلاة", nameArabic: "أذكار بعد الصلاة", icon: "🕒" },
  { id: "duas", name: "الدعوات", nameArabic: "أدعية عامة", icon: "📖" },
  { id: "sleep", name: "النوم", nameArabic: "أذكار النوم", icon: "💤" },
  { id: "wakeup", name: "الاستيقاظ", nameArabic: "أذكار الاستيقاظ", icon: "🌅" },
];

// ─────────────────── قائمة الأذكار والدعوات الكاملة ───────────────────
export const ADHKAR_LIST: Dhikr[] = [
  // أذكار الصباح
  { id: "morning-1", arabicText: "﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾", category: "morning", repeatCount: 1 },
  { id: "morning-2", arabicText: "﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾\n\n﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾\n\n﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ﴾", category: "morning", repeatCount: 3 },
  { id: "morning-3", arabicText: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.", category: "morning", repeatCount: 1 },
  { id: "morning-4", arabicText: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.", category: "morning", repeatCount: 1 },
  { id: "morning-5", arabicText: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا.", category: "morning", repeatCount: 3 },
  { id: "morning-6", arabicText: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَىٰ نَفْسِي طَرْفَةَ عَيْنٍ.", category: "morning", repeatCount: 3 },
  { id: "morning-7", arabicText: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.", category: "morning", repeatCount: 1 },
  { id: "morning-8", arabicText: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَٰهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ.", category: "morning", repeatCount: 4 },
  { id: "morning-9", arabicText: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.", category: "morning", repeatCount: 7 },
  { id: "morning-10", arabicText: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.", category: "morning", repeatCount: 3 },
  { id: "morning-11", arabicText: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.", category: "morning", repeatCount: 3 },
  { id: "morning-12", arabicText: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا.", category: "morning", repeatCount: 1 },
  { id: "morning-13", arabicText: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ.", category: "morning", repeatCount: 100 },
  { id: "morning-14", arabicText: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.", category: "morning", repeatCount: 100 },
  { id: "morning-15", arabicText: "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَىٰ نَفْسِي سُوءًا أَوْ أَجُرَّهُ إِلَىٰ مُسْلِمٍ.", category: "morning", repeatCount: 1 },

  // أذكار المساء
  { id: "evening-1", arabicText: "﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾", category: "evening", repeatCount: 1 },
  { id: "evening-2", arabicText: "﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾\n\n﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾\n\n﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ﴾", category: "evening", repeatCount: 3 },
  { id: "evening-3", arabicText: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.", category: "evening", repeatCount: 1 },
  { id: "evening-4", arabicText: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.", category: "evening", repeatCount: 1 },
  { id: "evening-5", arabicText: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا.", category: "evening", repeatCount: 3 },
  { id: "evening-6", arabicText: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَىٰ نَفْسِي طَرْفَةَ عَيْنٍ.", category: "evening", repeatCount: 3 },
  { id: "evening-7", arabicText: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.", category: "evening", repeatCount: 1 },
  { id: "evening-8", arabicText: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَٰهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ.", category: "evening", repeatCount: 4 },
  { id: "evening-9", arabicText: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.", category: "evening", repeatCount: 7 },
  { id: "evening-10", arabicText: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.", category: "evening", repeatCount: 3 },
  { id: "evening-11", arabicText: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.", category: "evening", repeatCount: 3 },
  { id: "evening-12", arabicText: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، وَاحْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي، وَعَنْ يَمِينِي وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.", category: "evening", repeatCount: 1 },
  { id: "evening-13", arabicText: "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَىٰ نَفْسِي سُوءًا أَوْ أَجُرَّهُ إِلَىٰ مُسْلِمٍ.", category: "evening", repeatCount: 1 },
  { id: "evening-14", arabicText: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ.", category: "evening", repeatCount: 100 },
  { id: "evening-15", arabicText: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.", category: "evening", repeatCount: 100 },

  // أذكار بعد الصلاة
  { id: "after-prayer-1", arabicText: "أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ. اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.", category: "after-prayer", repeatCount: 1 },
  { id: "after-prayer-2", arabicText: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ. اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ.", category: "after-prayer", repeatCount: 1 },
  { id: "after-prayer-3", arabicText: "سُبْحَانَ اللَّهِ (33) ، الْحَمْدُ لِلَّهِ (33) ، اللَّهُ أَكْبَرُ (33) ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ.", category: "after-prayer", repeatCount: 1 },
  { id: "after-prayer-4", arabicText: "﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾", category: "after-prayer", repeatCount: 1 },
  { id: "after-prayer-5", arabicText: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ.", category: "after-prayer", repeatCount: 10 },

  // أدعية عامة
  { id: "dua-1", arabicText: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.", category: "duas", repeatCount: 1 },
  { id: "dua-2", arabicText: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا.", category: "duas", repeatCount: 1 },
  { id: "dua-3", arabicText: "اللَّهُمَّ إِنَّا نَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا.", category: "duas", repeatCount: 1 },
  { id: "dua-4", arabicText: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنَّا.", category: "duas", repeatCount: 3 },
  { id: "dua-5", arabicText: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ.", category: "duas", repeatCount: 1 },
  { id: "dua-6", arabicText: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ.", category: "duas", repeatCount: 1 },

  // أذكار النوم
  { id: "sleep-1", arabicText: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.", category: "sleep", repeatCount: 1 },
  { id: "sleep-2", arabicText: "اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ.", category: "sleep", repeatCount: 1 },
  { id: "sleep-3", arabicText: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.", category: "sleep", repeatCount: 3 },
  { id: "sleep-4", arabicText: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.", category: "sleep", repeatCount: 1 },
  { id: "sleep-5", arabicText: "سُبْحَانَكَ اللَّهُمَّ رَبِّي بِكَ وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَاغْفِرْ لَهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.", category: "sleep", repeatCount: 1 },
  { id: "sleep-6", arabicText: "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْأَرْضِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَىٰ، وَمُنْزِلَ التَّوْرَاةِ وَالْإِنْجِيلِ وَالْفُرْقَانِ، أَعُوذُ بِكَ مِنْ شَرِّ كُلِّ شَيْءٍ أَنْتَ آخِذٌ بِنَاصِيَتِهِ.", category: "sleep", repeatCount: 1 },
  { id: "sleep-7", arabicText: "﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ﴾", category: "sleep", repeatCount: 1 },
  { id: "sleep-8", arabicText: "﴿آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ﴾", category: "sleep", repeatCount: 1 },
  { id: "sleep-9", arabicText: "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ.", category: "sleep", repeatCount: 1 },
  { id: "sleep-10", arabicText: "سُبْحَانَ اللَّهِ (33) ، الْحَمْدُ لِلَّهِ (33) ، اللَّهُ أَكْبَرُ (34).", category: "sleep", repeatCount: 1 },

  // أذكار الاستيقاظ
  { id: "wakeup-1", arabicText: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ.", category: "wakeup", repeatCount: 1 },
  { id: "wakeup-2", arabicText: "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ.", category: "wakeup", repeatCount: 1 },
  { id: "wakeup-3", arabicText: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ. سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَٰهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ. رَبِّ اغْفِرْ لِي.", category: "wakeup", repeatCount: 1 },
  { id: "wakeup-4", arabicText: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَٰهَ إِلَّا أَنْتَ.", category: "wakeup", repeatCount: 1 },
  { id: "wakeup-5", arabicText: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.", category: "wakeup", repeatCount: 1 },
  { id: "wakeup-6", arabicText: "أَصْبَحْنَا عَلَىٰ فِطْرَةِ الْإِسْلَامِ، وَعَلَىٰ كَلِمَةِ الْإِخْلَاصِ، وَعَلَىٰ دِينِ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَعَلَىٰ مِلَّةِ أَبِينَا إِبْرَاهِيمَ، حَنِيفًا مُسْلِمًا، وَمَا كَانَ مِنَ الْمُشْرِكِينَ.", category: "wakeup", repeatCount: 1 },
];

// ─────────────────── شاشة عرض الذكر الآمنة ───────────────────
const AdhkarItemScreen = ({ route }: { route: { params: AdhkarItemScreenParams } }) => {
  // استخراج المعاملات والتحقق منها
  const { categoryId, itemId } = route.params;
  
  // التحقق من صحة القيم
  if (!categoryId || !itemId) {
    return (
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={[styles.arabicText, { textAlign: "center" }]}>
            بيانات غير صالحة
          </Text>
        </View>
      </View>
    );
  }

  const currentCategory = DHIKR_CATEGORIES.find(c => c.id === categoryId);
  const currentItem = ADHKAR_LIST.find(i => i.id === itemId);

  // التحقق من وجود القسم والعنصر
  if (!currentCategory || !currentItem) {
    return (
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={[styles.arabicText, { textAlign: "center" }]}>
            هذا الذكر غير متوفر حالياً
          </Text>
        </View>
      </View>
    );
  }

  const categoryLabel = currentCategory.nameArabic;
  const icon = currentCategory.icon;
  const displayCount = currentItem.repeatCount ?? 1;

  // استخراج عنوان مناسب من النص
  const getDisplayTitle = () => {
    const text = currentItem.arabicText;
    if (text.includes("آيَةُ الْكُرْسِيِّ")) return "آيَةُ الْكُرْسِيِّ";
    if (text.startsWith("﴿قُلْ هُوَ")) return "المعوذات وسورة الإخلاص";
    if (categoryId === "after-prayer") return "أذكار ما بعد الصلاة";
    if (categoryId === "duas") return "دعاء";
    if (categoryId === "morning") return "ذكر من أذكار الصباح";
    if (categoryId === "evening") return "ذكر من أذكار المساء";
    if (categoryId === "sleep") return "ذكر من أذكار النوم";
    if (categoryId === "wakeup") return "ذكر من أذكار الاستيقاظ";
    return "ذكر";
  };
  const itemTitle = getDisplayTitle();

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        {/* شريط العنوان العلوي */}
        <View style={styles.headerBar}>
          <View style={styles.categoryTag}>
            <Text style={styles.tagIcon}>{icon}</Text>
            <Text style={styles.tagText}>{categoryLabel}</Text>
          </View>
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.iconBtn} accessibilityLabel="إضافة للمفضلة">
              <Text style={styles.btnText}>🤍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} accessibilityLabel="مشاركة">
              <Text style={styles.btnText}>🔗</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} accessibilityLabel="خيارات إضافية">
              <Text style={styles.btnText}>⋮</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* العنوان الرئيسي الديناميكي */}
        <View style={styles.titleWrap}>
          <Text style={styles.decor}>✿</Text>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {itemTitle}
          </Text>
          <Text style={styles.decor}>✿</Text>
        </View>
        <View style={styles.divider} />

        {/* النص العربي */}
        <Text style={styles.arabicText}>
          {currentItem.arabicText}
        </Text>

        {/* شريط التكرار السفلي */}
        <View style={styles.footerBar}>
          <TouchableOpacity style={styles.circleBtn} accessibilityLabel="تكرار">
            <Text style={styles.btnText}>🔁</Text>
          </TouchableOpacity>
          <View style={styles.countBadge}>
            <Text style={styles.countNum}>{displayCount}</Text>
          </View>
          <TouchableOpacity style={styles.circleBtn} accessibilityLabel="الرجوع">
            <Text style={styles.btnText}>↩</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ─────────────────── الأنماط الموحدة ───────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF9F0",
    padding: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFBF5",
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "#E8D8B8",
    padding: 20,
    shadowColor: "#997A3F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7E8",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  tagIcon: { fontSize: 18 },
  tagText: { fontSize: 16, fontWeight: "600", color: "#B48C3A" },
  actionBtns: { flexDirection: "row", gap: 12 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF7E8",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { fontSize: 18, color: "#8A692D" },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 12,
  },
  decor: { fontSize: 18, color: "#D4AF67" },
  itemTitle: { fontSize: 24, fontWeight: "700", color: "#8A692D" },
  divider: {
    height: 2,
    backgroundColor: "#E8D8B8",
    marginBottom: 24,
  },
  arabicText: {
    fontSize: 22,
    lineHeight: 42,
    textAlign: "right",
    writingDirection: "rtl",
    color: "#1A473B",
  },
  footerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: "auto",
    padding
