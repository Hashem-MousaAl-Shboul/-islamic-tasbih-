import { Platform } from 'react-native';
import { ttsService } from '@/utils/ttsService';

// YasAI - مكتبة الذكاء الاصطناعي للتلاوة والأذكار
export interface YasAIConfig {
  language: 'ar-SA' | 'ar-EG' | 'ar-MA';
  voice: 'sudais' | 'shuraim' | 'alafasy' | 'tts';
  speed: number; // 0.5 - 2.0
  pitch: number; // 0.5 - 2.0
  volume: number; // 0.0 - 1.0
  preferredQuality: 'low' | 'medium' | 'high';
}

export interface ReciterVoice {
  id: string;
  name: string;
  nameArabic: string;
  description: string;
  language: string;
  quality: 'high' | 'medium' | 'low';
}

export interface AudioSource {
  url: string;
  quality: 'high' | 'medium' | 'low';
  format: 'mp3' | 'wav' | 'ogg';
  size?: number; // size in KB if known
}

export interface DhikrAudio {
  id: string;
  text: string;
  category: string;
  sources: Record<string, AudioSource[]>; // reciter -> sources
  duration?: number;
}

// قائمة المقرئين المتاحين
export const AVAILABLE_RECITERS: ReciterVoice[] = [
  {
    id: 'sudais',
    name: 'Abdul Rahman Al-Sudais',
    nameArabic: 'عبد الرحمن السديس',
    description: 'إمام الحرم المكي الشريف',
    language: 'ar-SA',
    quality: 'high'
  },
  {
    id: 'shuraim',
    name: 'Saud Al-Shuraim',
    nameArabic: 'سعود الشريم',
    description: 'إمام الحرم المكي الشريف',
    language: 'ar-SA',
    quality: 'high'
  },
  // ملاحظة: تمت إزالة مشاري راشد من قوائم الاختيار داخل الواجهات لتقليل الالتباس وحجم الملفات
];

// مصادر الصوت الحقيقية للأذكار
export const DHIKR_AUDIO_LIBRARY: Record<string, DhikrAudio> = {
  // آية الكرسي
  'ayat-kursi': {
    id: 'ayat-kursi',
    text: 'آية الكرسي',
    category: 'morning',
    duration: 150,
    sources: {
      sudais: [
        {
          url: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_32kbps/002255.mp3',
          quality: 'low',
          format: 'mp3',
          size: 1024
        },
        {
          url: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_64kbps/002255.mp3',
          quality: 'high',
          format: 'mp3',
          size: 2048
        }
      ],
      shuraim: [
        {
          url: 'https://everyayah.com/data/Saood_ash-Shuraym_32kbps/002255.mp3',
          quality: 'low',
          format: 'mp3',
          size: 1024
        },
        {
          url: 'https://everyayah.com/data/Saood_ash-Shuraym_64kbps/002255.mp3',
          quality: 'high',
          format: 'mp3',
          size: 2048
        }
      ],
      alafasy: [
        {
          url: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_32kbps/002255.mp3',
          quality: 'low',
          format: 'mp3',
          size: 1024
        },
        {
          url: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_64kbps/002255.mp3',
          quality: 'high',
          format: 'mp3',
          size: 2048
        }
      ]
    }
  },
  
  // أذكار الصباح الكاملة
  'morning-complete': {
    id: 'morning-complete',
    text: 'أذكار الصباح كاملة',
    category: 'morning',
    duration: 900, // 15 دقيقة
    sources: {
      alafasy: [
        {
          url: 'https://ia801504.us.archive.org/35/items/MorningAdhkarAlafasy/Morning_Adhkar_Alafasy.mp3',
          quality: 'high',
          format: 'mp3',
          size: 14336
        },
        {
          url: 'https://download.quranicaudio.com/adhkar/morning/alafasy_morning_adhkar.mp3',
          quality: 'high',
          format: 'mp3',
          size: 14336
        }
      ],
      sudais: [
        {
          url: 'https://ia801504.us.archive.org/35/items/MorningAdhkarSudais/Morning_Adhkar_Sudais.mp3',
          quality: 'high',
          format: 'mp3',
          size: 14336
        }
      ],
      shuraim: [
        {
          url: 'https://ia801504.us.archive.org/35/items/MorningAdhkarShuraim/Morning_Adhkar_Shuraim.mp3',
          quality: 'high',
          format: 'mp3',
          size: 14336
        }
      ]
    }
  },
  
  // أذكار المساء الكاملة
  'evening-complete': {
    id: 'evening-complete',
    text: 'أذكار المساء كاملة',
    category: 'evening',
    duration: 900, // 15 دقيقة
    sources: {
      alafasy: [
        {
          url: 'https://ia801504.us.archive.org/35/items/EveningAdhkarAlafasy/Evening_Adhkar_Alafasy.mp3',
          quality: 'high',
          format: 'mp3',
          size: 14336
        },
        {
          url: 'https://download.quranicaudio.com/adhkar/evening/alafasy_evening_adhkar.mp3',
          quality: 'high',
          format: 'mp3',
          size: 14336
        }
      ],
      sudais: [
        {
          url: 'https://ia801504.us.archive.org/35/items/EveningAdhkarSudais/Evening_Adhkar_Sudais.mp3',
          quality: 'high',
          format: 'mp3',
          size: 14336
        }
      ],
      shuraim: [
        {
          url: 'https://ia801504.us.archive.org/35/items/EveningAdhkarShuraim/Evening_Adhkar_Shuraim.mp3',
          quality: 'high',
          format: 'mp3',
          size: 14336
        }
      ]
    }
  },
  
  // أذكار بعد الصلاة الكاملة
  'after-prayer-complete': {
    id: 'after-prayer-complete',
    text: 'أذكار بعد الصلاة كاملة',
    category: 'after-prayer',
    duration: 600, // 10 دقائق
    sources: {
      alafasy: [
        {
          url: 'https://ia801504.us.archive.org/35/items/AfterPrayerAdhkarAlafasy/After_Prayer_Adhkar_Alafasy.mp3',
          quality: 'high',
          format: 'mp3',
          size: 9600
        },
        {
          url: 'https://download.quranicaudio.com/adhkar/after-prayer/alafasy_after_prayer_adhkar.mp3',
          quality: 'high',
          format: 'mp3',
          size: 9600
        }
      ],
      sudais: [
        {
          url: 'https://ia801504.us.archive.org/35/items/AfterPrayerAdhkarSudais/After_Prayer_Adhkar_Sudais.mp3',
          quality: 'high',
          format: 'mp3',
          size: 9600
        }
      ],
      shuraim: [
        {
          url: 'https://ia801504.us.archive.org/35/items/AfterPrayerAdhkarShuraim/After_Prayer_Adhkar_Shuraim.mp3',
          quality: 'high',
          format: 'mp3',
          size: 9600
        }
      ]
    }
  },

  // أدعية عامة مرتبطة بتلاوة القرآن
  'dua-1': {
    id: 'dua-1',
    text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً',
    category: 'duas',
    duration: 6,
    sources: {
      sudais: [
        { url: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_32kbps/002201.mp3', quality: 'low', format: 'mp3', size: 48 },
        { url: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_64kbps/002201.mp3', quality: 'high', format: 'mp3', size: 96 }
      ],
      shuraim: [
        { url: 'https://everyayah.com/data/Saood_ash-Shuraym_32kbps/002201.mp3', quality: 'low', format: 'mp3', size: 48 },
        { url: 'https://everyayah.com/data/Saood_ash-Shuraym_64kbps/002201.mp3', quality: 'high', format: 'mp3', size: 96 }
      ],
      alafasy: [
        { url: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_32kbps/002201.mp3', quality: 'low', format: 'mp3', size: 48 },
        { url: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_64kbps/002201.mp3', quality: 'high', format: 'mp3', size: 96 }
      ]
    }
  },
  'dua-2': {
    id: 'dua-2',
    text: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ',
    category: 'duas',
    duration: 6,
    sources: {
      sudais: [
        { url: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_32kbps/014041.mp3', quality: 'low', format: 'mp3', size: 48 },
        { url: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_64kbps/014041.mp3', quality: 'high', format: 'mp3', size: 96 }
      ],
      shuraim: [
        { url: 'https://everyayah.com/data/Saood_ash-Shuraym_32kbps/014041.mp3', quality: 'low', format: 'mp3', size: 48 },
        { url: 'https://everyayah.com/data/Saood_ash-Shuraym_64kbps/014041.mp3', quality: 'high', format: 'mp3', size: 96 }
      ],
      alafasy: [
        { url: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_32kbps/014041.mp3', quality: 'low', format: 'mp3', size: 48 },
        { url: 'https://everyayah.com/data/Mishary_Rashid_Alafasy_64kbps/014041.mp3', quality: 'high', format: 'mp3', size: 96 }
      ]
    }
  },
  
  // سبحان الله
  'subhan-allah': {
    id: 'subhan-allah',
    text: 'سبحان الله',
    category: 'general',
    duration: 3,
    sources: {
      alafasy: [
        {
          url: 'https://download.quranicaudio.com/adhkar/individual/alafasy_subhan_allah.mp3',
          quality: 'high',
          format: 'mp3',
          size: 48
        }
      ],
      sudais: [
        {
          url: 'https://download.quranicaudio.com/adhkar/individual/sudais_subhan_allah.mp3',
          quality: 'high',
          format: 'mp3',
          size: 48
        }
      ],
      shuraim: [
        {
          url: 'https://download.quranicaudio.com/adhkar/individual/shuraim_subhan_allah.mp3',
          quality: 'high',
          format: 'mp3',
          size: 48
        }
      ]
    }
  },
  
  // الحمد لله
  'alhamdulillah': {
    id: 'alhamdulillah',
    text: 'الحمد لله',
    category: 'general',
    duration: 3,
    sources: {
      alafasy: [
        {
          url: 'https://download.quranicaudio.com/adhkar/individual/alafasy_alhamdulillah.mp3',
          quality: 'high',
          format: 'mp3',
          size: 48
        }
      ],
      sudais: [
        {
          url: 'https://download.quranicaudio.com/adhkar/individual/sudais_alhamdulillah.mp3',
          quality: 'high',
          format: 'mp3',
          size: 48
        }
      ],
      shuraim: [
        {
          url: 'https://download.quranicaudio.com/adhkar/individual/shuraim_alhamdulillah.mp3',
          quality: 'high',
          format: 'mp3',
          size: 48
        }
      ]
    }
  },
  
  // الله أكبر
  'allahu-akbar': {
    id: 'allahu-akbar',
    text: 'الله أكبر',
    category: 'general',
    duration: 3,
    sources: {
      alafasy: [
        {
          url: 'https://download.quranicaudio.com/adhkar/individual/alafasy_allahu_akbar.mp3',
          quality: 'high',
          format: 'mp3',
          size: 48
        }
      ],
      sudais: [
        {
          url: 'https://download.quranicaudio.com/adhkar/individual/sudais_allahu_akbar.mp3',
          quality: 'high',
          format: 'mp3',
          size: 48
        }
      ],
      shuraim: [
        {
          url: 'https://download.quranicaudio.com/adhkar/individual/shuraim_allahu_akbar.mp3',
          quality: 'high',
          format: 'mp3',
          size: 48
        }
      ]
    }
  }
};

// فئة YasAI الرئيسية
type PlaybackListener = (state: { isPlaying: boolean; currentId: string | null }) => void;

export class YasAI {
  private config: YasAIConfig;
  private currentSound: any | null = null;
  private currentSoundListener: { remove: () => void } | null = null;
  private webAudio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private currentId: string | null = null;
  private listeners: Set<PlaybackListener> = new Set();
  
  constructor(config: Partial<YasAIConfig> = {}) {
    this.config = {
      language: 'ar-SA',
      voice: 'sudais',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      preferredQuality: 'low',
      ...config
    };
  }
  
  // تحديث الإعدادات
  updateConfig(newConfig: Partial<YasAIConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
  
  // الحصول على الإعدادات الحالية
  getConfig(): YasAIConfig {
    return { ...this.config };
  }
  
  // تشغيل ذكر معين
  async playDhikr(dhikrId: string, reciterId?: string): Promise<boolean> {
    try {
      const reciter = reciterId || this.config.voice;
      const dhikrAudio = DHIKR_AUDIO_LIBRARY[dhikrId];
      
      if (!dhikrAudio) {
        console.log(`[YasAI] Dhikr not found: ${dhikrId}`);
        return false;
      }
      
      const sources = this.orderSourcesByPreference(dhikrAudio.sources[reciter] ?? []);
      if (!sources || sources.length === 0) {
        console.log(`[YasAI] No audio sources for ${dhikrId} with reciter ${reciter}`);
        // fallback to lightweight TTS of the title/text
        return await this.playTTS(dhikrAudio.text, 1);
      }
      
      // إيقاف التشغيل الحالي
      await this.stop();
      
      this.currentId = dhikrId;
      
      if (Platform.OS === 'web') {
        const ok = await this.playWebAudio(sources);
        if (!ok) {
          return await this.playTTS(dhikrAudio.text, 1);
        }
        return ok;
      } else {
        const ok = await this.playNativeAudio(sources);
        if (!ok) {
          return await this.playTTS(dhikrAudio.text, 1);
        }
        return ok;
      }
    } catch (error) {
      console.error('[YasAI] Error playing dhikr:', error);
      return false;
    }
  }
  
  // محاولة مطابقة النص إلى معرف ذكر معروف
  private resolveDhikrIdFromText(text: string): string | null {
    const normalized = text.replace(/\s+/g, ' ').trim();
    const heuristics: Array<{ id: string; test: (t: string) => boolean }> = [
      { id: 'ayat-kursi', test: (t) => t.includes('اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ') || t.includes('البقرة: 255') },
      { id: 'dua-1', test: (t) => t.includes('رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً') },
      { id: 'dua-2', test: (t) => t.includes('رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ') },
    ];
    for (const h of heuristics) {
      if (h.test(normalized)) return h.id;
    }
    const match = Object.values(DHIKR_AUDIO_LIBRARY).find(
      (dh) => dh.text.includes(normalized) || normalized.includes(dh.text)
    );
    return match?.id ?? null;
  }

  // تشغيل نص باستخدام تفضيل MP3 ثم TTS كحل احتياطي
  async playText(text: string, options?: { reciter?: string; repeat?: number }): Promise<boolean> {
    try {
      const reciter = options?.reciter || this.config.voice;
      const repeat = options?.repeat || 1;

      if (reciter === 'tts') {
        return await this.playTTS(text, repeat);
      }

      const resolvedId = this.resolveDhikrIdFromText(text);
      if (resolvedId) {
        const ok = await this.playDhikr(resolvedId, reciter);
        if (ok) return true;
      }

      console.log('[YasAI] No MP3 match or failed to play. Falling back to TTS.');
      return await this.playTTS(text, repeat);
    } catch (error) {
      console.error('[YasAI] Error playing text:', error);
      return false;
    }
  }
  
  // تشغيل مجموعة أذكار (مثل أذكار الصباح كاملة)
  async playCategory(category: 'morning' | 'evening' | 'after-prayer', reciterId?: string): Promise<boolean> {
    try {
      const reciter = reciterId || this.config.voice;
      const categoryId = `${category}-complete`;
      const ok = await this.playDhikr(categoryId, reciter);
      if (ok) return true;
      const fallbackText = category === 'morning' ? 'أذكار الصباح' : category === 'evening' ? 'أذكار المساء' : 'أذكار بعد الصلاة';
      return await this.playTTS(fallbackText, 1);
    } catch (error) {
      console.error('[YasAI] Error playing category:', error);
      return false;
    }
  }
  
  addListener(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const state = this.getPlaybackState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (e) {
        console.error('[YasAI] Listener error:', e);
      }
    });
  }

  async stop(): Promise<void> {
    try {
      this.isPlaying = false;
      this.currentId = null;
      
      if (Platform.OS === 'web' && this.webAudio) {
        this.webAudio.pause();
        this.webAudio.currentTime = 0;
        this.webAudio = null;
      } else if (this.currentSound) {
        try {
          if (this.currentSoundListener) {
            this.currentSoundListener.remove();
            this.currentSoundListener = null;
          }
          this.currentSound.pause?.();
          this.currentSound.release?.();
        } catch (e) {
          console.log('[YasAI] stop/release failed:', e);
        }
        this.currentSound = null;
      }
      
      this.notifyListeners();
    } catch (error) {
      console.error('[YasAI] Error stopping audio:', error);
    }
  }
  
  // إيقاف مؤقت/استئناف
  async pause(): Promise<void> {
    try {
      if (Platform.OS === 'web' && this.webAudio) {
        if (this.isPlaying) {
          this.webAudio.pause();
          this.isPlaying = false;
        } else {
          await this.webAudio.play();
          this.isPlaying = true;
        }
      } else if (this.currentSound) {
        try {
          if (this.currentSound.playing) {
            this.currentSound.pause?.();
            this.isPlaying = false;
          } else {
            this.currentSound.play?.();
            this.isPlaying = true;
          }
        } catch (e) {
          console.log('[YasAI] pause/play toggle failed:', e);
        }
      }
    } catch (error) {
      console.error('[YasAI] Error pausing/resuming audio:', error);
    }
  }
  
  // الحصول على حالة التشغيل
  getPlaybackState(): { isPlaying: boolean; currentId: string | null } {
    return {
      isPlaying: this.isPlaying,
      currentId: this.currentId
    };
  }
  
  // ترتيب المصادر وفق تفضيل الجودة والحجم
  private orderSourcesByPreference(sources: AudioSource[]): AudioSource[] {
    const qualityRank: Record<'low'|'medium'|'high', number> = { low: 0, medium: 1, high: 2 };
    const preferred = this.config.preferredQuality;

    const sizeLimitKB = preferred === 'low' ? 2500 : preferred === 'medium' ? 7000 : Number.POSITIVE_INFINITY;
    const filtered = sources.filter((s) => (s.size ?? Number.POSITIVE_INFINITY) <= sizeLimitKB);

    if (filtered.length === 0) {
      return [];
    }

    return [...filtered].sort((a, b) => {
      const qa = Math.abs(qualityRank[a.quality] - qualityRank[preferred]);
      const qb = Math.abs(qualityRank[b.quality] - qualityRank[preferred]);
      if (qa !== qb) return qa - qb;
      const sa = a.size ?? Number.POSITIVE_INFINITY;
      const sb = b.size ?? Number.POSITIVE_INFINITY;
      return sa - sb;
    });
  }

  // تشغيل الصوت على الويب
  private async playWebAudio(sources: AudioSource[]): Promise<boolean> {
    const AudioCtor = (globalThis as any).Audio ?? (typeof window !== 'undefined' ? (window as any).Audio : undefined);
    if (!AudioCtor) {
      console.log('[YasAI] HTML5 Audio not available');
      return false;
    }
    
    for (const source of sources) {
      try {
        const audio = new AudioCtor();
        audio.crossOrigin = 'anonymous';
        audio.preload = 'auto';
        audio.volume = this.config.volume;
        audio.src = source.url;
        
        audio.onended = () => {
          this.isPlaying = false;
          this.currentId = null;
          this.notifyListeners();
        };
        
        audio.onerror = () => {
          this.isPlaying = false;
          this.currentId = null;
          this.notifyListeners();
        };
        
        this.webAudio = audio;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          await playPromise;
        }
        this.isPlaying = true;
        this.notifyListeners();
        return true;
      } catch (error) {
        console.log('[YasAI] Failed to play web audio source:', source.url, error);
        continue;
      }
    }
    
    return false;
  }
  
  // تشغيل الصوت على الجوال
  private async playNativeAudio(sources: AudioSource[]): Promise<boolean> {
    let audioMod: any = null;
    try {
      audioMod = await import('expo-audio');
    } catch (e) {
      console.log('[YasAI] expo-audio not available:', e);
      return false;
    }

    try {
      await audioMod.setAudioModeAsync({
        allowsRecording: false,
        shouldPlayInBackground: true,
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
        shouldRouteThroughEarpiece: false,
      });
    } catch (e) {
      console.log('[YasAI] setAudioModeAsync failed:', e);
    }
    
    for (const source of sources) {
      try {
        const player = audioMod.createAudioPlayer({ uri: source.url });
        player.volume = this.config.volume;
        player.playbackRate = this.config.speed;
        
        const listener = player.addListener('playbackStatusUpdate', (status: any) => {
          if (status && status.didJustFinish) {
            this.isPlaying = false;
            this.currentId = null;
            this.notifyListeners();
          }
        });
        
        this.currentSound = player;
        this.currentSoundListener = listener;
        this.isPlaying = true;
        this.notifyListeners();
        player.play();
        return true;
      } catch (error) {
        console.log('[YasAI] Failed to play native audio source:', source.url, error);
        continue;
      }
    }
    
    return false;
  }
  
  // تشغيل النص باستخدام TTS
  private async playTTS(text: string, repeat: number = 1): Promise<boolean> {
    try {
      this.isPlaying = true;
      this.currentId = `tts-${Date.now()}`;

      if (repeat > 1) {
        const arr = Array.from({ length: repeat }, () => text);
        await ttsService.speakMultiple(arr, 500);
      } else {
        await ttsService.playDhikr(text, 'sudais');
      }

      this.isPlaying = false;
      this.currentId = null;
      return true;
    } catch (error) {
      console.error('[YasAI] TTS Error:', error);
      this.isPlaying = false;
      this.currentId = null;
      return false;
    }
  }
  
  // الحصول على قائمة الأذكار المتاحة
  getAvailableDhikr(): DhikrAudio[] {
    return Object.values(DHIKR_AUDIO_LIBRARY);
  }
  
  // الحصول على قائمة المقرئين المتاحين
  getAvailableReciters(): ReciterVoice[] {
    return AVAILABLE_RECITERS;
  }
  
  // البحث في الأذكار
  searchDhikr(query: string): DhikrAudio[] {
    const lowerQuery = query.toLowerCase();
    return Object.values(DHIKR_AUDIO_LIBRARY).filter(
      dhikr => 
        dhikr.text.toLowerCase().includes(lowerQuery) ||
        dhikr.category.toLowerCase().includes(lowerQuery)
    );
  }
}

// إنشاء مثيل عام من YasAI
export const yasAI = new YasAI();

// دوال مساعدة
export const playDhikr = (dhikrId: string, reciterId?: string) => yasAI.playDhikr(dhikrId, reciterId);
export const playText = (text: string, options?: { reciter?: string; repeat?: number }) => yasAI.playText(text, options);
export const playCategory = (category: 'morning' | 'evening' | 'after-prayer', reciterId?: string) => yasAI.playCategory(category, reciterId);
export const stopAudio = () => yasAI.stop();
export const pauseAudio = () => yasAI.pause();
export const getPlaybackState = () => yasAI.getPlaybackState();

