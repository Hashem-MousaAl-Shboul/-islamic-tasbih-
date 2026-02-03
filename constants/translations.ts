import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

// Define translation interface
export interface TranslationKeys {
  // App Info
  appName: string;
  appDescription: string;
  
  // Navigation
  adhkar: string;
  tasbih: string;
  settings: string;
  
  // Adhkar Screen
  morningAdhkar: string;
  eveningAdhkar: string;
  afterPrayerAdhkar: string;
  sleepAdhkar: string;
  wakeupAdhkar: string;
  
  // Settings Screen
  language: string;
  vibration: string;
  notifications: string;
  theme: string;
  about: string;
  contactUs: string;
  shareApp: string;
  rateApp: string;
  privacy: string;
  terms: string;
  version: string;
  
  // Settings Sections
  customizeApp: string;
  appearance: string;
  interaction: string;
  
  // Categories
  general: string;
  morning: string;
  evening: string;
  afterPrayer: string;
  
  // Common
  ok: string;
  cancel: string;
  save: string;
  close: string;
  share: string;
  loading: string;
  error: string;
  retry: string;
  
  // Dhikr translations
  subhanAllah: string;
  alhamdulillah: string;
  allahuAkbar: string;
  laIlahaIllallah: string;
  astaghfirullah: string;
  
  // Adhkar Screen Additional
  categories: string;
  allAdhkar: string;
  duas: string;
  quran: string;
  readingModeActive: string;
  tapToRead: string;
  noAdhkarInCategory: string;
  tryAnotherCategory: string;
  loadingAdhkar: string;
  pleaseTryAgain: string;
  
  // Tasbih Screen Additional
  today: string;
  total: string;
  completed: string;
  tapToCount: string;
  streak: string;
  resetCounter: string;
  resetCounterConfirm: string;
  resetAllCounters: string;
  resetAllCountersConfirm: string;
  resetAll: string;
  resetStats: string;
  resetStatsConfirm: string;
  statsResetSuccess: string;
  dailyStats: string;
  add: string;
  addNewTasbih: string;
  arabicText: string;
  arabicTextPlaceholder: string;
  transliteration: string;
  transliterationPlaceholder: string;
  translation: string;
  translationPlaceholder: string;
  targetCount: string;
  color: string;
  pleaseEnterArabicText: string;
  noTasbihAvailable: string;
  
  // Messages
  dhikrCompleted: string;
  shareMessage: string;
  contactMessage: string;
  continue: string;
  
  // Additional Settings Keys
  back: string;
  appSettings: string;
  myProfile: string;
  saved: string;
  newGroup: string;
  contacts: string;
  calls: string;
  savedMessages: string;
  inviteFriends: string;
  telegramFeatures: string;
  darkModeEnabled: string;
  lightModeEnabled: string;
  vibrationOnTap: string;
  soundOnInteraction: string;
  dailyReminders: string;
  colorTheme: string;
  blue: string;
  green: string;
  purple: string;
  gold: string;
  adSettings: string;
  bannerAds: string;
  showBannerAds: string;
  interstitialAds: string;
  showEvery: string;
  clicks: string;
  remaining: string;
  adFrequency: string;
  contactSupport: string;
  rateAppDescription: string;
  shareAppDescription: string;
  contactUsDescription: string;
  viewPrivacyPolicy: string;
  viewTerms: string;
  dataManagement: string;
  exportData: string;
  exportDataDescription: string;
  resetSettings: string;
  resetSettingsDescription: string;
  resetSettingsConfirm: string;
  resetButton: string;
  deleteAllData: string;
  deleteAllDataDescription: string;
  resetData: string;
  resetDataConfirm: string;
  delete: string;
  done: string;
  dataResetSuccess: string;
  exportFailed: string;
  settingsResetSuccess: string;
  sound: string;
  default: string;
  copiedToClipboard: string;
  
  // New Settings Keys
  success: string;
  shareSuccess: string;
  shareError: string;
  cantOpenStore: string;
  noEmailApp: string;
  contactError: string;
  exportSuccess: string;
  exportError: string;
  resetError: string;
  cantOpenLink: string;
  reset: string;
  
  // Color Theme Names
  teal: string;
  rose: string;
  
  // Appearance Settings
  customizeAppearance: string;
  selectColorTheme: string;
  display: string;
  animations: string;
  enableAnimations: string;
  typography: string;
  fontSize: string;
  small: string;
  medium: string;
  large: string;
  performance: string;
  reducedMotion: string;
  reduceAnimationsForBetterPerformance: string;
  darkMode: string;
  enableDarkMode: string;
  
  // WhatsApp Support
  whatsappSupport: string;
  whatsappSupportDescription: string;
  whatsappNotInstalled: string;
  openInBrowser: string;
  cantOpenWhatsApp: string;
  whatsappMessage: string;
  whatsappError: string;
  contactUsWhatsApp: string;
  
  // Rewarded Ad
  watchAdToUnlock: string;
  
  // Audio Settings
  selectReciter: string;
  reciter: string;
  changeVoice: string;
  
  // Favorites
  favorites: string;
  
  // Authentication
  signIn: string;
  signInWithGoogle: string;
  signOut: string;
  signedInAs: string;
  account: string;
  signInToContinue: string;
  signInDescription: string;
  welcomeBack: string;
  notSignedIn: string;
  continueAsGuest: string;
  
  // Ad Translations
  discoverIslamicApps: string;
  learnMore: string;
  premiumIslamicContent: string;
  explore: string;
  islamicEducation: string;
  upgradeToPremium: string;
  upgrade: string;
  joinCommunity: string;
  join: string;
  quranRecitation: string;
  listen: string;
  discover: string;
  prayerTimesApp: string;
  download: string;
  islamicBooks: string;
  browse: string;
  islamicCourses: string;
  enroll: string;
  hajjUmrahGuide: string;
  viewGuide: string;
  
  // Welcome Screen
  welcomeTitle1: string;
  welcomeDesc1: string;
  welcomeTitle2: string;
  welcomeDesc2: string;
  welcomeTitle3: string;
  welcomeDesc3: string;
  getStarted: string;
  skip: string;
  continueWithoutAccount: string;
  
  // Statistics Screen
  statistics: string;
  totalDhikr: string;
  streakDays: string;
  sessions: string;
  dailyProgress: string;
  dailyGoal: string;
  completedDhikr: string;
  quickStats: string;
  days: string;
  totalTarget: string;
  favoritedhikr: string;
  completedTimes: string;
  times: string;
  dhikrDetails: string;
}

// Arabic translations
const ar: TranslationKeys = {
  // App Info
  appName: 'سبّح: تطبيق التسبيح الإسلامي',
  appDescription: 'تطبيق التسبيح والأذكار الإسلامية الرقمي',
  
  // Navigation
  adhkar: 'أذكار',
  tasbih: 'التسبيح',
  settings: 'الإعدادات',
  statistics: 'الإحصائيات',
  
  // Adhkar Screen
  morningAdhkar: 'أذكار الصباح',
  eveningAdhkar: 'أذكار المساء',
  afterPrayerAdhkar: 'أذكار بعد الصلاة',
  sleepAdhkar: 'أذكار النوم',
  wakeupAdhkar: 'أذكار الاستيقاظ',
  
  // Settings Screen
  language: 'اللغة',
  vibration: 'الاهتزاز',
  notifications: 'الإشعارات',
  theme: 'المظهر',
  about: 'حول التطبيق',
  contactUs: 'تواصل معنا',
  shareApp: 'مشاركة التطبيق',
  rateApp: 'تقييم التطبيق',
  privacy: 'سياسة الخصوصية',
  terms: 'شروط الاستخدام',
  version: 'الإصدار',
  // Settings Sections
  customizeApp: 'خصص تطبيقك',
  appearance: 'المظهر',
  interaction: 'التفاعل',
  
  // Categories
  general: 'عام',
  morning: 'الصباح',
  evening: 'المساء',
  afterPrayer: 'بعد الصلاة',
  
  // Common
  ok: 'موافق',
  cancel: 'إلغاء',
  save: 'حفظ',
  close: 'إغلاق',
  share: 'مشاركة',
  loading: 'جاري التحميل...',
  error: 'خطأ',
  retry: 'إعادة المحاولة',
  
  // Dhikr translations
  subhanAllah: 'سبحان الله',
  alhamdulillah: 'الحمد لله',
  allahuAkbar: 'الله أكبر',
  laIlahaIllallah: 'لا إله إلا الله',
  astaghfirullah: 'أستغفر الله',
  
  // Adhkar Screen Additional
  categories: 'التصنيفات',
  allAdhkar: 'الكل',
  duas: 'أدعية',
  quran: 'القرآن',
  readingModeActive: 'وضع القراءة مفعل',
  tapToRead: 'اضغط للقراءة والتسبيح',
  noAdhkarInCategory: 'لا توجد أذكار في هذا القسم',
  tryAnotherCategory: 'جرب تصنيفاً آخر',
  loadingAdhkar: 'جاري تحميل الأذكار...',
  pleaseTryAgain: 'يرجى إعادة فتح الصفحة',
  
  // Tasbih Screen Additional
  today: 'اليوم',
  total: 'الإجمالي',
  completed: 'مكتمل',
  tapToCount: 'اضغط للعد',
  streak: 'متتالية',
  resetCounter: 'إعادة تعيين العداد',
  resetCounterConfirm: 'هل تريد إعادة تعيين عداد "{{dhikr}}"؟',
  resetAllCounters: 'إعادة تعيين جميع العدادات',
  resetAllCountersConfirm: 'هل تريد إعادة تعيين جميع العدادات؟ لا يمكن التراجع عن هذا الإجراء.',
  resetAll: 'إعادة تعيين الكل',
  resetStats: 'حذف الإحصائيات',
  resetStatsConfirm: 'هل تريد حذف جميع الإحصائيات؟ لا يمكن التراجع عن هذا الإجراء.',
  statsResetSuccess: 'تم حذف الإحصائيات بنجاح',
  dailyStats: 'إحصائيات العد اليومي',
  add: 'إضافة',
  addNewTasbih: 'إضافة تسبيح جديد',
  arabicText: 'النص العربي',
  arabicTextPlaceholder: 'مثال: سُبْحَانَ اللَّهِ',
  transliteration: 'النطق بالإنجليزية',
  transliterationPlaceholder: 'مثال: Subhan Allah',
  translation: 'الترجمة',
  translationPlaceholder: 'مثال: Glory be to Allah',
  targetCount: 'العدد المطلوب',
  color: 'اللون',
  pleaseEnterArabicText: 'يرجى إدخال النص العربي',
  noTasbihAvailable: 'لا توجد عناصر تسبيح متاحة',
  
  // Messages
  dhikrCompleted: 'تم إكمال التسبيح! بارك الله فيك',
  shareMessage: 'جرب تطبيق سبّح للتسبيح والأذكار الإسلامية',
  contactMessage: 'السلام عليكم، أريد التواصل بخصوص تطبيق سبّح',
  continue: 'متابعة',
  
  // Additional Settings Keys
  back: 'رجوع',
  appSettings: 'إعدادات التطبيق',
  myProfile: 'ملفي الشخصي',
  saved: 'المحفوظة',
  newGroup: 'مجموعة جديدة',
  contacts: 'جهات الاتصال',
  calls: 'المكالمات',
  savedMessages: 'الرسائل المحفوظة',
  inviteFriends: 'دعوة الأصدقاء',
  telegramFeatures: 'ميزات تيليجرام',
  darkModeEnabled: 'الوضع الداكن مفعّل',
  lightModeEnabled: 'الوضع الفاتح مفعّل',
  vibrationOnTap: 'اهتزاز عند الضغط على العداد',
  soundOnInteraction: 'تشغيل الأصوات عند التفاعل',
  dailyReminders: 'تذكيرات يومية للأذكار',
  colorTheme: 'سمة الألوان',
  blue: 'أزرق',
  green: 'أخضر',
  purple: 'بنفسجي',
  gold: 'ذهبي',
  adSettings: 'إعدادات الإعلانات',
  bannerAds: 'إعلانات البانر',
  showBannerAds: 'عرض الإعلانات في أسفل الشاشة',
  interstitialAds: 'الإعلانات البينية',
  showEvery: 'تظهر كل',
  clicks: 'نقرات',
  remaining: 'متبقية',
  adFrequency: 'تكرار الإعلانات البينية',
  contactSupport: 'التواصل والدعم',
  rateAppDescription: 'ساعدنا بتقييمك في المتجر',
  shareAppDescription: 'شارك التطبيق مع الأصدقاء',
  contactUsDescription: 'تواصل عبر واتساب',
  whatsappSupport: 'دعم واتساب',
  whatsappSupportDescription: 'تواصل مباشر عبر واتساب',
  whatsappNotInstalled: 'واتساب غير مثبت',
  openInBrowser: 'فتح في المتصفح',
  cantOpenWhatsApp: 'فشل في فتح واتساب',
  whatsappMessage: 'مرحبا، أريد التواصل معكم',
  whatsappError: 'فشل فتح واتساب',
  contactUsWhatsApp: 'تواصل مباشر عبر واتساب',
  watchAdToUnlock: 'شاهد إعلان لفتح سمات الألوان',
  
  // Audio Settings
  selectReciter: 'اختر القارئ',
  reciter: 'القارئ',
  changeVoice: 'تغيير الصوت',
  viewPrivacyPolicy: 'اطلع على سياسة الخصوصية',
  viewTerms: 'شروط الاستخدام',
  dataManagement: 'إدارة البيانات',
  exportData: 'تصدير البيانات',
  exportDataDescription: 'حفظ نسخة احتياطية من بياناتك',
  resetSettings: 'إعادة تعيين الإعدادات',
  resetSettingsDescription: 'استعادة الإعدادات الافتراضية',
  resetSettingsConfirm: 'هل تريد استعادة الإعدادات الافتراضية؟',
  resetButton: 'إعادة تعيين',
  deleteAllData: 'حذف جميع البيانات',
  deleteAllDataDescription: 'حذف نهائي لجميع البيانات',
  resetData: 'إعادة تعيين البيانات',
  resetDataConfirm: 'هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.',
  delete: 'حذف',
  done: 'تم',
  dataResetSuccess: 'تم حذف جميع البيانات بنجاح',
  exportFailed: 'فشل في تصدير البيانات',
  settingsResetSuccess: 'تم إعادة تعيين الإعدادات',
  sound: 'الصوت',
  default: 'افتراضي',
  copiedToClipboard: 'تم النسخ إلى الحافظة',
  
  // New Settings Keys
  success: 'نجح',
  shareSuccess: 'تم مشاركة التطبيق بنجاح',
  shareError: 'فشل في مشاركة التطبيق',
  cantOpenStore: 'لا يمكن فتح المتجر',
  noEmailApp: 'لا يوجد تطبيق بريد إلكتروني',
  contactError: 'فشل في فتح البريد الإلكتروني',
  exportSuccess: 'تم تصدير البيانات بنجاح',
  exportError: 'فشل في تصدير البيانات',
  resetError: 'فشل في إعادة تعيين البيانات',
  cantOpenLink: 'لا يمكن فتح الرابط',
  reset: 'إعادة تعيين',
  
  // Color Theme Names
  teal: 'أزرق مخضر',
  rose: 'وردي',
  
  // Appearance Settings
  customizeAppearance: 'تخصيص المظهر',
  selectColorTheme: 'اختر سمة الألوان',
  display: 'العرض',
  animations: 'الحركات',
  enableAnimations: 'تفعيل الحركات والانتقالات',
  typography: 'الطباعة',
  fontSize: 'حجم الخط',
  small: 'صغير',
  medium: 'متوسط',
  large: 'كبير',
  performance: 'الأداء',
  reducedMotion: 'تقليل الحركة',
  reduceAnimationsForBetterPerformance: 'تقليل الحركات لأداء أفضل',
  darkMode: 'الوضع الداكن',
  enableDarkMode: 'تفعيل الوضع الداكن',
  
  // Favorites
  favorites: 'المفضلة',
  
  // Authentication
  signIn: 'تسجيل الدخول',
  signInWithGoogle: 'تسجيل الدخول بواسطة Google',
  signOut: 'تسجيل الخروج',
  signedInAs: 'مسجل الدخول بإسم',
  account: 'الحساب',
  signInToContinue: 'قم بتسجيل الدخول للمتابعة',
  signInDescription: 'سجل الدخول لمزامنة بياناتك عبر جميع الأجهزة',
  welcomeBack: 'مرحباً بعودتك',
  notSignedIn: 'غير مسجل الدخول',
  continueAsGuest: 'متابعة كزائر',
  
  // Ad Translations
  discoverIslamicApps: 'اكتشف تطبيقات إسلامية',
  learnMore: 'اعرف المزيد',
  premiumIslamicContent: 'محتوى إسلامي مميز',
  explore: 'استكشف',
  islamicEducation: 'التعليم الإسلامي',
  upgradeToPremium: 'الترقية إلى Premium',
  upgrade: 'ترقية',
  joinCommunity: 'انضم لمجتمع المسلمين العالمي',
  join: 'انضم الآن',
  quranRecitation: 'استمع للقرآن الكريم بأصوات مشاهير القراء',
  listen: 'استمع الآن',
  discover: 'اكتشف',
  prayerTimesApp: 'تطبيق أوقات الصلاة',
  download: 'تحميل',
  islamicBooks: 'كتب إسلامية',
  browse: 'تصفح',
  islamicCourses: 'دورات إسلامية',
  enroll: 'سجل الآن',
  hajjUmrahGuide: 'دليل الحج والعمرة',
  viewGuide: 'عرض الدليل',
  
  // Welcome Screen
  welcomeTitle1: 'Subbah: Islamic Tasbih App',
  welcomeDesc1: 'Count your dhikr and earn rewards with every moment',
  welcomeTitle2: 'Comprehensive Adhkar',
  welcomeDesc2: 'Morning, evening, and after-prayer adhkar made easy',
  welcomeTitle3: 'Begin Your Spiritual Journey',
  welcomeDesc3: 'Start your dhikr journey and share the blessings with loved ones',
  getStarted: 'ابدأ الآن',
  skip: 'تخطي',
  continueWithoutAccount: 'متابعة بدون حساب',
  
  // Statistics Screen
  totalDhikr: 'إجمالي الذكر',
  streakDays: 'أيام متتالية',
  sessions: 'جلسات مكتملة',
  dailyProgress: 'التقدم اليومي',
  dailyGoal: 'الهدف اليومي',
  completedDhikr: 'الأذكار المكتملة',
  quickStats: 'إحصائيات سريعة',
  days: 'أيام',
  totalTarget: 'الهدف الكلي',
  favoritedhikr: 'الذكر المفضل',
  completedTimes: 'مكتمل',
  times: 'مرات',
  dhikrDetails: 'تفاصيل الأذكار',
};

// English translations
const en: TranslationKeys = {
  // App Info
  appName: 'Subbah: Islamic Tasbih App',
  appDescription: 'Digital Islamic Dhikr and Tasbih Application',
  
  // Navigation
  adhkar: 'Adhkar',
  tasbih: 'Tasbih',
  settings: 'Settings',
  statistics: 'Statistics',
  
  // Adhkar Screen
  morningAdhkar: 'Morning Adhkar',
  eveningAdhkar: 'Evening Adhkar',
  afterPrayerAdhkar: 'After Prayer Adhkar',
  sleepAdhkar: 'Sleep Adhkar',
  wakeupAdhkar: 'Wake Up Adhkar',
  
  // Settings Screen
  language: 'Language',
  vibration: 'Vibration',
  notifications: 'Notifications',
  theme: 'Theme',
  about: 'About',
  contactUs: 'Contact Us',
  shareApp: 'Share App',
  rateApp: 'Rate App',
  privacy: 'Privacy Policy',
  terms: 'Terms of Use',
  version: 'Version',
  // Settings Sections
  customizeApp: 'Customize your app',
  appearance: 'Appearance',
  interaction: 'Interaction',
  
  // Categories
  general: 'General',
  morning: 'Morning',
  evening: 'Evening',
  afterPrayer: 'After Prayer',
  
  // Common
  ok: 'OK',
  cancel: 'Cancel',
  save: 'Save',
  close: 'Close',
  share: 'Share',
  loading: 'Loading...',
  error: 'Error',
  retry: 'Retry',
  
  // Dhikr translations
  subhanAllah: 'Glory be to Allah',
  alhamdulillah: 'Praise be to Allah',
  allahuAkbar: 'Allah is the Greatest',
  laIlahaIllallah: 'There is no god but Allah',
  astaghfirullah: 'I seek forgiveness from Allah',
  
  // Adhkar Screen Additional
  categories: 'Categories',
  allAdhkar: 'All',
  duas: 'Duas',
  quran: 'Quran',
  readingModeActive: 'Reading mode active',
  tapToRead: 'Tap to read and count',
  noAdhkarInCategory: 'No adhkar in this category',
  tryAnotherCategory: 'Try another category',
  loadingAdhkar: 'Loading adhkar...',
  pleaseTryAgain: 'Please try again',
  
  // Tasbih Screen Additional
  today: 'Today',
  total: 'Total',
  completed: 'Completed',
  tapToCount: 'Tap to count',
  streak: 'Streak',
  resetCounter: 'Reset Counter',
  resetCounterConfirm: 'Do you want to reset counter "{{dhikr}}"?',
  resetAllCounters: 'Reset All Counters',
  resetAllCountersConfirm: 'Do you want to reset all counters? This action cannot be undone.',
  resetAll: 'Reset All',
  resetStats: 'Delete Statistics',
  resetStatsConfirm: 'Do you want to delete all statistics? This action cannot be undone.',
  statsResetSuccess: 'Statistics deleted successfully',
  dailyStats: 'Daily Counting Statistics',
  add: 'Add',
  addNewTasbih: 'Add New Tasbih',
  arabicText: 'Arabic Text',
  arabicTextPlaceholder: 'Example: سُبْحَانَ اللَّهِ',
  transliteration: 'Transliteration',
  transliterationPlaceholder: 'Example: Subhan Allah',
  translation: 'Translation',
  translationPlaceholder: 'Example: Glory be to Allah',
  targetCount: 'Target Count',
  color: 'Color',
  pleaseEnterArabicText: 'Please enter Arabic text',
  noTasbihAvailable: 'No tasbih items available',
  
  // Messages
  dhikrCompleted: 'Dhikr completed! May Allah bless you',
  shareMessage: 'Try Subbah app for Islamic Dhikr and Tasbih',
  contactMessage: 'Peace be upon you, I want to contact about Subbah app',
  continue: 'Continue',
  
  // Additional Settings Keys
  back: 'Back',
  appSettings: 'App Settings',
  myProfile: 'My Profile',
  saved: 'Saved',
  newGroup: 'New Group',
  contacts: 'Contacts',
  calls: 'Calls',
  savedMessages: 'Saved Messages',
  inviteFriends: 'Invite Friends',
  telegramFeatures: 'Telegram Features',
  darkModeEnabled: 'Dark mode enabled',
  lightModeEnabled: 'Light mode enabled',
  vibrationOnTap: 'Vibration on counter tap',
  soundOnInteraction: 'Play sounds on interaction',
  dailyReminders: 'Daily reminders for dhikr',
  colorTheme: 'Color Theme',
  blue: 'Blue',
  green: 'Green',
  purple: 'Purple',
  gold: 'Gold',
  adSettings: 'Ad Settings',
  bannerAds: 'Banner Ads',
  showBannerAds: 'Show ads at bottom of screen',
  interstitialAds: 'Interstitial Ads',
  showEvery: 'Show every',
  clicks: 'clicks',
  remaining: 'remaining',
  adFrequency: 'Interstitial Ad Frequency',
  contactSupport: 'Contact & Support',
  rateAppDescription: 'Help us with your rating in the store',
  shareAppDescription: 'Share the app with friends',
  contactUsDescription: 'Contact via WhatsApp',
  whatsappSupport: 'WhatsApp Support',
  whatsappSupportDescription: 'Direct contact via WhatsApp',
  whatsappNotInstalled: 'WhatsApp is not installed',
  openInBrowser: 'Open in Browser',
  cantOpenWhatsApp: 'Failed to open WhatsApp',
  whatsappMessage: 'Hello, I want to contact you',
  whatsappError: 'Failed to open WhatsApp',
  contactUsWhatsApp: 'Direct contact via WhatsApp',
  watchAdToUnlock: 'Watch ad to unlock color themes',
  
  // Audio Settings
  selectReciter: 'Select Reciter',
  reciter: 'Reciter',
  changeVoice: 'Change Voice',
  viewPrivacyPolicy: 'View privacy policy',
  viewTerms: 'Terms of use',
  dataManagement: 'Data Management',
  exportData: 'Export Data',
  exportDataDescription: 'Save a backup of your data',
  resetSettings: 'Reset Settings',
  resetSettingsDescription: 'Restore default settings',
  resetSettingsConfirm: 'Do you want to restore default settings?',
  resetButton: 'Reset',
  deleteAllData: 'Delete All Data',
  deleteAllDataDescription: 'Permanently delete all data',
  resetData: 'Reset Data',
  resetDataConfirm: 'Are you sure you want to delete all data? This action cannot be undone.',
  delete: 'Delete',
  done: 'Done',
  dataResetSuccess: 'All data deleted successfully',
  exportFailed: 'Failed to export data',
  settingsResetSuccess: 'Settings reset successfully',
  sound: 'Sound',
  default: 'Default',
  copiedToClipboard: 'Copied to clipboard',
  
  // New Settings Keys
  success: 'Success',
  shareSuccess: 'App shared successfully',
  shareError: 'Failed to share app',
  cantOpenStore: 'Cannot open store',
  noEmailApp: 'No email app available',
  contactError: 'Failed to open email',
  exportSuccess: 'Data exported successfully',
  exportError: 'Failed to export data',
  resetError: 'Failed to reset data',
  cantOpenLink: 'Cannot open link',
  reset: 'Reset',
  
  // Color Theme Names
  teal: 'Teal',
  rose: 'Rose',
  
  // Appearance Settings
  customizeAppearance: 'Customize appearance',
  selectColorTheme: 'Select color theme',
  display: 'Display',
  animations: 'Animations',
  enableAnimations: 'Enable animations and transitions',
  typography: 'Typography',
  fontSize: 'Font Size',
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  performance: 'Performance',
  reducedMotion: 'Reduced Motion',
  reduceAnimationsForBetterPerformance: 'Reduce animations for better performance',
  darkMode: 'Dark Mode',
  enableDarkMode: 'Enable dark mode',
  
  // Favorites
  favorites: 'Favorites',
  
  // Authentication
  signIn: 'Sign In',
  signInWithGoogle: 'Sign In with Google',
  signOut: 'Sign Out',
  signedInAs: 'Signed in as',
  account: 'Account',
  signInToContinue: 'Sign in to continue',
  signInDescription: 'Sign in to sync your data across all devices',
  welcomeBack: 'Welcome back',
  notSignedIn: 'Not signed in',
  continueAsGuest: 'Continue as Guest',
  
  // Ad Translations
  discoverIslamicApps: 'Discover Islamic Apps',
  learnMore: 'Learn More',
  premiumIslamicContent: 'Premium Islamic Content',
  explore: 'Explore',
  islamicEducation: 'Islamic Education',
  upgradeToPremium: 'Upgrade to Premium',
  upgrade: 'Upgrade',
  joinCommunity: 'Join Global Muslim Community',
  join: 'Join Now',
  quranRecitation: 'Listen to Quran by Famous Reciters',
  listen: 'Listen Now',
  discover: 'Discover',
  prayerTimesApp: 'Prayer Times App',
  download: 'Download',
  islamicBooks: 'Islamic Books',
  browse: 'Browse',
  islamicCourses: 'Islamic Courses',
  enroll: 'Enroll Now',
  hajjUmrahGuide: 'Hajj & Umrah Guide',
  viewGuide: 'View Guide',
  
  // Welcome Screen
  welcomeTitle1: 'Subbah: Islamic Tasbih App',
  welcomeDesc1: 'Count your dhikr and adhkar in a peaceful spiritual atmosphere',
  welcomeTitle2: 'Complete Adhkar Collection',
  welcomeDesc2: 'Morning, evening, and after-prayer adhkar made easy',
  welcomeTitle3: 'Begin Your Spiritual Journey',
  welcomeDesc3: 'Start your dhikr journey and share the blessings with loved ones',
  getStarted: 'Get Started',
  skip: 'Skip',
  continueWithoutAccount: 'Continue Without Account',
  
  // Statistics Screen
  totalDhikr: 'Total Dhikr',
  streakDays: 'Streak Days',
  sessions: 'Completed Sessions',
  dailyProgress: 'Daily Progress',
  dailyGoal: 'Daily Goal',
  completedDhikr: 'Completed Dhikr',
  quickStats: 'Quick Stats',
  days: 'days',
  totalTarget: 'Total Target',
  favoritedhikr: 'Favorite Dhikr',
  completedTimes: 'Completed',
  times: 'times',
  dhikrDetails: 'Dhikr Details',
};

// French translations
const fr: TranslationKeys = {
  // App Info
  appName: 'Subbah: App Tasbih Islamique',
  appDescription: 'Application Numérique de Dhikr et Tasbih Islamique',
  
  // Navigation
  adhkar: 'Adhkar',
  tasbih: 'Tasbih',
  settings: 'Paramètres',
  statistics: 'Statistiques',
  
  // Adhkar Screen
  morningAdhkar: 'Adhkar du Matin',
  eveningAdhkar: 'Adhkar du Soir',
  afterPrayerAdhkar: 'Adhkar Après la Prière',
  sleepAdhkar: 'Adhkar du Sommeil',
  wakeupAdhkar: 'Adhkar du Réveil',
  
  // Adhkar Screen Additional
  categories: 'Catégories',
  allAdhkar: 'Tous les Adhkar',
  duas: 'Duas',
  quran: 'Coran',
  readingModeActive: 'Mode lecture actif',
  tapToRead: 'Appuyez pour lire et compter',
  noAdhkarInCategory: 'Aucun adhkar dans cette catégorie',
  tryAnotherCategory: 'Essayez une autre catégorie',
  loadingAdhkar: 'Chargement des adhkar...',
  pleaseTryAgain: 'Veuillez réessayer',
  
  // Tasbih Screen Additional
  today: 'Aujourd\'hui',
  total: 'Total',
  completed: 'Terminé',
  tapToCount: 'Appuyez pour compter',
  streak: 'Série',
  resetCounter: 'Réinitialiser le compteur',
  resetCounterConfirm: 'Voulez-vous réinitialiser le compteur "{{dhikr}}"?',
  resetAllCounters: 'Réinitialiser tous les compteurs',
  resetAllCountersConfirm: 'Voulez-vous réinitialiser tous les compteurs? Cette action ne peut pas être annulée.',
  resetAll: 'Tout réinitialiser',
  resetStats: 'Supprimer les statistiques',
  resetStatsConfirm: 'Voulez-vous supprimer toutes les statistiques? Cette action ne peut pas être annulée.',
  statsResetSuccess: 'Statistiques supprimées avec succès',
  dailyStats: 'Statistiques de comptage quotidiennes',
  add: 'Ajouter',
  addNewTasbih: 'Ajouter un nouveau Tasbih',
  arabicText: 'Texte arabe',
  arabicTextPlaceholder: 'Exemple: سُبْحَانَ اللَّهِ',
  transliteration: 'Translittération',
  transliterationPlaceholder: 'Exemple: Subhan Allah',
  translation: 'Traduction',
  translationPlaceholder: 'Exemple: Gloire à Allah',
  targetCount: 'Nombre cible',
  color: 'Couleur',
  pleaseEnterArabicText: 'Veuillez entrer le texte arabe',
  noTasbihAvailable: 'Aucun élément tasbih disponible',
  
  // Settings Screen
  language: 'Langue',
  vibration: 'Vibration',
  notifications: 'Notifications',
  theme: 'Thème',
  about: 'À propos',
  contactUs: 'Nous contacter',
  shareApp: 'Partager l\'app',
  rateApp: 'Noter l\'app',
  privacy: 'Politique de confidentialité',
  terms: 'Conditions d\'utilisation',
  version: 'Version',
  
  // Settings Sections
  customizeApp: 'Personnalisez votre application',
  appearance: 'Apparence',
  interaction: 'Interaction',
  
  // Categories
  general: 'Général',
  morning: 'Matin',
  evening: 'Soir',
  afterPrayer: 'Après la Prière',
  
  // Common
  ok: 'OK',
  cancel: 'Annuler',
  save: 'Sauvegarder',
  close: 'Fermer',
  share: 'Partager',
  loading: 'Chargement...',
  error: 'Erreur',
  retry: 'Réessayer',
  
  // Dhikr translations
  subhanAllah: 'Gloire à Allah',
  alhamdulillah: 'Louange à Allah',
  allahuAkbar: 'Allah est le Plus Grand',
  laIlahaIllallah: 'Il n\'y a de dieu qu\'Allah',
  astaghfirullah: 'Je demande pardon à Allah',
  
  // Messages
  dhikrCompleted: 'Dhikr terminé! Qu\'Allah vous bénisse',
  shareMessage: 'Essayez l\'app Subbah pour le Dhikr et Tasbih islamique',
  contactMessage: 'Que la paix soit sur vous, je veux contacter à propos de l\'app Subbah',
  continue: 'Continuer',
  
  // Additional Settings Keys
  back: 'Retour',
  appSettings: 'Paramètres de l\'app',
  myProfile: 'Mon Profil',
  saved: 'Enregistré',
  newGroup: 'Nouveau Groupe',
  contacts: 'Contacts',
  calls: 'Appels',
  savedMessages: 'Messages Enregistrés',
  inviteFriends: 'Inviter des Amis',
  telegramFeatures: 'Fonctionnalités Telegram',
  darkModeEnabled: 'Mode sombre activé',
  lightModeEnabled: 'Mode clair activé',
  vibrationOnTap: 'Vibration au toucher du compteur',
  soundOnInteraction: 'Sons lors des interactions',
  dailyReminders: 'Rappels quotidiens pour dhikr',
  colorTheme: 'Thème de couleur',
  blue: 'Bleu',
  green: 'Vert',
  purple: 'Violet',
  gold: 'Or',
  adSettings: 'Paramètres des publicités',
  bannerAds: 'Publicités bannière',
  showBannerAds: 'Afficher les publicités en bas de l\'écran',
  interstitialAds: 'Publicités interstitielles',
  showEvery: 'Afficher toutes les',
  clicks: 'clics',
  remaining: 'restants',
  adFrequency: 'Fréquence des publicités interstitielles',
  contactSupport: 'Contact et support',
  rateAppDescription: 'Aidez-nous avec votre évaluation dans le store',
  shareAppDescription: 'Partagez l\'app avec des amis',
  contactUsDescription: 'Contact via WhatsApp',
  whatsappSupport: 'Support WhatsApp',
  whatsappSupportDescription: 'Contact direct via WhatsApp',
  whatsappNotInstalled: 'WhatsApp n\'est pas installé',
  openInBrowser: 'Ouvrir dans le navigateur',
  cantOpenWhatsApp: 'Impossible d\'ouvrir WhatsApp',
  whatsappMessage: 'Bonjour, je veux vous contacter',
  whatsappError: 'Échec de l\'ouverture de WhatsApp',
  contactUsWhatsApp: 'Contact direct via WhatsApp',
  watchAdToUnlock: 'Regarder une pub pour débloquer les thèmes',
  
  // Audio Settings
  selectReciter: 'Sélectionner le récitateur',
  reciter: 'Récitateur',
  changeVoice: 'Changer la voix',
  viewPrivacyPolicy: 'Voir la politique de confidentialité',
  viewTerms: 'Conditions d\'utilisation',
  dataManagement: 'Gestion des données',
  exportData: 'Exporter les données',
  exportDataDescription: 'Sauvegarder une copie de vos données',
  resetSettings: 'Réinitialiser les paramètres',
  resetSettingsDescription: 'Restaurer les paramètres par défaut',
  resetSettingsConfirm: 'Voulez-vous restaurer les paramètres par défaut?',
  resetButton: 'Réinitialiser',
  deleteAllData: 'Supprimer toutes les données',
  deleteAllDataDescription: 'Supprimer définitivement toutes les données',
  resetData: 'Réinitialiser les données',
  resetDataConfirm: 'Êtes-vous sûr de vouloir supprimer toutes les données? Cette action ne peut pas être annulée.',
  delete: 'Supprimer',
  done: 'Terminé',
  dataResetSuccess: 'Toutes les données supprimées avec succès',
  exportFailed: 'Échec de l\'exportation des données',
  settingsResetSuccess: 'Paramètres réinitialisés avec succès',
  sound: 'Son',
  default: 'Par défaut',
  copiedToClipboard: 'Copié dans le presse-papiers',
  
  // New Settings Keys
  success: 'Succès',
  shareSuccess: 'Application partagée avec succès',
  shareError: 'Échec du partage de l\'application',
  cantOpenStore: 'Impossible d\'ouvrir le magasin',
  noEmailApp: 'Aucune application email disponible',
  contactError: 'Échec de l\'ouverture de l\'email',
  exportSuccess: 'Données exportées avec succès',
  exportError: 'Échec de l\'exportation des données',
  resetError: 'Échec de la réinitialisation des données',
  cantOpenLink: 'Impossible d\'ouvrir le lien',
  reset: 'Réinitialiser',
  
  // Color Theme Names
  teal: 'Sarcelle',
  rose: 'Rose',
  
  // Appearance Settings
  customizeAppearance: 'Personnaliser l\'apparence',
  selectColorTheme: 'Sélectionner le thème de couleur',
  display: 'Affichage',
  animations: 'Animations',
  enableAnimations: 'Activer les animations et transitions',
  typography: 'Typographie',
  fontSize: 'Taille de police',
  small: 'Petit',
  medium: 'Moyen',
  large: 'Grand',
  performance: 'Performance',
  reducedMotion: 'Mouvement réduit',
  reduceAnimationsForBetterPerformance: 'Réduire les animations pour de meilleures performances',
  darkMode: 'Mode sombre',
  enableDarkMode: 'Activer le mode sombre',
  
  // Favorites
  favorites: 'Favoris',
  
  // Authentication
  signIn: 'Se connecter',
  signInWithGoogle: 'Se connecter avec Google',
  signOut: 'Se déconnecter',
  signedInAs: 'Connecté en tant que',
  account: 'Compte',
  signInToContinue: 'Connectez-vous pour continuer',
  signInDescription: 'Connectez-vous pour synchroniser vos données sur tous vos appareils',
  welcomeBack: 'Bon retour',
  notSignedIn: 'Non connecté',
  continueAsGuest: 'Continuer en tant qu\'invité',
  
  // Ad Translations
  discoverIslamicApps: 'Découvrir des applications islamiques',
  learnMore: 'En savoir plus',
  premiumIslamicContent: 'Contenu islamique premium',
  explore: 'Explorer',
  islamicEducation: 'Éducation islamique',
  upgradeToPremium: 'Passer à Premium',
  upgrade: 'Mettre à niveau',
  joinCommunity: 'Rejoindre la communauté musulmane mondiale',
  join: 'Rejoindre',
  quranRecitation: 'Écouter le Coran par des récitateurs célèbres',
  listen: 'Écouter',
  discover: 'Découvrir',
  prayerTimesApp: 'Application des horaires de prière',
  download: 'Télécharger',
  islamicBooks: 'Livres islamiques',
  browse: 'Parcourir',
  islamicCourses: 'Cours islamiques',
  enroll: 'S\'inscrire',
  hajjUmrahGuide: 'Guide Hajj et Omra',
  viewGuide: 'Voir le guide',
  
  // Welcome Screen
  welcomeTitle1: 'Subbah: App Tasbih Islamique',
  welcomeDesc1: 'Comptez vos dhikrs et adhkars dans une atmosphère spirituelle paisible',
  welcomeTitle2: 'Collection Complète d\'Adhkar',
  welcomeDesc2: 'Adhkars du matin, du soir et après la prière rendus faciles',
  welcomeTitle3: 'Commencez Votre Voyage Spirituel',
  welcomeDesc3: 'Commencez votre voyage de dhikr et partagez les bénédictions avec vos proches',
  getStarted: 'Commencer',
  skip: 'Passer',
  continueWithoutAccount: 'Continuer sans compte',
  
  // Statistics Screen
  totalDhikr: 'Total Dhikr',
  streakDays: 'Jours consécutifs',
  sessions: 'Sessions terminées',
  dailyProgress: 'Progrès quotidien',
  dailyGoal: 'Objectif quotidien',
  completedDhikr: 'Dhikr terminés',
  quickStats: 'Stats rapides',
  days: 'jours',
  totalTarget: 'Objectif total',
  favoritedhikr: 'Dhikr favori',
  completedTimes: 'Terminé',
  times: 'fois',
  dhikrDetails: 'Détails du Dhikr',
};

// Spanish translations
const es: TranslationKeys = {
  // App Info
  appName: 'Subbah: App Tasbih Islámico',
  appDescription: 'Aplicación Digital de Dhikr y Tasbih Islámico',
  
  // Navigation
  adhkar: 'Adhkar',
  tasbih: 'Tasbih',
  settings: 'Configuración',
  statistics: 'Estadísticas',
  
  // Adhkar Screen
  morningAdhkar: 'Adhkar de la Mañana',
  eveningAdhkar: 'Adhkar de la Tarde',
  afterPrayerAdhkar: 'Adhkar Después de la Oración',
  sleepAdhkar: 'Adhkar del Sueño',
  wakeupAdhkar: 'Adhkar al Despertar',
  
  // Adhkar Screen Additional
  categories: 'Categorías',
  allAdhkar: 'Todos los Adhkar',
  duas: 'Duas',
  quran: 'Corán',
  readingModeActive: 'Modo lectura activo',
  tapToRead: 'Toca para leer y contar',
  noAdhkarInCategory: 'No hay adhkar en esta categoría',
  tryAnotherCategory: 'Prueba otra categoría',
  loadingAdhkar: 'Cargando adhkar...',
  pleaseTryAgain: 'Por favor, inténtalo de nuevo',
  
  // Tasbih Screen Additional
  today: 'Hoy',
  total: 'Total',
  completed: 'Completado',
  tapToCount: 'Toca para contar',
  streak: 'Racha',
  resetCounter: 'Reiniciar contador',
  resetCounterConfirm: '¿Quieres reiniciar el contador "{{dhikr}}"?',
  resetAllCounters: 'Reiniciar todos los contadores',
  resetAllCountersConfirm: '¿Quieres reiniciar todos los contadores? Esta acción no se puede deshacer.',
  resetAll: 'Reiniciar todo',
  resetStats: 'Eliminar estadísticas',
  resetStatsConfirm: '¿Quieres eliminar todas las estadísticas? Esta acción no se puede deshacer.',
  statsResetSuccess: 'Estadísticas eliminadas exitosamente',
  dailyStats: 'Estadísticas de conteo diarias',
  add: 'Añadir',
  addNewTasbih: 'Añadir nuevo Tasbih',
  arabicText: 'Texto árabe',
  arabicTextPlaceholder: 'Ejemplo: سُبْحَانَ اللَّهِ',
  transliteration: 'Transliteración',
  transliterationPlaceholder: 'Ejemplo: Subhan Allah',
  translation: 'Traducción',
  translationPlaceholder: 'Ejemplo: Gloria a Allah',
  targetCount: 'Número objetivo',
  color: 'Color',
  pleaseEnterArabicText: 'Por favor, introduce el texto árabe',
  noTasbihAvailable: 'No hay elementos tasbih disponibles',
  
  // Settings Screen
  language: 'Idioma',
  vibration: 'Vibración',
  notifications: 'Notificaciones',
  theme: 'Tema',
  about: 'Acerca de',
  contactUs: 'Contáctanos',
  shareApp: 'Compartir App',
  rateApp: 'Calificar App',
  privacy: 'Política de Privacidad',
  terms: 'Términos de Uso',
  version: 'Versión',
  // Settings Sections
  customizeApp: 'Personaliza tu app',
  appearance: 'Apariencia',
  interaction: 'Interacción',
  
  // Categories
  general: 'General',
  morning: 'Mañana',
  evening: 'Tarde',
  afterPrayer: 'Después de la Oración',
  
  // Common
  ok: 'OK',
  cancel: 'Cancelar',
  save: 'Guardar',
  close: 'Cerrar',
  share: 'Compartir',
  loading: 'Cargando...',
  error: 'Error',
  retry: 'Reintentar',
  
  // Dhikr translations
  subhanAllah: 'Gloria a Allah',
  alhamdulillah: 'Alabanza a Allah',
  allahuAkbar: 'Allah es el Más Grande',
  laIlahaIllallah: 'No hay dios sino Allah',
  astaghfirullah: 'Busco el perdón de Allah',
  
  // Messages
  dhikrCompleted: '¡Dhikr completado! Que Allah te bendiga',
  shareMessage: 'Prueba la app Subbah para Dhikr y Tasbih islámico',
  contactMessage: 'La paz sea contigo, quiero contactar sobre la app Subbah',
  continue: 'Continuar',
  
  // Additional Settings Keys
  back: 'Atrás',
  appSettings: 'Configuración de la app',
  myProfile: 'Mi Perfil',
  saved: 'Guardado',
  newGroup: 'Nuevo Grupo',
  contacts: 'Contactos',
  calls: 'Llamadas',
  savedMessages: 'Mensajes Guardados',
  inviteFriends: 'Invitar Amigos',
  telegramFeatures: 'Características de Telegram',
  darkModeEnabled: 'Modo oscuro activado',
  lightModeEnabled: 'Modo claro activado',
  vibrationOnTap: 'Vibración al tocar el contador',
  soundOnInteraction: 'Sonidos en las interacciones',
  dailyReminders: 'Recordatorios diarios para dhikr',
  colorTheme: 'Tema de color',
  blue: 'Azul',
  green: 'Verde',
  purple: 'Morado',
  gold: 'Oro',
  adSettings: 'Configuración de anuncios',
  bannerAds: 'Anuncios banner',
  showBannerAds: 'Mostrar anuncios en la parte inferior de la pantalla',
  interstitialAds: 'Anuncios intersticiales',
  showEvery: 'Mostrar cada',
  clicks: 'clics',
  remaining: 'restantes',
  adFrequency: 'Frecuencia de anuncios intersticiales',
  contactSupport: 'Contacto y soporte',
  rateAppDescription: 'Ayúdanos con tu calificación en la tienda',
  shareAppDescription: 'Comparte la app con amigos',
  contactUsDescription: 'Contacto vía WhatsApp',
  whatsappSupport: 'Soporte WhatsApp',
  whatsappSupportDescription: 'Contacto directo vía WhatsApp',
  whatsappNotInstalled: 'WhatsApp no está instalado',
  openInBrowser: 'Abrir en navegador',
  cantOpenWhatsApp: 'Error al abrir WhatsApp',
  whatsappMessage: 'Hola, quiero contactar con ustedes',
  whatsappError: 'Error al abrir WhatsApp',
  contactUsWhatsApp: 'Contacto directo vía WhatsApp',
  watchAdToUnlock: 'Ver anuncio para desbloquear temas',
  
  // Audio Settings
  selectReciter: 'Seleccionar recitador',
  reciter: 'Recitador',
  changeVoice: 'Cambiar voz',
  viewPrivacyPolicy: 'Ver política de privacidad',
  viewTerms: 'Términos de uso',
  dataManagement: 'Gestión de datos',
  exportData: 'Exportar datos',
  exportDataDescription: 'Guardar una copia de seguridad de tus datos',
  resetSettings: 'Restablecer configuración',
  resetSettingsDescription: 'Restaurar configuración predeterminada',
  resetSettingsConfirm: '¿Quieres restaurar la configuración predeterminada?',
  resetButton: 'Reiniciar',
  deleteAllData: 'Eliminar todos los datos',
  deleteAllDataDescription: 'Eliminar permanentemente todos los datos',
  resetData: 'Restablecer datos',
  resetDataConfirm: '¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.',
  delete: 'Eliminar',
  done: 'Hecho',
  dataResetSuccess: 'Todos los datos eliminados exitosamente',
  exportFailed: 'Error al exportar datos',
  settingsResetSuccess: 'Configuración restablecida exitosamente',
  sound: 'Sonido',
  default: 'Predeterminado',
  copiedToClipboard: 'Copiado al portapapeles',
  
  // New Settings Keys
  success: 'Éxito',
  shareSuccess: 'Aplicación compartida exitosamente',
  shareError: 'Error al compartir la aplicación',
  cantOpenStore: 'No se puede abrir la tienda',
  noEmailApp: 'No hay aplicación de email disponible',
  contactError: 'Error al abrir el email',
  exportSuccess: 'Datos exportados exitosamente',
  exportError: 'Error al exportar datos',
  resetError: 'Error al restablecer datos',
  cantOpenLink: 'No se puede abrir el enlace',
  reset: 'Restablecer',
  
  // Color Theme Names
  teal: 'Verde azulado',
  rose: 'Rosa',
  
  // Appearance Settings
  customizeAppearance: 'Personalizar apariencia',
  selectColorTheme: 'Seleccionar tema de color',
  display: 'Pantalla',
  animations: 'Animaciones',
  enableAnimations: 'Habilitar animaciones y transiciones',
  typography: 'Tipografía',
  fontSize: 'Tamaño de fuente',
  small: 'Pequeño',
  medium: 'Mediano',
  large: 'Grande',
  performance: 'Rendimiento',
  reducedMotion: 'Movimiento reducido',
  reduceAnimationsForBetterPerformance: 'Reducir animaciones para mejor rendimiento',
  darkMode: 'Modo oscuro',
  enableDarkMode: 'Activar modo oscuro',
  
  // Favorites
  favorites: 'Favoritos',
  
  // Authentication
  signIn: 'Iniciar sesión',
  signInWithGoogle: 'Iniciar sesión con Google',
  signOut: 'Cerrar sesión',
  signedInAs: 'Sesión iniciada como',
  account: 'Cuenta',
  signInToContinue: 'Inicia sesión para continuar',
  signInDescription: 'Inicia sesión para sincronizar tus datos en todos tus dispositivos',
  welcomeBack: 'Bienvenido de nuevo',
  notSignedIn: 'No has iniciado sesión',
  continueAsGuest: 'Continuar como invitado',
  
  // Ad Translations
  discoverIslamicApps: 'Descubre aplicaciones islámicas',
  learnMore: 'Saber más',
  premiumIslamicContent: 'Contenido islámico premium',
  explore: 'Explorar',
  islamicEducation: 'Educación islámica',
  upgradeToPremium: 'Actualizar a Premium',
  upgrade: 'Actualizar',
  joinCommunity: 'Únete a la comunidad musulmana global',
  join: 'Únete ahora',
  quranRecitation: 'Escucha el Corán por recitadores famosos',
  listen: 'Escuchar ahora',
  discover: 'Descubrir',
  prayerTimesApp: 'App de horarios de oración',
  download: 'Descargar',
  islamicBooks: 'Libros islámicos',
  browse: 'Navegar',
  islamicCourses: 'Cursos islámicos',
  enroll: 'Inscribirse',
  hajjUmrahGuide: 'Guía de Hajj y Umrah',
  viewGuide: 'Ver guía',
  
  // Welcome Screen
  welcomeTitle1: 'Subbah: App Tasbih Islámico',
  welcomeDesc1: 'Cuenta tu dhikr y adhkar en una atmósfera espiritual pacífica',
  welcomeTitle2: 'Colección Completa de Adhkar',
  welcomeDesc2: 'Adhkar de la mañana, tarde y después de la oración hechos fáciles',
  welcomeTitle3: 'Comienza Tu Viaje Espiritual',
  welcomeDesc3: 'Comienza tu viaje de dhikr y comparte las bendiciones con tus seres queridos',
  getStarted: 'Comenzar',
  skip: 'Omitir',
  continueWithoutAccount: 'Continuar sin cuenta',
  
  // Statistics Screen
  totalDhikr: 'Total Dhikr',
  streakDays: 'Días consecutivos',
  sessions: 'Sesiones completadas',
  dailyProgress: 'Progreso diario',
  dailyGoal: 'Meta diaria',
  completedDhikr: 'Dhikr completados',
  quickStats: 'Estadísticas rápidas',
  days: 'días',
  totalTarget: 'Meta total',
  favoritedhikr: 'Dhikr favorito',
  completedTimes: 'Completado',
  times: 'veces',
  dhikrDetails: 'Detalles del Dhikr',
};

// Urdu translations
const ur: TranslationKeys = {
  // App Info
  appName: 'سبّح: اسلامی تسبیح ایپ',
  appDescription: 'ڈیجیٹل اسلامی ذکر اور تسبیح ایپلیکیشن',
  
  // Navigation
  adhkar: 'اذکار',
  tasbih: 'تسبیح',
  settings: 'سیٹنگز',
  statistics: 'اعداد و شمار',
  
  // Adhkar Screen
  morningAdhkar: 'صبح کے اذکار',
  eveningAdhkar: 'شام کے اذکار',
  afterPrayerAdhkar: 'نماز کے بعد کے اذکار',
  sleepAdhkar: 'سونے کے اذکار',
  wakeupAdhkar: 'جاگنے کے اذکار',
  
  // Settings Screen
  language: 'زبان',
  vibration: 'کمپن',
  notifications: 'اطلاعات',
  theme: 'تھیم',
  about: 'ایپ کے بارے میں',
  contactUs: 'رابطہ کریں',
  shareApp: 'ایپ شیئر کریں',
  rateApp: 'ایپ کو ریٹ کریں',
  privacy: 'پرائیویسی پالیسی',
  terms: 'استعمال کی شرائط',
  version: 'ورژن',
  
  // Settings Sections
  customizeApp: 'اپنی ایپ کو حسبِ ضرورت بنائیں',
  appearance: 'ظاہری شکل',
  interaction: 'تعامل',
  
  // Categories
  general: 'عام',
  morning: 'صبح',
  evening: 'شام',
  afterPrayer: 'نماز کے بعد',
  
  // Common
  ok: 'ٹھیک ہے',
  cancel: 'منسوخ',
  save: 'محفوظ کریں',
  close: 'بند کریں',
  share: 'شیئر',
  loading: 'لوڈ ہو رہا ہے...',
  error: 'خرابی',
  retry: 'دوبارہ کوشش',
  
  // Dhikr translations
  subhanAllah: 'سبحان اللہ',
  alhamdulillah: 'الحمد للہ',
  allahuAkbar: 'اللہ اکبر',
  laIlahaIllallah: 'لا الہ الا اللہ',
  astaghfirullah: 'استغفر اللہ',
  
  // Adhkar Screen Additional
  categories: 'زمرے',
  allAdhkar: 'تمام اذکار',
  duas: 'دعائیں',
  quran: 'قرآن',
  readingModeActive: 'پڑھنے کا موڈ فعال',
  tapToRead: 'پڑھنے اور گننے کے لیے ٹیپ کریں',
  noAdhkarInCategory: 'اس زمرے میں کوئی اذکار نہیں',
  tryAnotherCategory: 'دوسرا زمرہ آزمائیں',
  loadingAdhkar: 'اذکار لوڈ ہو رہے ہیں...',
  pleaseTryAgain: 'براہ کرم دوبارہ کوشش کریں',
  
  // Tasbih Screen Additional
  today: 'آج',
  total: 'کل',
  completed: 'مکمل',
  tapToCount: 'گننے کے لیے ٹیپ کریں',
  streak: 'سلسلہ',
  resetCounter: 'کاؤنٹر ری سیٹ کریں',
  resetCounterConfirm: 'کیا آپ "{{dhikr}}" کاؤنٹر ری سیٹ کرنا چاہتے ہیں؟',
  resetAllCounters: 'تمام کاؤنٹرز ری سیٹ کریں',
  resetAllCountersConfirm: 'کیا آپ تمام کاؤنٹرز ری سیٹ کرنا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکتا۔',
  resetAll: 'سب ری سیٹ کریں',
  resetStats: 'اعدادوشمار حذف کریں',
  resetStatsConfirm: 'کیا آپ تمام اعدادوشمار حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکتا۔',
  statsResetSuccess: 'اعدادوشمار کامیابی سے حذف ہو گئے',
  dailyStats: 'روزانہ شمار کے اعدادوشمار',
  add: 'شامل کریں',
  addNewTasbih: 'نئی تسبیح شامل کریں',
  arabicText: 'عربی متن',
  arabicTextPlaceholder: 'مثال: سُبْحَانَ اللَّهِ',
  transliteration: 'نقل حرفی',
  transliterationPlaceholder: 'مثال: Subhan Allah',
  translation: 'ترجمہ',
  translationPlaceholder: 'مثال: اللہ پاک ہے',
  targetCount: 'ہدف تعداد',
  color: 'رنگ',
  pleaseEnterArabicText: 'براہ کرم عربی متن درج کریں',
  noTasbihAvailable: 'کوئی تسبیح آئٹم دستیاب نہیں',
  
  // Messages
  dhikrCompleted: 'ذکر مکمل! اللہ آپ کو برکت دے',
  shareMessage: 'اسلامی ذکر اور تسبیح کے لیے سبّح ایپ آزمائیں',
  contactMessage: 'السلام علیکم، میں سبّح ایپ کے بارے میں رابطہ کرنا چاہتا ہوں',
  continue: 'جاری رکھیں',
  
  // Additional Settings Keys
  back: 'واپس',
  appSettings: 'ایپ کی سیٹنگز',
  myProfile: 'میری پروفائل',
  saved: 'محفوظ شدہ',
  newGroup: 'نیا گروپ',
  contacts: 'رابطے',
  calls: 'کالز',
  savedMessages: 'محفوظ پیغامات',
  inviteFriends: 'دوستوں کو مدعو کریں',
  telegramFeatures: 'ٹیلیگرام کی خصوصیات',
  darkModeEnabled: 'ڈارک موڈ فعال',
  lightModeEnabled: 'لائٹ موڈ فعال',
  vibrationOnTap: 'کاؤنٹر ٹیپ پر کمپن',
  soundOnInteraction: 'تعامل پر آوازیں چلائیں',
  dailyReminders: 'ذکر کے لیے روزانہ یاد دہانیاں',
  colorTheme: 'رنگ کا تھیم',
  blue: 'نیلا',
  green: 'سبز',
  purple: 'جامنی',
  gold: 'سونا',
  adSettings: 'اشتہارات کی سیٹنگز',
  bannerAds: 'بینر اشتہارات',
  showBannerAds: 'اسکرین کے نیچے اشتہارات دکھائیں',
  interstitialAds: 'انٹرسٹیشل اشتہارات',
  showEvery: 'ہر',
  clicks: 'کلکس',
  remaining: 'باقی',
  adFrequency: 'انٹرسٹیشل اشتہارات کی تعدد',
  contactSupport: 'رابطہ اور سپورٹ',
  rateAppDescription: 'اسٹور میں اپنی ریٹنگ سے ہماری مدد کریں',
  shareAppDescription: 'دوستوں کے ساتھ ایپ شیئر کریں',
  contactUsDescription: 'واٹس ایپ کے ذریعے رابطہ',
  whatsappSupport: 'واٹس ایپ سپورٹ',
  whatsappSupportDescription: 'واٹس ایپ کے ذریعے براہ راست رابطہ',
  whatsappNotInstalled: 'واٹس ایپ انسٹال نہیں ہے',
  openInBrowser: 'براؤزر میں کھولیں',
  cantOpenWhatsApp: 'واٹس ایپ کھولنے میں ناکامی',
  whatsappMessage: 'ہیلو، میں آپ سے رابطہ کرنا چاہتا ہوں',
  whatsappError: 'واٹس ایپ کھولنے میں ناکامی',
  contactUsWhatsApp: 'واٹس ایپ کے ذریعے براہ راست رابطہ',
  watchAdToUnlock: 'رنگ تھیمز کھولنے کے لیے اشتہار دیکھیں',
  
  // Audio Settings
  selectReciter: 'قاری منتخب کریں',
  reciter: 'قاری',
  changeVoice: 'آواز تبدیل کریں',
  viewPrivacyPolicy: 'پرائیویسی پالیسی دیکھیں',
  viewTerms: 'استعمال کی شرائط',
  dataManagement: 'ڈیٹا کا انتظام',
  exportData: 'ڈیٹا ایکسپورٹ کریں',
  exportDataDescription: 'اپنے ڈیٹا کا بیک اپ محفوظ کریں',
  resetSettings: 'سیٹنگز ری سیٹ کریں',
  resetSettingsDescription: 'ڈیفالٹ سیٹنگز بحال کریں',
  resetSettingsConfirm: 'کیا آپ ڈیفالٹ سیٹنگز بحال کرنا چاہتے ہیں؟',
  resetButton: 'دوبارہ سیٹ کریں',
  deleteAllData: 'تمام ڈیٹا حذف کریں',
  deleteAllDataDescription: 'تمام ڈیٹا مستقل طور پر حذف کریں',
  resetData: 'ڈیٹا ری سیٹ کریں',
  resetDataConfirm: 'کیا آپ واقعی تمام ڈیٹا حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکتا۔',
  delete: 'حذف کریں',
  done: 'مکمل',
  dataResetSuccess: 'تمام ڈیٹا کامیابی سے حذف ہو گیا',
  exportFailed: 'ڈیٹا ایکسپورٹ میں ناکامی',
  settingsResetSuccess: 'سیٹنگز کامیابی سے ری سیٹ ہو گئیں',
  sound: 'آواز',
  default: 'ڈیفالٹ',
  copiedToClipboard: 'کلپ بورڈ میں کاپی ہو گیا',
  
  // New Settings Keys
  success: 'کامیابی',
  shareSuccess: 'ایپ کامیابی سے شیئر ہوئی',
  shareError: 'ایپ شیئر کرنے میں ناکامی',
  cantOpenStore: 'اسٹور نہیں کھل سکا',
  noEmailApp: 'کوئی ای میل ایپ دستیاب نہیں',
  contactError: 'ای میل کھولنے میں ناکامی',
  exportSuccess: 'ڈیٹا کامیابی سے ایکسپورٹ ہوا',
  exportError: 'ڈیٹا ایکسپورٹ میں ناکامی',
  resetError: 'ڈیٹا ری سیٹ میں ناکامی',
  cantOpenLink: 'لنک نہیں کھل سکا',
  reset: 'ری سیٹ',
  
  // Color Theme Names
  teal: 'فیروزی',
  rose: 'گلابی',
  
  // Appearance Settings
  customizeAppearance: 'ظاہری شکل کو حسبِ ضرورت بنائیں',
  selectColorTheme: 'رنگ کا تھیم منتخب کریں',
  display: 'ڈسپلے',
  animations: 'حرکات',
  enableAnimations: 'حرکات اور منتقلی کو فعال کریں',
  typography: 'ٹائپوگرافی',
  fontSize: 'فونٹ کا سائز',
  small: 'چھوٹا',
  medium: 'درمیانہ',
  large: 'بڑا',
  performance: 'کارکردگی',
  reducedMotion: 'کم حرکت',
  reduceAnimationsForBetterPerformance: 'بہتر کارکردگی کے لیے حرکات کم کریں',
  darkMode: 'ڈارک موڈ',
  enableDarkMode: 'ڈارک موڈ فعال کریں',
  
  // Favorites
  favorites: 'پسندیدہ',
  
  // Authentication
  signIn: 'سائن ان کریں',
  signInWithGoogle: 'Google سے سائن ان کریں',
  signOut: 'سائن آؤٹ',
  signedInAs: 'سائن ان ہے بطور',
  account: 'اکاؤنٹ',
  signInToContinue: 'جاری رکھنے کے لیے سائن ان کریں',
  signInDescription: 'اپنے ڈیٹا کو تمام ڈیوائسز پر ہم آہنگ کرنے کے لیے سائن ان کریں',
  welcomeBack: 'خوش آمدید واپسی',
  notSignedIn: 'سائن ان نہیں',
  continueAsGuest: 'مہمان کے طور پر جاری رکھیں',
  
  // Ad Translations
  discoverIslamicApps: 'اسلامی ایپس دریافت کریں',
  learnMore: 'مزید جانیں',
  premiumIslamicContent: 'پریمیم اسلامی مواد',
  explore: 'دریافت کریں',
  islamicEducation: 'اسلامی تعلیم',
  upgradeToPremium: 'پریمیم میں اپگریڈ کریں',
  upgrade: 'اپگریڈ',
  joinCommunity: 'عالمی مسلم کمیونٹی میں شامل ہوں',
  join: 'ابھی شامل ہوں',
  quranRecitation: 'مشہور قاریوں کی آواز میں قرآن سنیں',
  listen: 'ابھی سنیں',
  discover: 'دریافت کریں',
  prayerTimesApp: 'نماز کے اوقات کی ایپ',
  download: 'ڈاؤن لوڈ',
  islamicBooks: 'اسلامی کتابیں',
  browse: 'براؤز کریں',
  islamicCourses: 'اسلامی کورسز',
  enroll: 'اندراج کریں',
  hajjUmrahGuide: 'حج اور عمرہ گائیڈ',
  viewGuide: 'گائیڈ دیکھیں',
  
  // Welcome Screen
  welcomeTitle1: 'Subbah: اسلامی تسبیح ایپ',
  welcomeDesc1: 'اپنے ذکر اور اذکار کو پرسکون روحانی ماحول میں شمار کریں',
  welcomeTitle2: 'مکمل اذکار کا مجموعہ',
  welcomeDesc2: 'صبح، شام اور نماز کے بعد کے اذکار آسان بنا دیے گئے',
  welcomeTitle3: 'اپنا روحانی سفر شروع کریں',
  welcomeDesc3: 'اپنے ذکر کا سفر شروع کریں اور برکتوں کو اپنوں کے ساتھ بانٹیں',
  getStarted: 'شروع کریں',
  skip: 'چھوڑیں',
  continueWithoutAccount: 'اکاؤنٹ کے بغیر جاری رکھیں',
  
  // Statistics Screen
  totalDhikr: 'کل ذکر',
  streakDays: 'متواتر دن',
  sessions: 'مکمل سیشنز',
  dailyProgress: 'روزانہ پیش رفت',
  dailyGoal: 'روزانہ ہدف',
  completedDhikr: 'مکمل ذکر',
  quickStats: 'فوری اعداد و شمار',
  days: 'دن',
  totalTarget: 'کل ہدف',
  favoritedhikr: 'پسندیدہ ذکر',
  completedTimes: 'مکمل',
  times: 'بار',
  dhikrDetails: 'ذکر کی تفصیلات',
};

// Indonesian translations
const id: TranslationKeys = {
  // App Info
  appName: 'Subbah: Aplikasi Tasbih Islam',
  appDescription: 'Aplikasi Digital Dzikir dan Tasbih Islam',
  
  // Navigation
  adhkar: 'Dzikir',
  tasbih: 'Tasbih',
  settings: 'Pengaturan',
  statistics: 'Statistik',
  
  // Adhkar Screen
  morningAdhkar: 'Dzikir Pagi',
  eveningAdhkar: 'Dzikir Sore',
  afterPrayerAdhkar: 'Dzikir Setelah Shalat',
  sleepAdhkar: 'Dzikir Tidur',
  wakeupAdhkar: 'Dzikir Bangun Tidur',
  
  // Settings Screen
  language: 'Bahasa',
  vibration: 'Getaran',
  notifications: 'Notifikasi',
  theme: 'Tema',
  about: 'Tentang',
  contactUs: 'Hubungi Kami',
  shareApp: 'Bagikan Aplikasi',
  rateApp: 'Beri Rating',
  privacy: 'Kebijakan Privasi',
  terms: 'Syarat Penggunaan',
  version: 'Versi',
  // Settings Sections
  customizeApp: 'Sesuaikan aplikasi Anda',
  appearance: 'Tampilan',
  interaction: 'Interaksi',
  
  // Categories
  general: 'Umum',
  morning: 'Pagi',
  evening: 'Sore',
  afterPrayer: 'Setelah Shalat',
  
  // Common
  ok: 'OK',
  cancel: 'Batal',
  save: 'Simpan',
  close: 'Tutup',
  share: 'Bagikan',
  loading: 'Memuat...',
  error: 'Error',
  retry: 'Coba Lagi',
  
  // Dhikr translations
  subhanAllah: 'Maha Suci Allah',
  alhamdulillah: 'Segala Puji bagi Allah',
  allahuAkbar: 'Allah Maha Besar',
  laIlahaIllallah: 'Tiada Tuhan selain Allah',
  astaghfirullah: 'Aku memohon ampun kepada Allah',
  
  // Adhkar Screen Additional
  categories: 'Kategori',
  allAdhkar: 'Semua Dzikir',
  duas: 'Doa',
  quran: 'Quran',
  readingModeActive: 'Mode membaca aktif',
  tapToRead: 'Ketuk untuk membaca dan menghitung',
  noAdhkarInCategory: 'Tidak ada dzikir dalam kategori ini',
  tryAnotherCategory: 'Coba kategori lain',
  loadingAdhkar: 'Memuat dzikir...',
  pleaseTryAgain: 'Silakan coba lagi',
  
  // Tasbih Screen Additional
  today: 'Hari ini',
  total: 'Total',
  completed: 'Selesai',
  tapToCount: 'Ketuk untuk menghitung',
  streak: 'Beruntun',
  resetCounter: 'Reset Counter',
  resetCounterConfirm: 'Apakah Anda ingin mereset counter "{{dhikr}}"?',
  resetAllCounters: 'Reset Semua Counter',
  resetAllCountersConfirm: 'Apakah Anda ingin mereset semua counter? Tindakan ini tidak dapat dibatalkan.',
  resetAll: 'Reset Semua',
  resetStats: 'Hapus Statistik',
  resetStatsConfirm: 'Apakah Anda ingin menghapus semua statistik? Tindakan ini tidak dapat dibatalkan.',
  statsResetSuccess: 'Statistik berhasil dihapus',
  dailyStats: 'Statistik Penghitungan Harian',
  add: 'Tambah',
  addNewTasbih: 'Tambah Tasbih Baru',
  arabicText: 'Teks Arab',
  arabicTextPlaceholder: 'Contoh: سُبْحَانَ اللَّهِ',
  transliteration: 'Transliterasi',
  transliterationPlaceholder: 'Contoh: Subhan Allah',
  translation: 'Terjemahan',
  translationPlaceholder: 'Contoh: Maha Suci Allah',
  targetCount: 'Target Hitungan',
  color: 'Warna',
  pleaseEnterArabicText: 'Silakan masukkan teks Arab',
  noTasbihAvailable: 'Tidak ada item tasbih tersedia',
  
  // Messages
  dhikrCompleted: 'Dzikir selesai! Semoga Allah memberkahi Anda',
  shareMessage: 'Coba aplikasi Subbah untuk Dzikir dan Tasbih Islam',
  contactMessage: 'Assalamu\'alaikum, saya ingin menghubungi tentang aplikasi Subbah',
  continue: 'Lanjutkan',
  
  // Additional Settings Keys
  back: 'Kembali',
  appSettings: 'Pengaturan Aplikasi',
  myProfile: 'Profil Saya',
  saved: 'Tersimpan',
  newGroup: 'Grup Baru',
  contacts: 'Kontak',
  calls: 'Panggilan',
  savedMessages: 'Pesan Tersimpan',
  inviteFriends: 'Undang Teman',
  telegramFeatures: 'Fitur Telegram',
  darkModeEnabled: 'Mode gelap diaktifkan',
  lightModeEnabled: 'Mode terang diaktifkan',
  vibrationOnTap: 'Getaran saat mengetuk counter',
  soundOnInteraction: 'Putar suara saat interaksi',
  dailyReminders: 'Pengingat harian untuk dzikir',
  colorTheme: 'Tema Warna',
  blue: 'Biru',
  green: 'Hijau',
  purple: 'Ungu',
  gold: 'Emas',
  adSettings: 'Pengaturan Iklan',
  bannerAds: 'Iklan Banner',
  showBannerAds: 'Tampilkan iklan di bagian bawah layar',
  interstitialAds: 'Iklan Interstitial',
  showEvery: 'Tampilkan setiap',
  clicks: 'klik',
  remaining: 'tersisa',
  adFrequency: 'Frekuensi Iklan Interstitial',
  contactSupport: 'Kontak & Dukungan',
  rateAppDescription: 'Bantu kami dengan rating Anda di store',
  shareAppDescription: 'Bagikan aplikasi dengan teman',
  contactUsDescription: 'Kontak via WhatsApp',
  whatsappSupport: 'Dukungan WhatsApp',
  whatsappSupportDescription: 'Kontak langsung melalui WhatsApp',
  whatsappNotInstalled: 'WhatsApp tidak terinstal',
  openInBrowser: 'Buka di Browser',
  cantOpenWhatsApp: 'Gagal membuka WhatsApp',
  whatsappMessage: 'Halo, saya ingin menghubungi Anda',
  whatsappError: 'Gagal membuka WhatsApp',
  contactUsWhatsApp: 'Kontak langsung melalui WhatsApp',
  watchAdToUnlock: 'Tonton iklan untuk membuka tema warna',
  
  // Audio Settings
  selectReciter: 'Pilih Qari',
  reciter: 'Qari',
  changeVoice: 'Ubah Suara',
  viewPrivacyPolicy: 'Lihat kebijakan privasi',
  viewTerms: 'Syarat penggunaan',
  dataManagement: 'Manajemen Data',
  exportData: 'Ekspor Data',
  exportDataDescription: 'Simpan cadangan data Anda',
  resetSettings: 'Reset Pengaturan',
  resetSettingsDescription: 'Kembalikan pengaturan default',
  resetSettingsConfirm: 'Apakah Anda ingin mengembalikan pengaturan default?',
  resetButton: 'Reset',
  deleteAllData: 'Hapus Semua Data',
  deleteAllDataDescription: 'Hapus semua data secara permanen',
  resetData: 'Reset Data',
  resetDataConfirm: 'Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.',
  delete: 'Hapus',
  done: 'Selesai',
  dataResetSuccess: 'Semua data berhasil dihapus',
  exportFailed: 'Gagal mengekspor data',
  settingsResetSuccess: 'Pengaturan berhasil direset',
  sound: 'Suara',
  default: 'Default',
  copiedToClipboard: 'Disalin ke clipboard',
  
  // New Settings Keys
  success: 'Berhasil',
  shareSuccess: 'Aplikasi berhasil dibagikan',
  shareError: 'Gagal membagikan aplikasi',
  cantOpenStore: 'Tidak dapat membuka toko',
  noEmailApp: 'Tidak ada aplikasi email tersedia',
  contactError: 'Gagal membuka email',
  exportSuccess: 'Data berhasil diekspor',
  exportError: 'Gagal mengekspor data',
  resetError: 'Gagal mereset data',
  cantOpenLink: 'Tidak dapat membuka tautan',
  reset: 'Reset',
  
  // Color Theme Names
  teal: 'Hijau kebiruan',
  rose: 'Mawar',
  
  // Appearance Settings
  customizeAppearance: 'Sesuaikan tampilan',
  selectColorTheme: 'Pilih tema warna',
  display: 'Tampilan',
  animations: 'Animasi',
  enableAnimations: 'Aktifkan animasi dan transisi',
  typography: 'Tipografi',
  fontSize: 'Ukuran Font',
  small: 'Kecil',
  medium: 'Sedang',
  large: 'Besar',
  performance: 'Performa',
  reducedMotion: 'Gerakan Berkurang',
  reduceAnimationsForBetterPerformance: 'Kurangi animasi untuk performa yang lebih baik',
  darkMode: 'Mode Gelap',
  enableDarkMode: 'Aktifkan mode gelap',
  
  // Favorites
  favorites: 'Favorit',
  
  // Authentication
  signIn: 'Masuk',
  signInWithGoogle: 'Masuk dengan Google',
  signOut: 'Keluar',
  signedInAs: 'Masuk sebagai',
  account: 'Akun',
  signInToContinue: 'Masuk untuk melanjutkan',
  signInDescription: 'Masuk untuk menyinkronkan data Anda di semua perangkat',
  welcomeBack: 'Selamat datang kembali',
  notSignedIn: 'Belum masuk',
  continueAsGuest: 'Lanjutkan sebagai tamu',
  
  // Ad Translations
  discoverIslamicApps: 'Temukan Aplikasi Islami',
  learnMore: 'Pelajari Lebih Lanjut',
  premiumIslamicContent: 'Konten Islami Premium',
  explore: 'Jelajahi',
  islamicEducation: 'Pendidikan Islam',
  upgradeToPremium: 'Upgrade ke Premium',
  upgrade: 'Upgrade',
  joinCommunity: 'Bergabung dengan Komunitas Muslim Global',
  join: 'Bergabung Sekarang',
  quranRecitation: 'Dengarkan Quran oleh Qari Terkenal',
  listen: 'Dengarkan Sekarang',
  discover: 'Temukan',
  prayerTimesApp: 'Aplikasi Waktu Sholat',
  download: 'Unduh',
  islamicBooks: 'Buku-buku Islam',
  browse: 'Telusuri',
  islamicCourses: 'Kursus Islam',
  enroll: 'Daftar',
  hajjUmrahGuide: 'Panduan Haji & Umrah',
  viewGuide: 'Lihat Panduan',
  
  // Welcome Screen
  welcomeTitle1: 'Subbah: Aplikasi Tasbih Islam',
  welcomeDesc1: 'Hitung dzikir dan adhkar Anda dalam suasana spiritual yang damai',
  welcomeTitle2: 'Koleksi Dzikir Lengkap',
  welcomeDesc2: 'Dzikir pagi, sore, dan setelah shalat dibuat mudah',
  welcomeTitle3: 'Mulai Perjalanan Spiritual Anda',
  welcomeDesc3: 'Mulai perjalanan dzikir Anda dan bagikan berkah dengan orang-orang terkasih',
  getStarted: 'Mulai',
  skip: 'Lewati',
  continueWithoutAccount: 'Lanjutkan tanpa akun',
  
  // Statistics Screen
  totalDhikr: 'Total Dzikir',
  streakDays: 'Hari Berturut-turut',
  sessions: 'Sesi Selesai',
  dailyProgress: 'Kemajuan Harian',
  dailyGoal: 'Target Harian',
  completedDhikr: 'Dzikir Selesai',
  quickStats: 'Statistik Cepat',
  days: 'hari',
  totalTarget: 'Target Total',
  favoritedhikr: 'Dzikir Favorit',
  completedTimes: 'Selesai',
  times: 'kali',
  dhikrDetails: 'Detail Dzikir',
};

// Turkish translations
const tr: TranslationKeys = {
  // App Info
  appName: 'Subbah: İslami Tesbih Uygulaması',
  appDescription: 'Dijital İslami Zikir ve Tesbih Uygulaması',
  
  // Navigation
  adhkar: 'Ezkar',
  tasbih: 'Tesbih',
  settings: 'Ayarlar',
  statistics: 'İstatistikler',
  
  // Adhkar Screen
  morningAdhkar: 'Sabah Ezkarı',
  eveningAdhkar: 'Akşam Ezkarı',
  afterPrayerAdhkar: 'Namaz Sonrası Ezkar',
  sleepAdhkar: 'Uyku Ezkarı',
  wakeupAdhkar: 'Uyanma Ezkarı',
  
  // Settings Screen
  language: 'Dil',
  vibration: 'Titreşim',
  notifications: 'Bildirimler',
  theme: 'Tema',
  about: 'Hakkında',
  contactUs: 'İletişim',
  shareApp: 'Uygulamayı Paylaş',
  rateApp: 'Uygulamayı Değerlendir',
  privacy: 'Gizlilik Politikası',
  terms: 'Kullanım Şartları',
  version: 'Sürüm',
  // Settings Sections
  customizeApp: 'Uygulamayı özelleştir',
  appearance: 'Görünüm',
  interaction: 'Etkileşim',
  
  // Categories
  general: 'Genel',
  morning: 'Sabah',
  evening: 'Akşam',
  afterPrayer: 'Namaz Sonrası',
  
  // Common
  ok: 'Tamam',
  cancel: 'İptal',
  save: 'Kaydet',
  close: 'Kapat',
  share: 'Paylaş',
  loading: 'Yükleniyor...',
  error: 'Hata',
  retry: 'Tekrar Dene',
  
  // Dhikr translations
  subhanAllah: 'Allah\'ı tenzih ederim',
  alhamdulillah: 'Hamd Allah\'a mahsustur',
  allahuAkbar: 'Allah en büyüktür',
  laIlahaIllallah: 'Allah\'tan başka ilah yoktur',
  astaghfirullah: 'Allah\'tan bağışlanma dilerim',
  
  // Adhkar Screen Additional
  categories: 'Kategoriler',
  allAdhkar: 'Tüm Ezkarlar',
  duas: 'Dualar',
  quran: 'Kuran',
  readingModeActive: 'Okuma modu aktif',
  tapToRead: 'Okumak ve saymak için dokunun',
  noAdhkarInCategory: 'Bu kategoride ezkar yok',
  tryAnotherCategory: 'Başka bir kategori deneyin',
  loadingAdhkar: 'Ezkarlar yükleniyor...',
  pleaseTryAgain: 'Lütfen tekrar deneyin',
  
  // Tasbih Screen Additional
  today: 'Bugün',
  total: 'Toplam',
  completed: 'Tamamlandı',
  tapToCount: 'Saymak için dokunun',
  streak: 'Seri',
  resetCounter: 'Sayacı Sıfırla',
  resetCounterConfirm: '"{{dhikr}}" sayacını sıfırlamak istiyor musunuz?',
  resetAllCounters: 'Tüm Sayaçları Sıfırla',
  resetAllCountersConfirm: 'Tüm sayaçları sıfırlamak istiyor musunuz? Bu işlem geri alınamaz.',
  resetAll: 'Hepsini Sıfırla',
  resetStats: 'İstatistikleri Sil',
  resetStatsConfirm: 'Tüm istatistikleri silmek istiyor musunuz? Bu işlem geri alınamaz.',
  statsResetSuccess: 'İstatistikler başarıyla silindi',
  dailyStats: 'Günlük Sayım İstatistikleri',
  add: 'Ekle',
  addNewTasbih: 'Yeni Tesbih Ekle',
  arabicText: 'Arapça Metin',
  arabicTextPlaceholder: 'Örnek: سُبْحَانَ اللَّهِ',
  transliteration: 'Transliterasyon',
  transliterationPlaceholder: 'Örnek: Subhan Allah',
  translation: 'Çeviri',
  translationPlaceholder: 'Örnek: Allah\'ı tenzih ederim',
  targetCount: 'Hedef Sayı',
  color: 'Renk',
  pleaseEnterArabicText: 'Lütfen Arapça metin girin',
  noTasbihAvailable: 'Kullanılabilir tesbih öğesi yok',
  
  // Messages
  dhikrCompleted: 'Zikir tamamlandı! Allah sizi mübarek kılsın',
  shareMessage: 'İslami Zikir ve Tesbih için Subbah uygulamasını deneyin',
  contactMessage: 'Selamün aleyküm, Subbah uygulaması hakkında iletişime geçmek istiyorum',
  continue: 'Devam Et',
  
  // Additional Settings Keys
  back: 'Geri',
  appSettings: 'Uygulama Ayarları',
  myProfile: 'Profilim',
  saved: 'Kaydedildi',
  newGroup: 'Yeni Grup',
  contacts: 'Kişiler',
  calls: 'Aramalar',
  savedMessages: 'Kayıtlı Mesajlar',
  inviteFriends: 'Arkadaş Davet Et',
  telegramFeatures: 'Telegram Özellikleri',
  darkModeEnabled: 'Karanlık mod etkin',
  lightModeEnabled: 'Açık mod etkin',
  vibrationOnTap: 'Sayaç dokunuşunda titreşim',
  soundOnInteraction: 'Etkileşimde ses çal',
  dailyReminders: 'Zikir için günlük hatırlatmalar',
  colorTheme: 'Renk Teması',
  blue: 'Mavi',
  green: 'Yeşil',
  purple: 'Mor',
  gold: 'Altın',
  adSettings: 'Reklam Ayarları',
  bannerAds: 'Banner Reklamları',
  showBannerAds: 'Ekranın altında reklamları göster',
  interstitialAds: 'Geçiş Reklamları',
  showEvery: 'Her',
  clicks: 'tıklamada',
  remaining: 'kalan',
  adFrequency: 'Geçiş Reklamı Sıklığı',
  contactSupport: 'İletişim ve Destek',
  rateAppDescription: 'Mağazadaki puanınızla bize yardım edin',
  shareAppDescription: 'Uygulamayı arkadaşlarınızla paylaşın',
  contactUsDescription: 'WhatsApp ile iletişim',
  whatsappSupport: 'WhatsApp Desteği',
  whatsappSupportDescription: 'WhatsApp ile doğrudan iletişim',
  whatsappNotInstalled: 'WhatsApp yüklü değil',
  openInBrowser: 'Tarayıcıda Aç',
  cantOpenWhatsApp: 'WhatsApp açılamadı',
  whatsappMessage: 'Merhaba, sizinle iletişime geçmek istiyorum',
  whatsappError: 'WhatsApp açılamadı',
  contactUsWhatsApp: 'WhatsApp ile doğrudan iletişim',
  watchAdToUnlock: 'Renk temalarını açmak için reklam izleyin',
  
  // Audio Settings
  selectReciter: 'Hafız seç',
  reciter: 'Hafız',
  changeVoice: 'Ses değiştir',
  viewPrivacyPolicy: 'Gizlilik politikasını görüntüle',
  viewTerms: 'Kullanım şartları',
  dataManagement: 'Veri Yönetimi',
  exportData: 'Veri Dışa Aktar',
  exportDataDescription: 'Verilerinizin yedeğini kaydedin',
  resetSettings: 'Ayarları Sıfırla',
  resetSettingsDescription: 'Varsayılan ayarları geri yükle',
  resetSettingsConfirm: 'Varsayılan ayarları geri yüklemek istiyor musunuz?',
  resetButton: 'Sıfırla',
  deleteAllData: 'Tüm Verileri Sil',
  deleteAllDataDescription: 'Tüm verileri kalıcı olarak sil',
  resetData: 'Verileri Sıfırla',
  resetDataConfirm: 'Tüm verileri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
  delete: 'Sil',
  done: 'Tamamlandı',
  dataResetSuccess: 'Tüm veriler başarıyla silindi',
  exportFailed: 'Veri dışa aktarma başarısız',
  settingsResetSuccess: 'Ayarlar başarıyla sıfırlandı',
  sound: 'Ses',
  default: 'Varsayılan',
  copiedToClipboard: 'Panoya kopyalandı',
  
  // New Settings Keys
  success: 'Başarılı',
  shareSuccess: 'Uygulama başarıyla paylaşıldı',
  shareError: 'Uygulama paylaşılamadı',
  cantOpenStore: 'Mağaza açılamıyor',
  noEmailApp: 'E-posta uygulaması mevcut değil',
  contactError: 'E-posta açılamadı',
  exportSuccess: 'Veri başarıyla dışa aktarıldı',
  exportError: 'Veri dışa aktarılamadı',
  resetError: 'Veri sıfırlanamadı',
  cantOpenLink: 'Bağlantı açılamıyor',
  reset: 'Sıfırla',
  
  // Color Theme Names
  teal: 'Deniz mavisi',
  rose: 'Gül',
  
  // Appearance Settings
  customizeAppearance: 'Görünümü özelleştir',
  selectColorTheme: 'Renk teması seç',
  display: 'Ekran',
  animations: 'Animasyonlar',
  enableAnimations: 'Animasyonları ve geçişleri etkinleştir',
  typography: 'Tipografi',
  fontSize: 'Yazı Boyutu',
  small: 'Küçük',
  medium: 'Orta',
  large: 'Büyük',
  performance: 'Performans',
  reducedMotion: 'Azaltılmış Hareket',
  reduceAnimationsForBetterPerformance: 'Daha iyi performans için animasyonları azalt',
  darkMode: 'Karanlık Mod',
  enableDarkMode: 'Karanlık modu etkinleştir',
  
  // Favorites
  favorites: 'Favoriler',
  
  // Authentication
  signIn: 'Giriş Yap',
  signInWithGoogle: 'Google ile Giriş Yap',
  signOut: 'Çıkış Yap',
  signedInAs: 'Giriş yapıldı',
  account: 'Hesap',
  signInToContinue: 'Devam etmek için giriş yapın',
  signInDescription: 'Verilerinizi tüm cihazlarınızda senkronize etmek için giriş yapın',
  welcomeBack: 'Tekrar hoş geldiniz',
  notSignedIn: 'Giriş yapılmadı',
  continueAsGuest: 'Misafir olarak devam et',
  
  // Ad Translations
  discoverIslamicApps: 'İslami Uygulamaları Keşfedin',
  learnMore: 'Daha Fazla Bilgi',
  premiumIslamicContent: 'Premium İslami İçerik',
  explore: 'Keşfet',
  islamicEducation: 'İslami Eğitim',
  upgradeToPremium: 'Premium\'a Yükselt',
  upgrade: 'Yükselt',
  joinCommunity: 'Küresel Müslüman Topluluğuna Katılın',
  join: 'Şimdi Katıl',
  quranRecitation: 'Ünlü Hafızlar Tarafından Kuran Dinleyin',
  listen: 'Şimdi Dinle',
  discover: 'Keşfet',
  prayerTimesApp: 'Namaz Vakitleri Uygulaması',
  download: 'İndir',
  islamicBooks: 'İslami Kitaplar',
  browse: 'Gözat',
  islamicCourses: 'İslami Kurslar',
  enroll: 'Kayıt Ol',
  hajjUmrahGuide: 'Hac ve Umre Rehberi',
  viewGuide: 'Rehberi Görüntüle',
  
  // Welcome Screen
  welcomeTitle1: 'Subbah: İslami Tesbih Uygulaması',
  welcomeDesc1: 'Zikirinizi ve ezkarlarınızı huzurlu bir ruhsal atmosferde sayın',
  welcomeTitle2: 'Eksiksiz Ezkar Koleksiyonu',
  welcomeDesc2: 'Sabah, akşam ve namaz sonrası ezkarlar kolaylaştırıldı',
  welcomeTitle3: 'Manevi Yolculuğunuza Başlayın',
  welcomeDesc3: 'Zikir yolculuğunuza başlayın ve berketleri sevdiklerinizle paylaşın',
  getStarted: 'Başla',
  skip: 'Geç',
  continueWithoutAccount: 'Hesap olmadan devam et',
  
  // Statistics Screen
  totalDhikr: 'Toplam Zikir',
  streakDays: 'Ardışık Günler',
  sessions: 'Tamamlanan Oturumlar',
  dailyProgress: 'Günlük İlerleme',
  dailyGoal: 'Günlük Hedef',
  completedDhikr: 'Tamamlanan Zikir',
  quickStats: 'Hızlı İstatistikler',
  days: 'gün',
  totalTarget: 'Toplam Hedef',
  favoritedhikr: 'Favori Zikir',
  completedTimes: 'Tamamlandı',
  times: 'kez',
  dhikrDetails: 'Zikir Detayları',
};

// Malay translations
const ms: TranslationKeys = {
  // App Info
  appName: 'Subbah: Aplikasi Tasbih Islam',
  appDescription: 'Aplikasi Digital Zikir dan Tasbih Islam',
  
  // Navigation
  adhkar: 'Zikir',
  tasbih: 'Tasbih',
  settings: 'Tetapan',
  statistics: 'Statistik',
  
  // Adhkar Screen
  morningAdhkar: 'Zikir Pagi',
  eveningAdhkar: 'Zikir Petang',
  afterPrayerAdhkar: 'Zikir Selepas Solat',
  sleepAdhkar: 'Zikir Tidur',
  wakeupAdhkar: 'Zikir Bangun Tidur',
  
  // Settings Screen
  language: 'Bahasa',
  vibration: 'Getaran',
  notifications: 'Pemberitahuan',
  theme: 'Tema',
  about: 'Mengenai',
  contactUs: 'Hubungi Kami',
  shareApp: 'Kongsi Aplikasi',
  rateApp: 'Nilai Aplikasi',
  privacy: 'Dasar Privasi',
  terms: 'Terma Penggunaan',
  version: 'Versi',
  // Settings Sections
  customizeApp: 'Sesuaikan aplikasi anda',
  appearance: 'Penampilan',
  interaction: 'Interaksi',
  
  // Categories
  general: 'Am',
  morning: 'Pagi',
  evening: 'Petang',
  afterPrayer: 'Selepas Solat',
  
  // Common
  ok: 'OK',
  cancel: 'Batal',
  save: 'Simpan',
  close: 'Tutup',
  share: 'Kongsi',
  loading: 'Memuatkan...',
  error: 'Ralat',
  retry: 'Cuba Lagi',
  
  // Dhikr translations
  subhanAllah: 'Maha Suci Allah',
  alhamdulillah: 'Segala puji bagi Allah',
  allahuAkbar: 'Allah Maha Besar',
  laIlahaIllallah: 'Tiada Tuhan melainkan Allah',
  astaghfirullah: 'Aku memohon keampunan Allah',
  
  // Adhkar Screen Additional
  categories: 'Kategori',
  allAdhkar: 'Semua Zikir',
  duas: 'Doa',
  quran: 'Quran',
  readingModeActive: 'Mod membaca aktif',
  tapToRead: 'Ketik untuk membaca dan mengira',
  noAdhkarInCategory: 'Tiada zikir dalam kategori ini',
  tryAnotherCategory: 'Cuba kategori lain',
  loadingAdhkar: 'Memuatkan zikir...',
  pleaseTryAgain: 'Sila cuba lagi',
  
  // Tasbih Screen Additional
  today: 'Hari ini',
  total: 'Jumlah',
  completed: 'Selesai',
  tapToCount: 'Ketik untuk mengira',
  streak: 'Berturut-turut',
  resetCounter: 'Set Semula Kaunter',
  resetCounterConfirm: 'Adakah anda ingin set semula kaunter "{{dhikr}}"?',
  resetAllCounters: 'Set Semula Semua Kaunter',
  resetAllCountersConfirm: 'Adakah anda ingin set semula semua kaunter? Tindakan ini tidak boleh dibatalkan.',
  resetAll: 'Set Semula Semua',
  resetStats: 'Padam Statistik',
  resetStatsConfirm: 'Adakah anda ingin memadam semua statistik? Tindakan ini tidak boleh dibatalkan.',
  statsResetSuccess: 'Statistik berjaya dipadam',
  dailyStats: 'Statistik Kiraan Harian',
  add: 'Tambah',
  addNewTasbih: 'Tambah Tasbih Baru',
  arabicText: 'Teks Arab',
  arabicTextPlaceholder: 'Contoh: سُبْحَانَ اللَّهِ',
  transliteration: 'Transliterasi',
  transliterationPlaceholder: 'Contoh: Subhan Allah',
  translation: 'Terjemahan',
  translationPlaceholder: 'Contoh: Maha Suci Allah',
  targetCount: 'Sasaran Kiraan',
  color: 'Warna',
  pleaseEnterArabicText: 'Sila masukkan teks Arab',
  noTasbihAvailable: 'Tiada item tasbih tersedia',
  
  // Messages
  dhikrCompleted: 'Zikir selesai! Semoga Allah memberkati anda',
  shareMessage: 'Cuba aplikasi Subbah untuk Zikir dan Tasbih Islam',
  contactMessage: 'Assalamualaikum, saya ingin menghubungi mengenai aplikasi Subbah',
  continue: 'Teruskan',
  
  // Additional Settings Keys
  back: 'Kembali',
  appSettings: 'Tetapan Aplikasi',
  myProfile: 'Profil Saya',
  saved: 'Disimpan',
  newGroup: 'Kumpulan Baru',
  contacts: 'Kenalan',
  calls: 'Panggilan',
  savedMessages: 'Mesej Tersimpan',
  inviteFriends: 'Jemput Kawan',
  telegramFeatures: 'Ciri Telegram',
  darkModeEnabled: 'Mod gelap diaktifkan',
  lightModeEnabled: 'Mod terang diaktifkan',
  vibrationOnTap: 'Getaran pada ketukan kaunter',
  soundOnInteraction: 'Mainkan bunyi semasa interaksi',
  dailyReminders: 'Peringatan harian untuk zikir',
  colorTheme: 'Tema Warna',
  blue: 'Biru',
  green: 'Hijau',
  purple: 'Ungu',
  gold: 'Emas',
  adSettings: 'Tetapan Iklan',
  bannerAds: 'Iklan Banner',
  showBannerAds: 'Tunjukkan iklan di bahagian bawah skrin',
  interstitialAds: 'Iklan Interstitial',
  showEvery: 'Tunjukkan setiap',
  clicks: 'klik',
  remaining: 'baki',
  adFrequency: 'Kekerapan Iklan Interstitial',
  contactSupport: 'Hubungi & Sokongan',
  rateAppDescription: 'Bantu kami dengan penilaian anda di kedai',
  shareAppDescription: 'Kongsi aplikasi dengan rakan',
  contactUsDescription: 'Hubungi melalui WhatsApp',
  whatsappSupport: 'Sokongan WhatsApp',
  whatsappSupportDescription: 'Hubungan langsung melalui WhatsApp',
  whatsappNotInstalled: 'WhatsApp tidak dipasang',
  openInBrowser: 'Buka dalam Pelayar',
  cantOpenWhatsApp: 'Gagal membuka WhatsApp',
  whatsappMessage: 'Halo, saya ingin menghubungi anda',
  whatsappError: 'Gagal membuka WhatsApp',
  contactUsWhatsApp: 'Hubungan langsung melalui WhatsApp',
  watchAdToUnlock: 'Tonton iklan untuk membuka tema warna',
  
  // Audio Settings
  selectReciter: 'Pilih Qari',
  reciter: 'Qari',
  changeVoice: 'Tukar Suara',
  viewPrivacyPolicy: 'Lihat dasar privasi',
  viewTerms: 'Terma penggunaan',
  dataManagement: 'Pengurusan Data',
  exportData: 'Eksport Data',
  exportDataDescription: 'Simpan salinan data anda',
  resetSettings: 'Set Semula Tetapan',
  resetSettingsDescription: 'Pulihkan tetapan lalai',
  resetSettingsConfirm: 'Adakah anda ingin memulihkan tetapan lalai?',
  resetButton: 'Set Semula',
  deleteAllData: 'Padam Semua Data',
  deleteAllDataDescription: 'Padam semua data secara kekal',
  resetData: 'Set Semula Data',
  resetDataConfirm: 'Adakah anda pasti ingin memadam semua data? Tindakan ini tidak boleh dibatalkan.',
  delete: 'Padam',
  done: 'Selesai',
  dataResetSuccess: 'Semua data berjaya dipadam',
  exportFailed: 'Gagal mengeksport data',
  settingsResetSuccess: 'Tetapan berjaya di set semula',
  sound: 'Bunyi',
  default: 'Lalai',
  copiedToClipboard: 'Disalin ke papan klip',
  
  // New Settings Keys
  success: 'Berjaya',
  shareSuccess: 'Aplikasi berjaya dikongsi',
  shareError: 'Gagal mengongsi aplikasi',
  cantOpenStore: 'Tidak dapat membuka kedai',
  noEmailApp: 'Tiada aplikasi emel tersedia',
  contactError: 'Gagal membuka emel',
  exportSuccess: 'Data berjaya dieksport',
  exportError: 'Gagal mengeksport data',
  resetError: 'Gagal mereset data',
  cantOpenLink: 'Tidak dapat membuka pautan',
  reset: 'Reset',
  
  // Color Theme Names
  teal: 'Hijau kebiruan',
  rose: 'Mawar',
  
  // Appearance Settings
  customizeAppearance: 'Sesuaikan penampilan',
  selectColorTheme: 'Pilih tema warna',
  display: 'Paparan',
  animations: 'Animasi',
  enableAnimations: 'Aktifkan animasi dan peralihan',
  typography: 'Tipografi',
  fontSize: 'Saiz Fon',
  small: 'Kecil',
  medium: 'Sederhana',
  large: 'Besar',
  performance: 'Prestasi',
  reducedMotion: 'Pergerakan Berkurangan',
  reduceAnimationsForBetterPerformance: 'Kurangkan animasi untuk prestasi yang lebih baik',
  darkMode: 'Mod Gelap',
  enableDarkMode: 'Aktifkan mod gelap',
  
  // Favorites
  favorites: 'Kegemaran',
  
  // Authentication
  signIn: 'Log Masuk',
  signInWithGoogle: 'Log Masuk dengan Google',
  signOut: 'Log Keluar',
  signedInAs: 'Log masuk sebagai',
  account: 'Akaun',
  signInToContinue: 'Log masuk untuk meneruskan',
  signInDescription: 'Log masuk untuk menyegerakkan data anda di semua peranti',
  welcomeBack: 'Selamat kembali',
  notSignedIn: 'Belum log masuk',
  continueAsGuest: 'Teruskan sebagai tetamu',
  
  // Ad Translations
  discoverIslamicApps: 'Temui Aplikasi Islam',
  learnMore: 'Ketahui Lebih Lanjut',
  premiumIslamicContent: 'Kandungan Islam Premium',
  explore: 'Terokai',
  islamicEducation: 'Pendidikan Islam',
  upgradeToPremium: 'Naik taraf ke Premium',
  upgrade: 'Naik taraf',
  joinCommunity: 'Sertai Komuniti Muslim Global',
  join: 'Sertai Sekarang',
  quranRecitation: 'Dengar Quran oleh Qari Terkenal',
  listen: 'Dengar Sekarang',
  discover: 'Temui',
  prayerTimesApp: 'Aplikasi Waktu Solat',
  download: 'Muat Turun',
  islamicBooks: 'Buku-buku Islam',
  browse: 'Layari',
  islamicCourses: 'Kursus Islam',
  enroll: 'Daftar',
  hajjUmrahGuide: 'Panduan Haji & Umrah',
  viewGuide: 'Lihat Panduan',
  
  // Welcome Screen
  welcomeTitle1: 'Subbah: Aplikasi Tasbih Islam',
  welcomeDesc1: 'Kira zikir dan adhkar anda dalam suasana rohani yang tenang',
  welcomeTitle2: 'Koleksi Zikir Lengkap',
  welcomeDesc2: 'Zikir pagi, petang dan selepas solat dibuat mudah',
  welcomeTitle3: 'Mulakan Perjalanan Rohani Anda',
  welcomeDesc3: 'Mulakan perjalanan zikir anda dan kongsi berkat dengan orang tersayang',
  getStarted: 'Mula',
  skip: 'Langkau',
  continueWithoutAccount: 'Teruskan tanpa akaun',
  
  // Statistics Screen
  totalDhikr: 'Jumlah Zikir',
  streakDays: 'Hari Berturut-turut',
  sessions: 'Sesi Selesai',
  dailyProgress: 'Kemajuan Harian',
  dailyGoal: 'Sasaran Harian',
  completedDhikr: 'Zikir Selesai',
  quickStats: 'Statistik Pantas',
  days: 'hari',
  totalTarget: 'Sasaran Keseluruhan',
  favoritedhikr: 'Zikir Kegemaran',
  completedTimes: 'Selesai',
  times: 'kali',
  dhikrDetails: 'Butiran Zikir',
};

// Bengali translations
const bn: TranslationKeys = {
  // App Info
  appName: 'সাব্বাহ: ইসলামিক তাসবিহ অ্যাপ',
  appDescription: 'ডিজিটাল ইসলামিক জিকির ও তাসবিহ অ্যাপ্লিকেশন',
  
  // Navigation
  adhkar: 'আজকার',
  statistics: 'পরিসংখ্যান',
  tasbih: 'তাসবিহ',
  settings: 'সেটিংস',
  
  // Adhkar Screen
  morningAdhkar: 'সকালের আজকার',
  eveningAdhkar: 'সন্ধ্যার আজকার',
  afterPrayerAdhkar: 'নামাজের পর আজকার',
  sleepAdhkar: 'ঘুমের আজকার',
  wakeupAdhkar: 'ঘুম থেকে জাগ্রত হওয়ার আজকার',
  
  // Settings Screen
  language: 'ভাষা',
  vibration: 'কম্পন',
  notifications: 'বিজ্ঞপ্তি',
  theme: 'থিম',
  about: 'সম্পর্কে',
  contactUs: 'যোগাযোগ',
  shareApp: 'অ্যাপ শেয়ার',
  rateApp: 'অ্যাপ রেটিং',
  privacy: 'গোপনীয়তা নীতি',
  terms: 'ব্যবহারের শর্তাবলী',
  version: 'সংস্করণ',
  // Settings Sections
  customizeApp: 'আপনার অ্যাপ কাস্টমাইজ করুন',
  appearance: 'দেখাত',
  interaction: 'ইন্টারঅ্যাকশন',
  
  // Categories
  general: 'সাধারণ',
  morning: 'সকাল',
  evening: 'সন্ধ্যা',
  afterPrayer: 'নামাজের পর',
  
  // Common
  ok: 'ঠিক আছে',
  cancel: 'বাতিল',
  save: 'সংরক্ষণ',
  close: 'বন্ধ',
  share: 'শেয়ার',
  loading: 'লোড হচ্ছে...',
  error: 'ত্রুটি',
  retry: 'আবার চেষ্টা',
  
  // Dhikr translations
  subhanAllah: 'সুবহানাল্লাহ',
  alhamdulillah: 'আলহামদুলিল্লাহ',
  allahuAkbar: 'আল্লাহু আকবার',
  laIlahaIllallah: 'লা ইলাহা ইল্লাল্লাহ',
  astaghfirullah: 'আস্তাগফিরুল্লাহ',
  
  // Adhkar Screen Additional
  categories: 'বিভাগ',
  allAdhkar: 'সব আজকার',
  duas: 'দোয়া',
  quran: 'কুরআন',
  readingModeActive: 'পড়ার মোড সক্রিয়',
  tapToRead: 'পড়তে এবং গণনা করতে ট্যাপ করুন',
  noAdhkarInCategory: 'এই বিভাগে কোন আজকার নেই',
  tryAnotherCategory: 'অন্য বিভাগ চেষ্টা করুন',
  loadingAdhkar: 'আজকার লোড হচ্ছে...',
  pleaseTryAgain: 'অনুগ্রহ করে আবার চেষ্টা করুন',
  
  // Tasbih Screen Additional
  today: 'আজ',
  total: 'মোট',
  completed: 'সম্পন্ন',
  tapToCount: 'গণনা করতে ট্যাপ করুন',
  streak: 'ধারাবাহিক',
  resetCounter: 'কাউন্টার রিসেট',
  resetCounterConfirm: 'আপনি কি "{{dhikr}}" কাউন্���ার রিসেট করতে চান?',
  resetAllCounters: 'সব কাউন্টার রিসেট',
  resetAllCountersConfirm: 'আপনি কি সব কাউন্টার রিসেট করতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
  resetAll: 'সব রিসেট',
  resetStats: 'পরিসংখ্যান মুছুন',
  resetStatsConfirm: 'আপনি কি সব পরিসংখ্যান মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
  statsResetSuccess: 'পরিসংখ্যান সফলভাবে মুছে ফেলা হয়েছে',
  dailyStats: 'দৈনিক গণনার পরিসংখ্যান',
  add: 'যোগ করুন',
  addNewTasbih: 'নতুন তাসবিহ যোগ করুন',
  arabicText: 'আরবি টেক্সট',
  arabicTextPlaceholder: 'উদাহরণ: سُبْحَانَ اللَّهِ',
  transliteration: 'প্রতিবর্ণীকরণ',
  transliterationPlaceholder: 'উদাহরণ: Subhan Allah',
  translation: 'অনুবাদ',
  translationPlaceholder: 'উদাহরণ: সুবহানাল্লাহ',
  targetCount: 'লক্ষ্য সংখ্যা',
  color: 'রঙ',
  pleaseEnterArabicText: 'অনুগ্রহ করে আরবি টেক্সট লিখুন',
  noTasbihAvailable: 'কোন তাসবিহ আইটেম উপলব্ধ নেই',
  
  // Messages
  dhikrCompleted: 'জিকির সম্পন্ন! আল্লাহ আপনাকে বরকত দিন',
  shareMessage: 'ইসলামিক জিকির ও তাসবিহের জন্য সাব্বাহ অ্যাপ ব্যবহার করুন',
  contactMessage: 'আসসালামু আলাইকুম, সাব্বাহ অ্যাপ সম্পর্কে যোগাযোগ করতে চাই',
  continue: 'চালিয়ে যান',
  
  // Additional Settings Keys
  back: 'ফিরে যান',
  appSettings: 'অ্যাপ সেটিংস',
  myProfile: 'আমার প্রোফাইল',
  saved: 'সংরক্ষিত',
  newGroup: 'নতুন গ্রুপ',
  contacts: 'পরিচিতি',
  calls: 'কল',
  savedMessages: 'সংরক্ষিত বার্তা',
  inviteFriends: 'বন্ধুদের আমন্ত্রণ',
  telegramFeatures: 'টেলিগ্রাম বৈশিষ্ট্য',
  darkModeEnabled: 'ডার্ক মোড সক্রিয়',
  lightModeEnabled: 'লাইট মোড সক্রিয়',
  vibrationOnTap: 'কাউন্টার ট্যাপে কম্পন',
  soundOnInteraction: 'ইন্টারঅ্যাকশনে শব্দ চালান',
  dailyReminders: 'জিকিরের জন্য দৈনিক অনুস্মারক',
  colorTheme: 'রঙের থিম',
  blue: 'নীল',
  green: 'সবুজ',
  purple: 'বেগুনি',
  gold: 'সোনালী',
  adSettings: 'বিজ্ঞাপন সেটিংস',
  bannerAds: 'ব্যানার বিজ্ঞাপন',
  showBannerAds: 'স্ক্রিনের নিচে বিজ্ঞাপন দেখান',
  interstitialAds: 'ইন্টারস্টিশিয়াল বিজ্ঞাপন',
  showEvery: 'প্রতি',
  clicks: 'ক্লিকে',
  remaining: 'বাকি',
  adFrequency: 'ইন্টারস্টিশিয়াল বিজ্ঞাপনের ফ্রিকোয়েন্সি',
  contactSupport: 'যোগাযোগ ও সহায়তা',
  rateAppDescription: 'স্টোরে আপনার রেটিং দিয়ে আমাদের সাহায্য করুন',
  shareAppDescription: 'বন্ধুদের সাথে অ্যাপ শেয়ার করুন',
  contactUsDescription: 'হোয়াটসঅ্যাপের মাধ্যমে যোগাযোগ',
  whatsappSupport: 'হোয়াটসঅ্যাপ সহায়তা',
  whatsappSupportDescription: 'হোয়াটসঅ্যাপের মাধ্যমে সরাসরি যোগাযোগ',
  whatsappNotInstalled: 'হোয়াটসঅ্যাপ ইনস্টল করা নেই',
  openInBrowser: 'ব্রাউজারে খুলুন',
  cantOpenWhatsApp: 'হোয়াটসঅ্যাপ খুলতে ব্যর্থ',
  whatsappMessage: 'হ্যালো, আমি আপনার সাথে যোগাযোগ করতে চাই',
  whatsappError: 'হোয়াটসঅ্যাপ খুলতে ব্যর্থ',
  contactUsWhatsApp: 'হোয়াটসঅ্যাপের মাধ্যমে সরাসরি যোগাযোগ',
  watchAdToUnlock: 'রঙের থিম আনলক করতে বিজ্ঞাপন দেখুন',
  
  // Audio Settings
  selectReciter: 'কারী নির্বাচন করুন',
  reciter: 'কারী',
  changeVoice: 'কণ্ঠ পরিবর্তন করুন',
  viewPrivacyPolicy: 'গোপনীয়তা নীতি দেখুন',
  viewTerms: 'ব্যবহারের শর্তাবলী',
  dataManagement: 'ডেটা ব্যবস্থাপনা',
  exportData: 'ডেটা এক্সপোর্ট',
  exportDataDescription: 'আপনার ডেটার একটি ব্যাকআপ সংরক্ষণ করুন',
  resetSettings: 'সেটিংস রিসেট',
  resetSettingsDescription: 'ডিফল্ট সেটিংস পুনরুদ্ধার করুন',
  resetSettingsConfirm: 'আপনি কি ডিফল্ট সেটিংস পুনরুদ্ধার করতে চান?',
  resetButton: 'রিসেট',
  deleteAllData: 'সব ডেটা মুছুন',
  deleteAllDataDescription: 'সব ডেটা স্থায়ীভাবে মুছে ফেলুন',
  resetData: 'ডেটা রিসেট',
  resetDataConfirm: 'আপনি কি নিশ্চিত যে সব ডেটা মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
  delete: 'মুছুন',
  done: 'সম্পন্ন',
  dataResetSuccess: 'সব ডেটা সফলভাবে মুছে ফেলা হয়েছে',
  exportFailed: 'ডেটা এক্সপোর্ট ব্যর্থ',
  settingsResetSuccess: 'সেটিংস সফলভাবে রিসেট হয়েছে',
  sound: 'শব্দ',
  default: 'ডিফল্ট',
  copiedToClipboard: 'ক্লিপবোর্ডে কপি করা হয়েছে',
  
  // New Settings Keys
  success: 'সফল',
  shareSuccess: 'অ্যাপ সফলভাবে শেয়ার হয়েছে',
  shareError: 'অ্যাপ শেয়ার করতে ব্যর্থ',
  cantOpenStore: 'স্টোর খুলতে পারছে না',
  noEmailApp: 'কোন ইমেইল অ্যাপ উপলব্ধ নেই',
  contactError: 'ইমেইল খুলতে ব্যর্থ',
  exportSuccess: 'ডেটা সফলভাবে এক্সপোর্ট হয়েছে',
  exportError: 'ডেটা এক্সপোর্ট করতে ব্যর্থ',
  resetError: 'ডেটা রিসেট করতে ব্যর্থ',
  cantOpenLink: 'লিংক খুলতে পারছে না',
  reset: 'রিসেট',
  
  // Color Theme Names
  teal: 'টিল',
  rose: 'গোলাপী',
  
  // Appearance Settings
  customizeAppearance: 'চেহারা কাস্টমাইজ করুন',
  selectColorTheme: 'রঙের থিম নির্বাচন করুন',
  display: 'প্রদর্শন',
  animations: 'অ্যানিমেশন',
  enableAnimations: 'অ্যানিমেশন এবং ট্রানজিশন সক্রিয় করুন',
  typography: 'টাইপোগ্রাফি',
  fontSize: 'ফন্টের আকার',
  small: 'ছোট',
  medium: 'মাঝারি',
  large: 'বড়',
  performance: 'পারফরম্যান্স',
  reducedMotion: 'কম গতি',
  reduceAnimationsForBetterPerformance: 'ভাল পারফরম্যান্সের জন্য অ্যানিমেশন কমান',
  darkMode: 'ডার্ক মোড',
  enableDarkMode: 'ডার্ক মোড সক্রিয় করুন',
  
  // Favorites
  favorites: 'প্রিয়',
  
  // Authentication
  signIn: 'সাইন ইন',
  signInWithGoogle: 'Google দিয়ে সাইন ইন',
  signOut: 'সাইন আউট',
  signedInAs: 'সাইন ইন করা হয়েছে',
  account: 'অ্যাকাউন্ট',
  signInToContinue: 'চালিয়ে যেতে সাইন ইন করুন',
  signInDescription: 'সমস্ত ডিভাইসে আপনার ডেটা সিঙ্ক করতে সাইন ইন করুন',
  welcomeBack: 'আবার স্বাগতম',
  notSignedIn: 'সাইন ইন করা নেই',
  continueAsGuest: 'অতিথি হিসেবে চালিয়ে যান',
  
  // Ad Translations
  discoverIslamicApps: 'ইসলামিক অ্যাপ আবিষ্কার করুন',
  learnMore: 'আরও জানুন',
  premiumIslamicContent: 'প্রিমিয়াম ইসলামিক কন্টেন্ট',
  explore: 'অন্বেষণ করুন',
  islamicEducation: 'ইসলামিক শিক্ষা',
  upgradeToPremium: 'প্রিমিয়ামে আপগ্রেড করুন',
  upgrade: 'আপগ্রেড',
  joinCommunity: 'বৈশ্বিক মুসলিম সম্প্রদায়ে যোগ দিন',
  join: 'এখনই যোগ দিন',
  quranRecitation: 'বিখ্যাত কারীদের দ্বারা কুরআন শুনুন',
  listen: 'এখনই শুনুন',
  discover: 'আবিষ্কার করুন',
  prayerTimesApp: 'নামাজের সময় অ্যাপ',
  download: 'ডাউনলোড',
  islamicBooks: 'ইসলামিক বই',
  browse: 'ব্রাউজ করুন',
  islamicCourses: 'ইসলামিক কোর্স',
  enroll: 'নথিভুক্ত করুন',
  hajjUmrahGuide: 'হজ্জ ও উমরাহ গাইড',
  viewGuide: 'গাইড দেখুন',
  
  // Welcome Screen
  welcomeTitle1: 'Subbah: ইসলামিক তাসবিহ অ্যাপ',
  welcomeDesc1: 'শান্তিপূর্ণ দেবভক্তি পরিবেশে আপনার জিকির ও আজকার গণনা করুন',
  welcomeTitle2: 'সম্পূর্ণ আজকারের সংগ্রহ',
  welcomeDesc2: 'সকাল, সন্ধ্যা এবং নামাজের পর আজকার সহজ করা হয়েছে',
  welcomeTitle3: 'আপনার দেবভক্তি যাত্রা শুরু করুন',
  welcomeDesc3: 'আপনার জিকিরের যাত্রা শুরু করুন এবং প্রিয়জনদের সাথে বরকত শেয়ার করুন',
  getStarted: 'শুরু করুন',
  skip: 'এড়িয়ে যান',
  continueWithoutAccount: 'অ্যাকাউন্ট ছাড়া চালিয়ে যান',
  
  // Statistics Screen
  totalDhikr: 'মোট জিকির',
  streakDays: 'ধারাবাহিক দিন',
  sessions: 'সম্পন্ন সেশন',
  dailyProgress: 'দৈনিক অগ্রগতি',
  dailyGoal: 'দৈনিক লক্ষ্য',
  completedDhikr: 'সম্পন্ন জিকির',
  quickStats: 'দ্রুত পরিসংখ্যান',
  days: 'দিন',
  totalTarget: 'মোট লক্ষ্য',
  favoritedhikr: 'প্রিয় জিকির',
  completedTimes: 'সম্পন্ন',
  times: 'বার',
  dhikrDetails: 'জিকিরের বিবরণ',
};

// Setup i18n
const i18n = new I18n({
  ar,
  en,
  fr,
  es,
  ur,
  id,
  tr,
  ms,
  bn,
});

// Set the locale once at the beginning of your app
// Safely handle potential undefined locale
try {
  const deviceLocale = Localization.getLocales()[0]?.languageTag || 'en-US';
  i18n.locale = deviceLocale;
} catch (error) {
  console.error('Error setting initial locale:', error);
  i18n.locale = 'en-US';
}

// When a value is missing from a language it'll fallback to another language with the key present
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Export the configured i18n instance
export default i18n;

// Helper function to get current language
export const getCurrentLanguage = () => {
  try {
    const locale = i18n.locale || 'en-US';
    if (typeof locale !== 'string') {
      console.error('Invalid locale type:', typeof locale, locale);
      return 'en';
    }
    
    if (locale.startsWith('ar')) return 'ar';
    if (locale.startsWith('ur')) return 'ur';
    if (locale.startsWith('fr')) return 'fr';
    if (locale.startsWith('es')) return 'es';
    if (locale.startsWith('id')) return 'id';
    if (locale.startsWith('tr')) return 'tr';
    if (locale.startsWith('ms')) return 'ms';
    if (locale.startsWith('bn')) return 'bn';
    return 'en';
  } catch (error) {
    console.error('Error getting current language:', error);
    return 'en';
  }
};

// Helper function to check if current language is RTL
export const isRTL = () => {
  try {
    const lang = getCurrentLanguage();
    return ['ar', 'ur'].includes(lang);
  } catch (error) {
    console.error('Error checking RTL:', error);
    return false;
  }
};

// Available languages for language picker
export const AVAILABLE_LANGUAGES = [
  { code: 'ar', name: 'العربية', nativeName: 'العربية' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'Français', nativeName: 'Français' },
  { code: 'es', name: 'Español', nativeName: 'Español' },
  { code: 'ur', name: 'اردو', nativeName: 'اردو' },
  { code: 'id', name: 'Bahasa Indonesia', nativeName: 'Bahasa Indonesia' },
  { code: 'tr', name: 'Türkçe', nativeName: 'Türkçe' },
  { code: 'ms', name: 'Bahasa Melayu', nativeName: 'Bahasa Melayu' },
  { code: 'bn', name: 'বাংলা', nativeName: 'বাংলা' },
];