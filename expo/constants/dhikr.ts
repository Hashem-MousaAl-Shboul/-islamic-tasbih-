import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { RouteProp } from "@react-navigation/native";

// ───────── الأنواع ─────────
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

type RootStackParamList = {
  AdhkarItem: { categoryId: string; itemId: string };
};

type AdhkarItemRouteProp = RouteProp<RootStackParamList, "AdhkarItem">;

// ───────── الألوان ─────────
const DefaultDhikrColors: { [key: string]: string } = {
  "سبحان الله": "#D4AF67",
  "الحمد لله": "#8A692D",
  "الله أكبر": "#1A473B",
  "لا إله إلا الله": "#B48C3A",
  "أستغفر الله": "#5C7A6F",
};

// ───────── بيانات التسبيح ─────────
export const DEFAULT_DHIKR_LIST: Dhikr[] = [
  { id: "1", arabicText: "سبحان الله", count: 0, targetCount: 33, color: DefaultDhikrColors["سبحان الله"], category: "general" },
  { id: "2", arabicText: "الحمد لله", count: 0, targetCount: 33, color: DefaultDhikrColors["الحمد لله"], category: "general" },
  { id: "3", arabicText: "الله أكبر", count: 0, targetCount: 33, color: DefaultDhikrColors["الله أكبر"], category: "general" },
  { id: "4", arabicText: "لا إله إلا الله", count: 0, targetCount: 100, color: DefaultDhikrColors["لا إله إلا الله"], category: "general" },
  { id: "5", arabicText: "أستغفر الله", count: 0, targetCount: 100, color: DefaultDhikrColors["أستغفر الله"], category: "general" },
];

// ───────── التصنيفات ─────────
export const DHIKR_CATEGORIES: DhikrCategory[] = [
  { id: "all", name: "الكل", nameArabic: "الكل", icon: "✨" },
  { id: "morning", name: "الصباح", nameArabic: "أذكار الصباح", icon: "☀️" },
  { id: "evening", name: "المساء", nameArabic: "أذكار المساء", icon: "🌙" },
  { id: "after-prayer", name: "بعد الصلاة", nameArabic: "أذكار بعد الصلاة", icon: "🕒" },
  { id: "duas", name: "الدعوات", nameArabic: "أدعية عامة", icon: "📖" },
  { id: "sleep", name: "النوم", nameArabic: "أذكار النوم", icon: "💤" },
  { id: "wakeup", name: "الاستيقاظ", nameArabic: "أذكار الاستيقاظ", icon: "🌅" },
];

// ───────── قائمة الأذكار ─────────
export const ADHKAR_LIST: Dhikr[] = [
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
];

// ───────── الشاشة الرئيسية ─────────
const AdhkarItemScreen = ({ route }: { route: AdhkarItemRouteProp }) => {
  const { categoryId, itemId } = route.params;

  if (!categoryId || !itemId) {
    return (
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={[styles.arabicText, { textAlign: "center" }]}>بيانات غير صالحة</Text>
        </View>
      </View>
    );
  }

  const currentCategory = DHIKR_CATEGORIES.find(c => c.id === categoryId);
  const currentItem = ADHKAR_LIST.find(i => i.id === itemId);

  if (!currentCategory || !currentItem) {
    return (
      <View style={styles.screen}>
        <View style={styles.card}>
          <Text style={[styles.arabicText, { textAlign: "center" }]}>هذا الذكر غير متوفر حالياً</Text>
        </View>
      </View>
    );
  }

  const categoryLabel = currentCategory.nameArabic;
  const icon = currentCategory.icon;
  const displayCount = currentItem.repeatCount || 1;

  const getDisplayTitle = () => {
    const text = currentItem.arabicText;
    if (text.indexOf("آيَةُ الْكُرْسِيِّ") !== -1) return "آيَةُ الْكُرْسِيِّ";
    if (text.substring(0, 12) === "﴿قُلْ هُوَ") return "المعوذات وسورة الإخلاص";
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
        <View style={styles.headerBar}>
          <View style={styles.categoryTag}>
            <Text style={styles.tagIcon}>{icon}</Text>
            <Text style={styles.tagText}>  {categoryLabel}</Text>
          </View>
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.iconBtn} accessibilityLabel="إضافة للمفضلة">
              <Text style={styles.btnText}>🤍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { marginHorizontal: 10 }]} accessibilityLabel="مشاركة">
              <Text style={styles.btnText}>🔗</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} accessibilityLabel="خيارات إضافية">
              <Text style={styles.btnText}>⋮</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.decor}>✿</Text>
          <Text style={styles.itemTitle} numberOfLines={1}>{itemTitle}</Text>
          <Text style={styles.decor}>✿</Text>
        </View>
        <View style={styles.divider} />

        <Text style={styles.arabicText}>{currentItem.arabicText}</Text>

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

// ───────── الأنماط النهائية ─────────
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
    elevation: 5,
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
  },
  tagIcon: { fontSize: 18 },
  tagText: { fontSize: 16, fontWeight: "600", color: "#B48C3A" },
  actionBtns: { flexDirection: "row" },
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
    paddingVertical: 16,
  },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF7E8",
    alignItems: "center",
    justifyContent: "center",
  },
  countBadge: {
    minWidth: 80,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#F3E7CC",
    alignItems: "center",
  },
  countNum: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8A692D",
  },
});

export default AdhkarItemScreen;
