/**
 * Static Quran metadata: 114 surahs, juz/hizb/page start points.
 * Used as fallback when the alquran.cloud API is unavailable,
 * and for juz/page/hizb tab navigation.
 */

export interface SurahMeta {
  number: number;
  name: string;           // Arabic name
  englishName: string;    // Transliteration
  englishTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
}

export interface JuzMeta {
  number: number;
  startSurah: number;
  startAyah: number;
}

export interface HizbMeta {
  number: number;
  startSurah: number;
  startAyah: number;
}

/** All 114 surahs — canonical list */
export const SURAHS: SurahMeta[] = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Faatiha', englishTranslation: 'The Opening', revelationType: 'Meccan', numberOfAyahs: 7 },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqara', englishTranslation: 'The Cow', revelationType: 'Medinan', numberOfAyahs: 286 },
  { number: 3, name: 'آل عمران', englishName: 'Aal-i-Imraan', englishTranslation: 'The Family of Imraan', revelationType: 'Medinan', numberOfAyahs: 200 },
  { number: 4, name: 'النساء', englishName: 'An-Nisaa', englishTranslation: 'The Women', revelationType: 'Medinan', numberOfAyahs: 176 },
  { number: 5, name: 'المائدة', englishName: 'Al-Maaida', englishTranslation: 'The Table', revelationType: 'Medinan', numberOfAyahs: 120 },
  { number: 6, name: 'الأنعام', englishName: 'Al-An\'aam', englishTranslation: 'The Cattle', revelationType: 'Meccan', numberOfAyahs: 165 },
  { number: 7, name: 'الأعراف', englishName: 'Al-A\'raaf', englishTranslation: 'The Heights', revelationType: 'Meccan', numberOfAyahs: 206 },
  { number: 8, name: 'الأنفال', englishName: 'Al-Anfaal', englishTranslation: 'The Spoils of War', revelationType: 'Medinan', numberOfAyahs: 75 },
  { number: 9, name: 'التوبة', englishName: 'At-Tawba', englishTranslation: 'The Repentance', revelationType: 'Medinan', numberOfAyahs: 129 },
  { number: 10, name: 'يونس', englishName: 'Yunus', englishTranslation: 'Jonas', revelationType: 'Meccan', numberOfAyahs: 109 },
  { number: 11, name: 'هود', englishName: 'Hud', englishTranslation: 'Hud', revelationType: 'Meccan', numberOfAyahs: 123 },
  { number: 12, name: 'يوسف', englishName: 'Yusuf', englishTranslation: 'Joseph', revelationType: 'Meccan', numberOfAyahs: 111 },
  { number: 13, name: 'الرعد', englishName: 'Ar-Ra\'d', englishTranslation: 'The Thunder', revelationType: 'Medinan', numberOfAyahs: 43 },
  { number: 14, name: 'إبراهيم', englishName: 'Ibrahim', englishTranslation: 'Abraham', revelationType: 'Meccan', numberOfAyahs: 52 },
  { number: 15, name: 'الحجر', englishName: 'Al-Hijr', englishTranslation: 'The Rock', revelationType: 'Meccan', numberOfAyahs: 99 },
  { number: 16, name: 'النحل', englishName: 'An-Nahl', englishTranslation: 'The Bee', revelationType: 'Meccan', numberOfAyahs: 128 },
  { number: 17, name: 'الإسراء', englishName: 'Al-Israa', englishTranslation: 'The Night Journey', revelationType: 'Meccan', numberOfAyahs: 111 },
  { number: 18, name: 'الكهف', englishName: 'Al-Kahf', englishTranslation: 'The Cave', revelationType: 'Meccan', numberOfAyahs: 110 },
  { number: 19, name: 'مريم', englishName: 'Maryam', englishTranslation: 'Mary', revelationType: 'Meccan', numberOfAyahs: 98 },
  { number: 20, name: 'طه', englishName: 'Taa-Haa', englishTranslation: 'Taa-Haa', revelationType: 'Meccan', numberOfAyahs: 135 },
  { number: 21, name: 'الأنبياء', englishName: 'Al-Anbiyaa', englishTranslation: 'The Prophets', revelationType: 'Meccan', numberOfAyahs: 112 },
  { number: 22, name: 'الحج', englishName: 'Al-Hajj', englishTranslation: 'The Pilgrimage', revelationType: 'Medinan', numberOfAyahs: 78 },
  { number: 23, name: 'المؤمنون', englishName: 'Al-Muminoon', englishTranslation: 'The Believers', revelationType: 'Meccan', numberOfAyahs: 118 },
  { number: 24, name: 'النور', englishName: 'An-Noor', englishTranslation: 'The Light', revelationType: 'Medinan', numberOfAyahs: 64 },
  { number: 25, name: 'الفرقان', englishName: 'Al-Furqaan', englishTranslation: 'The Criterion', revelationType: 'Meccan', numberOfAyahs: 77 },
  { number: 26, name: 'الشعراء', englishName: 'Ash-Shu\'araa', englishTranslation: 'The Poets', revelationType: 'Meccan', numberOfAyahs: 227 },
  { number: 27, name: 'النمل', englishName: 'An-Naml', englishTranslation: 'The Ant', revelationType: 'Meccan', numberOfAyahs: 93 },
  { number: 28, name: 'القصص', englishName: 'Al-Qasas', englishTranslation: 'The Stories', revelationType: 'Meccan', numberOfAyahs: 88 },
  { number: 29, name: 'العنكبوت', englishName: 'Al-Ankaboot', englishTranslation: 'The Spider', revelationType: 'Meccan', numberOfAyahs: 69 },
  { number: 30, name: 'الروم', englishName: 'Ar-Room', englishTranslation: 'The Romans', revelationType: 'Meccan', numberOfAyahs: 60 },
  { number: 31, name: 'لقمان', englishName: 'Luqman', englishTranslation: 'Luqman', revelationType: 'Meccan', numberOfAyahs: 34 },
  { number: 32, name: 'السجدة', englishName: 'As-Sajda', englishTranslation: 'The Prostration', revelationType: 'Meccan', numberOfAyahs: 30 },
  { number: 33, name: 'الأحزاب', englishName: 'Al-Ahzaab', englishTranslation: 'The Clans', revelationType: 'Medinan', numberOfAyahs: 73 },
  { number: 34, name: 'سبأ', englishName: 'Saba', englishTranslation: 'Sheba', revelationType: 'Meccan', numberOfAyahs: 54 },
  { number: 35, name: 'فاطر', englishName: 'Faatir', englishTranslation: 'The Originator', revelationType: 'Meccan', numberOfAyahs: 45 },
  { number: 36, name: 'يس', englishName: 'Yaseen', englishTranslation: 'Yaseen', revelationType: 'Meccan', numberOfAyahs: 83 },
  { number: 37, name: 'الصافات', englishName: 'As-Saaffaat', englishTranslation: 'Those drawn up in Ranks', revelationType: 'Meccan', numberOfAyahs: 182 },
  { number: 38, name: 'ص', englishName: 'Saad', englishTranslation: 'The letter Saad', revelationType: 'Meccan', numberOfAyahs: 88 },
  { number: 39, name: 'الزمر', englishName: 'Az-Zumar', englishTranslation: 'The Groups', revelationType: 'Meccan', numberOfAyahs: 75 },
  { number: 40, name: 'غافر', englishName: 'Ghafir', englishTranslation: 'The Forgiver', revelationType: 'Meccan', numberOfAyahs: 85 },
  { number: 41, name: 'فصلت', englishName: 'Fussilat', englishTranslation: 'Explained in detail', revelationType: 'Meccan', numberOfAyahs: 54 },
  { number: 42, name: 'الشورى', englishName: 'Ash-Shura', englishTranslation: 'Consultation', revelationType: 'Meccan', numberOfAyahs: 53 },
  { number: 43, name: 'الزخرف', englishName: 'Az-Zukhruf', englishTranslation: 'Ornaments of gold', revelationType: 'Meccan', numberOfAyahs: 89 },
  { number: 44, name: 'الدخان', englishName: 'Ad-Dukhaan', englishTranslation: 'The Smoke', revelationType: 'Meccan', numberOfAyahs: 59 },
  { number: 45, name: 'الجاثية', englishName: 'Al-Jaathiya', englishTranslation: 'Crouching', revelationType: 'Meccan', numberOfAyahs: 37 },
  { number: 46, name: 'الأحقاف', englishName: 'Al-Ahqaf', englishTranslation: 'The Dunes', revelationType: 'Meccan', numberOfAyahs: 35 },
  { number: 47, name: 'محمد', englishName: 'Muhammad', englishTranslation: 'Muhammad', revelationType: 'Medinan', numberOfAyahs: 38 },
  { number: 48, name: 'الفتح', englishName: 'Al-Fath', englishTranslation: 'The Victory', revelationType: 'Medinan', numberOfAyahs: 29 },
  { number: 49, name: 'الحجرات', englishName: 'Al-Hujuraat', englishTranslation: 'The Inner Apartments', revelationType: 'Medinan', numberOfAyahs: 18 },
  { number: 50, name: 'ق', englishName: 'Qaaf', englishTranslation: 'The letter Qaaf', revelationType: 'Meccan', numberOfAyahs: 45 },
  { number: 51, name: 'الذاريات', englishName: 'Adh-Dhaariyat', englishTranslation: 'The Winnowing Winds', revelationType: 'Meccan', numberOfAyahs: 60 },
  { number: 52, name: 'الطور', englishName: 'At-Tur', englishTranslation: 'The Mount', revelationType: 'Meccan', numberOfAyahs: 49 },
  { number: 53, name: 'النجم', englishName: 'An-Najm', englishTranslation: 'The Star', revelationType: 'Meccan', numberOfAyahs: 62 },
  { number: 54, name: 'القمر', englishName: 'Al-Qamar', englishTranslation: 'The Moon', revelationType: 'Meccan', numberOfAyahs: 55 },
  { number: 55, name: 'الرحمن', englishName: 'Ar-Rahmaan', englishTranslation: 'The Beneficent', revelationType: 'Medinan', numberOfAyahs: 78 },
  { number: 56, name: 'الواقعة', englishName: 'Al-Waaqia', englishTranslation: 'The Inevitable', revelationType: 'Meccan', numberOfAyahs: 96 },
  { number: 57, name: 'الحديد', englishName: 'Al-Hadid', englishTranslation: 'The Iron', revelationType: 'Medinan', numberOfAyahs: 29 },
  { number: 58, name: 'المجادلة', englishName: 'Al-Mujaadila', englishTranslation: 'The Pleading Woman', revelationType: 'Medinan', numberOfAyahs: 22 },
  { number: 59, name: 'الحشر', englishName: 'Al-Hashr', englishTranslation: 'The Exile', revelationType: 'Medinan', numberOfAyahs: 24 },
  { number: 60, name: 'الممتحنة', englishName: 'Al-Mumtahana', englishTranslation: 'She that is to be examined', revelationType: 'Medinan', numberOfAyahs: 13 },
  { number: 61, name: 'الصف', englishName: 'As-Saff', englishTranslation: 'The Ranks', revelationType: 'Medinan', numberOfAyahs: 14 },
  { number: 62, name: 'الجمعة', englishName: 'Al-Jumu\'a', englishTranslation: 'Friday', revelationType: 'Medinan', numberOfAyahs: 11 },
  { number: 63, name: 'المنافقون', englishName: 'Al-Munaafiqoon', englishTranslation: 'The Hypocrites', revelationType: 'Medinan', numberOfAyahs: 11 },
  { number: 64, name: 'التغابن', englishName: 'At-Taghaabun', englishTranslation: 'Mutual Disillusion', revelationType: 'Medinan', numberOfAyahs: 18 },
  { number: 65, name: 'الطلاق', englishName: 'At-Talaaq', englishTranslation: 'Divorce', revelationType: 'Medinan', numberOfAyahs: 12 },
  { number: 66, name: 'التحريم', englishName: 'At-Tahrim', englishTranslation: 'The Prohibition', revelationType: 'Medinan', numberOfAyahs: 12 },
  { number: 67, name: 'الملك', englishName: 'Al-Mulk', englishTranslation: 'The Sovereignty', revelationType: 'Meccan', numberOfAyahs: 30 },
  { number: 68, name: 'القلم', englishName: 'Al-Qalam', englishTranslation: 'The Pen', revelationType: 'Meccan', numberOfAyahs: 52 },
  { number: 69, name: 'الحاقة', englishName: 'Al-Haaqqa', englishTranslation: 'The Reality', revelationType: 'Meccan', numberOfAyahs: 52 },
  { number: 70, name: 'المعارج', englishName: 'Al-Ma\'aarij', englishTranslation: 'The Ascending Stairways', revelationType: 'Meccan', numberOfAyahs: 44 },
  { number: 71, name: 'نوح', englishName: 'Nooh', englishTranslation: 'Noah', revelationType: 'Meccan', numberOfAyahs: 28 },
  { number: 72, name: 'الجن', englishName: 'Al-Jinn', englishTranslation: 'The Jinn', revelationType: 'Meccan', numberOfAyahs: 28 },
  { number: 73, name: 'المزمل', englishName: 'Al-Muzzammil', englishTranslation: 'The Enshrouded One', revelationType: 'Meccan', numberOfAyahs: 20 },
  { number: 74, name: 'المدثر', englishName: 'Al-Muddaththir', englishTranslation: 'The Cloaked One', revelationType: 'Meccan', numberOfAyahs: 56 },
  { number: 75, name: 'القيامة', englishName: 'Al-Qiyaama', englishTranslation: 'The Resurrection', revelationType: 'Meccan', numberOfAyahs: 40 },
  { number: 76, name: 'الإنسان', englishName: 'Al-Insaan', englishTranslation: 'Man', revelationType: 'Medinan', numberOfAyahs: 31 },
  { number: 77, name: 'المرسلات', englishName: 'Al-Mursalaat', englishTranslation: 'The Emissaries', revelationType: 'Meccan', numberOfAyahs: 50 },
  { number: 78, name: 'النبأ', englishName: 'An-Naba', englishTranslation: 'The Announcement', revelationType: 'Meccan', numberOfAyahs: 40 },
  { number: 79, name: 'النازعات', englishName: 'An-Naazi\'aat', englishTranslation: 'Those who drag forth', revelationType: 'Meccan', numberOfAyahs: 46 },
  { number: 80, name: 'عبس', englishName: 'Abasa', englishTranslation: 'He frowned', revelationType: 'Meccan', numberOfAyahs: 42 },
  { number: 81, name: 'التكوير', englishName: 'At-Takwir', englishTranslation: 'The Overthrowing', revelationType: 'Meccan', numberOfAyahs: 29 },
  { number: 82, name: 'الانفطار', englishName: 'Al-Infitaar', englishTranslation: 'The Cleaving', revelationType: 'Meccan', numberOfAyahs: 19 },
  { number: 83, name: 'المطففين', englishName: 'Al-Mutaffifin', englishTranslation: 'Defrauding', revelationType: 'Meccan', numberOfAyahs: 36 },
  { number: 84, name: 'الانشقاق', englishName: 'Al-Inshiqaaq', englishTranslation: 'The Splitting Open', revelationType: 'Meccan', numberOfAyahs: 25 },
  { number: 85, name: 'البروج', englishName: 'Al-Burooj', englishTranslation: 'The Constellations', revelationType: 'Meccan', numberOfAyahs: 22 },
  { number: 86, name: 'الطارق', englishName: 'At-Taariq', englishTranslation: 'The Morning Star', revelationType: 'Meccan', numberOfAyahs: 17 },
  { number: 87, name: 'الأعلى', englishName: 'Al-A\'laa', englishTranslation: 'The Most High', revelationType: 'Meccan', numberOfAyahs: 19 },
  { number: 88, name: 'الغاشية', englishName: 'Al-Ghaashiya', englishTranslation: 'The Overwhelming', revelationType: 'Meccan', numberOfAyahs: 26 },
  { number: 89, name: 'الفجر', englishName: 'Al-Fajr', englishTranslation: 'The Dawn', revelationType: 'Meccan', numberOfAyahs: 30 },
  { number: 90, name: 'البلد', englishName: 'Al-Balad', englishTranslation: 'The City', revelationType: 'Meccan', numberOfAyahs: 20 },
  { number: 91, name: 'الشمس', englishName: 'Ash-Shams', englishTranslation: 'The Sun', revelationType: 'Meccan', numberOfAyahs: 15 },
  { number: 92, name: 'الليل', englishName: 'Al-Lail', englishTranslation: 'The Night', revelationType: 'Meccan', numberOfAyahs: 21 },
  { number: 93, name: 'الضحى', englishName: 'Ad-Dhuhaa', englishTranslation: 'The Morning Hours', revelationType: 'Meccan', numberOfAyahs: 11 },
  { number: 94, name: 'الشرح', englishName: 'Ash-Sharh', englishTranslation: 'The Relief', revelationType: 'Meccan', numberOfAyahs: 8 },
  { number: 95, name: 'التين', englishName: 'At-Tin', englishTranslation: 'The Fig', revelationType: 'Meccan', numberOfAyahs: 8 },
  { number: 96, name: 'العلق', englishName: 'Al-Alaq', englishTranslation: 'The Clot', revelationType: 'Meccan', numberOfAyahs: 19 },
  { number: 97, name: 'القدر', englishName: 'Al-Qadr', englishTranslation: 'The Power', revelationType: 'Meccan', numberOfAyahs: 5 },
  { number: 98, name: 'البينة', englishName: 'Al-Bayyina', englishTranslation: 'The Clear Proof', revelationType: 'Medinan', numberOfAyahs: 8 },
  { number: 99, name: 'الزلزلة', englishName: 'Az-Zalzala', englishTranslation: 'The Earthquake', revelationType: 'Medinan', numberOfAyahs: 8 },
  { number: 100, name: 'العاديات', englishName: 'Al-Aadiyaat', englishTranslation: 'The Chargers', revelationType: 'Meccan', numberOfAyahs: 11 },
  { number: 101, name: 'القارعة', englishName: 'Al-Qaari\'a', englishTranslation: 'The Calamity', revelationType: 'Meccan', numberOfAyahs: 11 },
  { number: 102, name: 'التكاثر', englishName: 'At-Takaathur', englishTranslation: 'Competition', revelationType: 'Meccan', numberOfAyahs: 8 },
  { number: 103, name: 'العصر', englishName: 'Al-Asr', englishTranslation: 'The Declining Day', revelationType: 'Meccan', numberOfAyahs: 3 },
  { number: 104, name: 'الهمزة', englishName: 'Al-Humaza', englishTranslation: 'The Traducer', revelationType: 'Meccan', numberOfAyahs: 9 },
  { number: 105, name: 'الفيل', englishName: 'Al-Fil', englishTranslation: 'The Elephant', revelationType: 'Meccan', numberOfAyahs: 5 },
  { number: 106, name: 'قريش', englishName: 'Quraish', englishTranslation: 'Quraish', revelationType: 'Meccan', numberOfAyahs: 4 },
  { number: 107, name: 'الماعون', englishName: 'Al-Maa\'un', englishTranslation: 'Almsgiving', revelationType: 'Meccan', numberOfAyahs: 7 },
  { number: 108, name: 'الكوثر', englishName: 'Al-Kawthar', englishTranslation: 'Abundance', revelationType: 'Meccan', numberOfAyahs: 3 },
  { number: 109, name: 'الكافرون', englishName: 'Al-Kaafiroon', englishTranslation: 'The Disbelievers', revelationType: 'Meccan', numberOfAyahs: 6 },
  { number: 110, name: 'النصر', englishName: 'An-Nasr', englishTranslation: 'Divine Support', revelationType: 'Medinan', numberOfAyahs: 3 },
  { number: 111, name: 'المسد', englishName: 'Al-Masad', englishTranslation: 'The Palm Fiber', revelationType: 'Meccan', numberOfAyahs: 5 },
  { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlaas', englishTranslation: 'Sincerity', revelationType: 'Meccan', numberOfAyahs: 4 },
  { number: 113, name: 'الفلق', englishName: 'Al-Falaq', englishTranslation: 'The Daybreak', revelationType: 'Meccan', numberOfAyahs: 5 },
  { number: 114, name: 'الناس', englishName: 'An-Naas', englishTranslation: 'Mankind', revelationType: 'Meccan', numberOfAyahs: 6 },
];

/** Juz start points — surah and ayah where each juz begins */
export const JUZ_STARTS: JuzMeta[] = [
  { number: 1, startSurah: 1, startAyah: 1 },
  { number: 2, startSurah: 2, startAyah: 142 },
  { number: 3, startSurah: 2, startAyah: 253 },
  { number: 4, startSurah: 3, startAyah: 93 },
  { number: 5, startSurah: 4, startAyah: 24 },
  { number: 6, startSurah: 4, startAyah: 148 },
  { number: 7, startSurah: 5, startAyah: 82 },
  { number: 8, startSurah: 6, startAyah: 111 },
  { number: 9, startSurah: 7, startAyah: 88 },
  { number: 10, startSurah: 8, startAyah: 41 },
  { number: 11, startSurah: 9, startAyah: 93 },
  { number: 12, startSurah: 11, startAyah: 6 },
  { number: 13, startSurah: 12, startAyah: 53 },
  { number: 14, startSurah: 15, startAyah: 1 },
  { number: 15, startSurah: 17, startAyah: 1 },
  { number: 16, startSurah: 18, startAyah: 75 },
  { number: 17, startSurah: 21, startAyah: 1 },
  { number: 18, startSurah: 23, startAyah: 1 },
  { number: 19, startSurah: 25, startAyah: 21 },
  { number: 20, startSurah: 27, startAyah: 56 },
  { number: 21, startSurah: 29, startAyah: 46 },
  { number: 22, startSurah: 33, startAyah: 31 },
  { number: 23, startSurah: 36, startAyah: 28 },
  { number: 24, startSurah: 39, startAyah: 32 },
  { number: 25, startSurah: 41, startAyah: 47 },
  { number: 26, startSurah: 46, startAyah: 1 },
  { number: 27, startSurah: 51, startAyah: 31 },
  { number: 28, startSurah: 58, startAyah: 1 },
  { number: 29, startSurah: 67, startAyah: 1 },
  { number: 30, startSurah: 78, startAyah: 1 },
];

/** Hizb start points — each juz has 2 hizbs */
export const HIZB_STARTS: HizbMeta[] = (() => {
  const hizbs: HizbMeta[] = [];
  for (let j = 0; j < 30; j++) {
    const juz = JUZ_STARTS[j];
    hizbs.push({ number: j * 2 + 1, startSurah: juz.startSurah, startAyah: juz.startAyah });
    const nextJuz = JUZ_STARTS[j + 1];
    if (nextJuz) {
      hizbs.push({ number: j * 2 + 2, startSurah: juz.startSurah, startAyah: Math.floor(juz.startAyah + (nextJuz.startSurah === juz.startSurah ? nextJuz.startAyah : 50) / 2) });
    } else {
      hizbs.push({ number: j * 2 + 2, startSurah: juz.startSurah, startAyah: juz.startAyah + 15 });
    }
  }
  return hizbs;
})();

/** Total pages in standard mushaf */
export const TOTAL_PAGES = 604;

/** Get surah meta by number (1-based) */
export function getSurahByNumber(num: number): SurahMeta | undefined {
  return SURAHS.find(s => s.number === num);
}

/** Get the label for a surah type in Arabic */
export function getSurahTypeLabel(type: 'Meccan' | 'Medinan'): string {
  return type === 'Meccan' ? 'مكية' : 'مدنية';
}
