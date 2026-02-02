import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export type ReciterId = 'sudais' | 'shuraim' | 'alafasy' | 'maher' | 'husary';

export interface TTSOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  voice?: string;
}

type ExpoVoice = {
  identifier?: string;
  name?: string;
  quality?: number | string;
  language?: string;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const BASE_PRESETS: Record<ReciterId, TTSOptions> = {
  sudais: { language: 'ar-SA', pitch: 0.95, rate: 0.42 },
  shuraim: { language: 'ar-SA', pitch: 1.0, rate: 0.44 },
  alafasy: { language: 'ar-SA', pitch: 1.03, rate: 0.46 },
  maher: { language: 'ar-SA', pitch: 0.98, rate: 0.40 },
  husary: { language: 'ar-SA', pitch: 1.02, rate: 0.43 },
};

// Quran recitation URLs for famous reciters
const QURAN_RECITATION_URLS: Record<ReciterId, Record<number, string>> = {
  sudais: {
    78: 'https://server8.mp3quran.net/sudais/078.mp3',
    79: 'https://server8.mp3quran.net/sudais/079.mp3',
    80: 'https://server8.mp3quran.net/sudais/080.mp3',
    81: 'https://server8.mp3quran.net/sudais/081.mp3',
    82: 'https://server8.mp3quran.net/sudais/082.mp3',
    83: 'https://server8.mp3quran.net/sudais/083.mp3',
    84: 'https://server8.mp3quran.net/sudais/084.mp3',
    85: 'https://server8.mp3quran.net/sudais/085.mp3',
    86: 'https://server8.mp3quran.net/sudais/086.mp3',
    87: 'https://server8.mp3quran.net/sudais/087.mp3',
    88: 'https://server8.mp3quran.net/sudais/088.mp3',
    89: 'https://server8.mp3quran.net/sudais/089.mp3',
    90: 'https://server8.mp3quran.net/sudais/090.mp3',
    91: 'https://server8.mp3quran.net/sudais/091.mp3',
    92: 'https://server8.mp3quran.net/sudais/092.mp3',
    93: 'https://server8.mp3quran.net/sudais/093.mp3',
    94: 'https://server8.mp3quran.net/sudais/094.mp3',
    95: 'https://server8.mp3quran.net/sudais/095.mp3',
    96: 'https://server8.mp3quran.net/sudais/096.mp3',
    97: 'https://server8.mp3quran.net/sudais/097.mp3',
    98: 'https://server8.mp3quran.net/sudais/098.mp3',
    99: 'https://server8.mp3quran.net/sudais/099.mp3',
    100: 'https://server8.mp3quran.net/sudais/100.mp3',
    101: 'https://server8.mp3quran.net/sudais/101.mp3',
    102: 'https://server8.mp3quran.net/sudais/102.mp3',
    103: 'https://server8.mp3quran.net/sudais/103.mp3',
    104: 'https://server8.mp3quran.net/sudais/104.mp3',
    105: 'https://server8.mp3quran.net/sudais/105.mp3',
    106: 'https://server8.mp3quran.net/sudais/106.mp3',
    107: 'https://server8.mp3quran.net/sudais/107.mp3',
    108: 'https://server8.mp3quran.net/sudais/108.mp3',
    109: 'https://server8.mp3quran.net/sudais/109.mp3',
    110: 'https://server8.mp3quran.net/sudais/110.mp3',
    111: 'https://server8.mp3quran.net/sudais/111.mp3',
    112: 'https://server8.mp3quran.net/sudais/112.mp3',
    113: 'https://server8.mp3quran.net/sudais/113.mp3',
    114: 'https://server8.mp3quran.net/sudais/114.mp3',
  },
  shuraim: {
    78: 'https://server8.mp3quran.net/shur/078.mp3',
    79: 'https://server8.mp3quran.net/shur/079.mp3',
    80: 'https://server8.mp3quran.net/shur/080.mp3',
    81: 'https://server8.mp3quran.net/shur/081.mp3',
    82: 'https://server8.mp3quran.net/shur/082.mp3',
    83: 'https://server8.mp3quran.net/shur/083.mp3',
    84: 'https://server8.mp3quran.net/shur/084.mp3',
    85: 'https://server8.mp3quran.net/shur/085.mp3',
    86: 'https://server8.mp3quran.net/shur/086.mp3',
    87: 'https://server8.mp3quran.net/shur/087.mp3',
    88: 'https://server8.mp3quran.net/shur/088.mp3',
    89: 'https://server8.mp3quran.net/shur/089.mp3',
    90: 'https://server8.mp3quran.net/shur/090.mp3',
    91: 'https://server8.mp3quran.net/shur/091.mp3',
    92: 'https://server8.mp3quran.net/shur/092.mp3',
    93: 'https://server8.mp3quran.net/shur/093.mp3',
    94: 'https://server8.mp3quran.net/shur/094.mp3',
    95: 'https://server8.mp3quran.net/shur/095.mp3',
    96: 'https://server8.mp3quran.net/shur/096.mp3',
    97: 'https://server8.mp3quran.net/shur/097.mp3',
    98: 'https://server8.mp3quran.net/shur/098.mp3',
    99: 'https://server8.mp3quran.net/shur/099.mp3',
    100: 'https://server8.mp3quran.net/shur/100.mp3',
    101: 'https://server8.mp3quran.net/shur/101.mp3',
    102: 'https://server8.mp3quran.net/shur/102.mp3',
    103: 'https://server8.mp3quran.net/shur/103.mp3',
    104: 'https://server8.mp3quran.net/shur/104.mp3',
    105: 'https://server8.mp3quran.net/shur/105.mp3',
    106: 'https://server8.mp3quran.net/shur/106.mp3',
    107: 'https://server8.mp3quran.net/shur/107.mp3',
    108: 'https://server8.mp3quran.net/shur/108.mp3',
    109: 'https://server8.mp3quran.net/shur/109.mp3',
    110: 'https://server8.mp3quran.net/shur/110.mp3',
    111: 'https://server8.mp3quran.net/shur/111.mp3',
    112: 'https://server8.mp3quran.net/shur/112.mp3',
    113: 'https://server8.mp3quran.net/shur/113.mp3',
    114: 'https://server8.mp3quran.net/shur/114.mp3',
  },
  alafasy: {
    78: 'https://server8.mp3quran.net/alafasy/078.mp3',
    79: 'https://server8.mp3quran.net/alafasy/079.mp3',
    80: 'https://server8.mp3quran.net/alafasy/080.mp3',
    81: 'https://server8.mp3quran.net/alafasy/081.mp3',
    82: 'https://server8.mp3quran.net/alafasy/082.mp3',
    83: 'https://server8.mp3quran.net/alafasy/083.mp3',
    84: 'https://server8.mp3quran.net/alafasy/084.mp3',
    85: 'https://server8.mp3quran.net/alafasy/085.mp3',
    86: 'https://server8.mp3quran.net/alafasy/086.mp3',
    87: 'https://server8.mp3quran.net/alafasy/087.mp3',
    88: 'https://server8.mp3quran.net/alafasy/088.mp3',
    89: 'https://server8.mp3quran.net/alafasy/089.mp3',
    90: 'https://server8.mp3quran.net/alafasy/090.mp3',
    91: 'https://server8.mp3quran.net/alafasy/091.mp3',
    92: 'https://server8.mp3quran.net/alafasy/092.mp3',
    93: 'https://server8.mp3quran.net/alafasy/093.mp3',
    94: 'https://server8.mp3quran.net/alafasy/094.mp3',
    95: 'https://server8.mp3quran.net/alafasy/095.mp3',
    96: 'https://server8.mp3quran.net/alafasy/096.mp3',
    97: 'https://server8.mp3quran.net/alafasy/097.mp3',
    98: 'https://server8.mp3quran.net/alafasy/098.mp3',
    99: 'https://server8.mp3quran.net/alafasy/099.mp3',
    100: 'https://server8.mp3quran.net/alafasy/100.mp3',
    101: 'https://server8.mp3quran.net/alafasy/101.mp3',
    102: 'https://server8.mp3quran.net/alafasy/102.mp3',
    103: 'https://server8.mp3quran.net/alafasy/103.mp3',
    104: 'https://server8.mp3quran.net/alafasy/104.mp3',
    105: 'https://server8.mp3quran.net/alafasy/105.mp3',
    106: 'https://server8.mp3quran.net/alafasy/106.mp3',
    107: 'https://server8.mp3quran.net/alafasy/107.mp3',
    108: 'https://server8.mp3quran.net/alafasy/108.mp3',
    109: 'https://server8.mp3quran.net/alafasy/109.mp3',
    110: 'https://server8.mp3quran.net/alafasy/110.mp3',
    111: 'https://server8.mp3quran.net/alafasy/111.mp3',
    112: 'https://server8.mp3quran.net/alafasy/112.mp3',
    113: 'https://server8.mp3quran.net/alafasy/113.mp3',
    114: 'https://server8.mp3quran.net/alafasy/114.mp3',
  },
  maher: {
    78: 'https://server11.mp3quran.net/maher/078.mp3',
    79: 'https://server11.mp3quran.net/maher/079.mp3',
    80: 'https://server11.mp3quran.net/maher/080.mp3',
    81: 'https://server11.mp3quran.net/maher/081.mp3',
    82: 'https://server11.mp3quran.net/maher/082.mp3',
    83: 'https://server11.mp3quran.net/maher/083.mp3',
    84: 'https://server11.mp3quran.net/maher/084.mp3',
    85: 'https://server11.mp3quran.net/maher/085.mp3',
    86: 'https://server11.mp3quran.net/maher/086.mp3',
    87: 'https://server11.mp3quran.net/maher/087.mp3',
    88: 'https://server11.mp3quran.net/maher/088.mp3',
    89: 'https://server11.mp3quran.net/maher/089.mp3',
    90: 'https://server11.mp3quran.net/maher/090.mp3',
    91: 'https://server11.mp3quran.net/maher/091.mp3',
    92: 'https://server11.mp3quran.net/maher/092.mp3',
    93: 'https://server11.mp3quran.net/maher/093.mp3',
    94: 'https://server11.mp3quran.net/maher/094.mp3',
    95: 'https://server11.mp3quran.net/maher/095.mp3',
    96: 'https://server11.mp3quran.net/maher/096.mp3',
    97: 'https://server11.mp3quran.net/maher/097.mp3',
    98: 'https://server11.mp3quran.net/maher/098.mp3',
    99: 'https://server11.mp3quran.net/maher/099.mp3',
    100: 'https://server11.mp3quran.net/maher/100.mp3',
    101: 'https://server11.mp3quran.net/maher/101.mp3',
    102: 'https://server11.mp3quran.net/maher/102.mp3',
    103: 'https://server11.mp3quran.net/maher/103.mp3',
    104: 'https://server11.mp3quran.net/maher/104.mp3',
    105: 'https://server11.mp3quran.net/maher/105.mp3',
    106: 'https://server11.mp3quran.net/maher/106.mp3',
    107: 'https://server11.mp3quran.net/maher/107.mp3',
    108: 'https://server11.mp3quran.net/maher/108.mp3',
    109: 'https://server11.mp3quran.net/maher/109.mp3',
    110: 'https://server11.mp3quran.net/maher/110.mp3',
    111: 'https://server11.mp3quran.net/maher/111.mp3',
    112: 'https://server11.mp3quran.net/maher/112.mp3',
    113: 'https://server11.mp3quran.net/maher/113.mp3',
    114: 'https://server11.mp3quran.net/maher/114.mp3',
  },
  husary: {
    78: 'https://server6.mp3quran.net/husary/078.mp3',
    79: 'https://server6.mp3quran.net/husary/079.mp3',
    80: 'https://server6.mp3quran.net/husary/080.mp3',
    81: 'https://server6.mp3quran.net/husary/081.mp3',
    82: 'https://server6.mp3quran.net/husary/082.mp3',
    83: 'https://server6.mp3quran.net/husary/083.mp3',
    84: 'https://server6.mp3quran.net/husary/084.mp3',
    85: 'https://server6.mp3quran.net/husary/085.mp3',
    86: 'https://server6.mp3quran.net/husary/086.mp3',
    87: 'https://server6.mp3quran.net/husary/087.mp3',
    88: 'https://server6.mp3quran.net/husary/088.mp3',
    89: 'https://server6.mp3quran.net/husary/089.mp3',
    90: 'https://server6.mp3quran.net/husary/090.mp3',
    91: 'https://server6.mp3quran.net/husary/091.mp3',
    92: 'https://server6.mp3quran.net/husary/092.mp3',
    93: 'https://server6.mp3quran.net/husary/093.mp3',
    94: 'https://server6.mp3quran.net/husary/094.mp3',
    95: 'https://server6.mp3quran.net/husary/095.mp3',
    96: 'https://server6.mp3quran.net/husary/096.mp3',
    97: 'https://server6.mp3quran.net/husary/097.mp3',
    98: 'https://server6.mp3quran.net/husary/098.mp3',
    99: 'https://server6.mp3quran.net/husary/099.mp3',
    100: 'https://server6.mp3quran.net/husary/100.mp3',
    101: 'https://server6.mp3quran.net/husary/101.mp3',
    102: 'https://server6.mp3quran.net/husary/102.mp3',
    103: 'https://server6.mp3quran.net/husary/103.mp3',
    104: 'https://server6.mp3quran.net/husary/104.mp3',
    105: 'https://server6.mp3quran.net/husary/105.mp3',
    106: 'https://server6.mp3quran.net/husary/106.mp3',
    107: 'https://server6.mp3quran.net/husary/107.mp3',
    108: 'https://server6.mp3quran.net/husary/108.mp3',
    109: 'https://server6.mp3quran.net/husary/109.mp3',
    110: 'https://server6.mp3quran.net/husary/110.mp3',
    111: 'https://server6.mp3quran.net/husary/111.mp3',
    112: 'https://server6.mp3quran.net/husary/112.mp3',
    113: 'https://server6.mp3quran.net/husary/113.mp3',
    114: 'https://server6.mp3quran.net/husary/114.mp3',
  },
};

// Reciter names in Arabic
export const RECITER_NAMES: Record<ReciterId, string> = {
  sudais: 'عبد الرحمن السديس',
  shuraim: 'سعود الشريم',
  alafasy: 'مشاري العفاسي',
  maher: 'ماهر المعيقلي',
  husary: 'محمود خليل الحصري',
};

class TTSService {
  private currentReciter: ReciterId = 'alafasy';
  private isPlaying: boolean = false;
  private currentText: string = '';
  private playbackQueue: string[] = [];
  private isProcessingQueue: boolean = false;
  private voices: ExpoVoice[] = [];
  private isVoicesLoaded: boolean = false;

  constructor() {}

  async ensureVoicesLoaded(): Promise<void> {
    try {
      if (this.isVoicesLoaded) return;
      const available = (await (Speech as any).getAvailableVoicesAsync?.()) as ExpoVoice[] | undefined;
      this.voices = Array.isArray(available) ? available : [];

      if (this.voices.length === 0 && Platform.OS === 'web') {
        const synth = (globalThis as any)?.speechSynthesis;
        const webVoices = Array.isArray(synth?.getVoices?.()) ? synth.getVoices() : [];
        const mapped = webVoices.map((v: any) => ({ name: v.name as string, language: (v.lang as string) ?? undefined } as ExpoVoice));
        this.voices = mapped.length > 0 ? mapped : this.voices;
      }

      this.isVoicesLoaded = true;
      console.log(`[TTS] Loaded voices: ${this.voices.length}`);
    } catch (e) {
      console.log('[TTS] Failed to load voices, will use defaults');
      this.voices = [];
      this.isVoicesLoaded = true;
    }
  }

  setReciter(reciter: ReciterId) {
    console.log(`[TTS] Setting reciter to: ${reciter}`);
    this.currentReciter = reciter;
  }

  getCurrentReciter(): ReciterId {
    return this.currentReciter;
  }

  private pickArabicVoice(reciter: ReciterId): string | undefined {
    const prefNamesByReciter: Record<ReciterId, string[]> = {
      sudais: ['Majed', 'Maged', 'Tariq', 'Naayf', 'Hamed', 'ar-XA-Standard-A', 'ar-SA', 'Arabic', 'العربية', 'Google العربية'],
      shuraim: ['Tariq', 'Majed', 'Maged', 'Hoda', 'ar-XA-Standard-B', 'ar-SA', 'Arabic', 'العربية', 'Google العربية'],
      alafasy: ['Maged', 'Majed', 'Tariq', 'Naayf', 'ar-XA-Standard-C', 'ar-SA', 'Arabic', 'العربية', 'Google العربية'],
      maher: ['Majed', 'Maged', 'Tariq', 'ar-XA-Standard-D', 'ar-SA', 'Arabic', 'العربية', 'Google العربية'],
      husary: ['Tariq', 'Majed', 'Maged', 'ar-XA-Standard-E', 'ar-SA', 'Arabic', 'العربية', 'Google العربية'],
    };

    const arVoices = this.voices.filter(v => {
      const lang = (v.language ?? '').toLowerCase();
      const name = (v.name ?? '').toLowerCase();
      return lang.startsWith('ar') || name.includes('arabic') || name.includes('العربية');
    });

    const prefs = prefNamesByReciter[reciter];

    for (const pref of prefs) {
      const found = arVoices.find(v => `${v.identifier ?? ''} ${v.name ?? ''}`.includes(pref));
      if (found?.identifier || found?.name) return (found.identifier as string) ?? (found.name as string);
    }

    const fallback = arVoices[0];
    return (fallback?.identifier as string) ?? (fallback?.name as string) ?? undefined;
  }

  private platformAdjustedOptions(base: TTSOptions, reciter: ReciterId): TTSOptions {
    const language = 'ar-SA';
    const voice = this.pickArabicVoice(reciter);

    if (Platform.OS === 'ios') {
      return {
        language,
        voice,
        rate: clamp(base.rate ?? 0.45, 0.35, 0.55),
        pitch: clamp(base.pitch ?? 1.0, 0.85, 1.15),
      };
    }

    if (Platform.OS === 'android') {
      return {
        language,
        voice,
        rate: clamp((base.rate ?? 0.48) * 0.95, 0.35, 0.6),
        pitch: clamp(base.pitch ?? 1.0, 0.9, 1.15),
      };
    }

    return {
      language,
      voice,
      rate: clamp((base.rate ?? 0.5) * 0.9, 0.35, 0.6),
      pitch: clamp(base.pitch ?? 1.0, 0.9, 1.08),
    };
  }

  private async speakOnce(text: string, baseOptions: TTSOptions): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.ensureVoicesLoaded();
        const options = this.platformAdjustedOptions(baseOptions, this.currentReciter) as any;
        (Speech as any).speak(text, {
          ...options,
          onDone: () => resolve(),
          onStopped: () => resolve(),
          onError: (e: unknown) => reject(e),
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  private splitIntoPhrases(text: string): string[] {
    try {
      const normalized = this.preprocessArabicText(text);

      const parts = normalized
        .split(/(\،|\.|\!|\?|\؛|\:|\—|\-|\(|\)|\[|\]|\{|\}|\n|\r|\u06D6|\u06D7|\u06D8|\u06D9|\u06DA|\u06DB|\u06DC|\u06DD|\u06DE|\u06DF|\u06E0|\u06E2|\u06E3|\u06E5|\u06E6)/g)
        .reduce<string[]>((acc, cur) => {
          if (/^(\،|\.|\!|\?|\؛|\:|\—|\-|\(|\)|\[|\]|\{|\}|\n|\r|\u06D6|\u06D7|\u06D8|\u06D9|\u06DA|\u06DB|\u06DC|\u06DD|\u06DE|\u06DF|\u06E0|\u06E2|\u06E3|\u06E5|\u06E6)$/.test(cur)) {
            if (acc.length > 0) acc[acc.length - 1] = `${acc[acc.length - 1]}${cur}`;
          } else if (cur && cur.trim().length > 0) {
            acc.push(cur.trim());
          }
          return acc;
        }, [])
        .map(s => s.replace(/\s+/g, ' ').trim())
        .filter(s => s.length > 0);

      const merged: string[] = [];
      let buffer = '';
      const maxLen = 100;
      parts.forEach((p, i) => {
        const candidate = buffer ? `${buffer} ${p}` : p;
        if (candidate.length <= maxLen) {
          buffer = candidate;
        } else {
          if (buffer) merged.push(buffer);
          buffer = p;
        }
        if (i === parts.length - 1 && buffer) {
          merged.push(buffer);
          buffer = '';
        }
      });

      return merged.length > 0 ? merged : [normalized];
    } catch (e) {
      console.log('[TTS] splitIntoPhrases error', e);
      return [text];
    }
  }

  async speak(text: string): Promise<void> {
    try {
      if (this.isPlaying) {
        await this.stop();
      }

      const base = BASE_PRESETS[this.currentReciter];
      const phrases = this.splitIntoPhrases(text);

      console.log(`[TTS] Speaking (${phrases.length} segments) with ${this.currentReciter}`);

      this.isPlaying = true;
      this.currentText = text;

      for (let i = 0; i < phrases.length; i++) {
        if (!this.isPlaying) break;
        const seg = phrases[i];
        console.log(`[TTS] Segment ${i + 1}/${phrases.length}: ${seg.substring(0, 50)}...`);
        await this.speakOnce(seg, base);
        if (i < phrases.length - 1) {
          await new Promise(r => setTimeout(r, 700));
        }
      }

      this.isPlaying = false;
      this.currentText = '';
      console.log('[TTS] Speech completed');
    } catch (error) {
      console.error('[TTS] Speech error:', error);
      this.isPlaying = false;
      this.currentText = '';
      throw error;
    }
  }

  async speakMultiple(texts: string[], delayBetween: number = 1400): Promise<void> {
    try {
      console.log(`[TTS] Speaking multiple texts: ${texts.length} items`);
      this.playbackQueue = [...texts];
      this.isProcessingQueue = true;

      for (let i = 0; i < texts.length; i++) {
        if (!this.isProcessingQueue) {
          console.log('[TTS] Queue processing stopped');
          break;
        }
        console.log(`[TTS] Speaking item ${i + 1}/${texts.length}`);
        await this.speak(texts[i]);
        if (i < texts.length - 1 && this.isProcessingQueue) {
          await new Promise(resolve => setTimeout(resolve, delayBetween));
        }
      }

      this.isProcessingQueue = false;
      this.playbackQueue = [];
      console.log('[TTS] Multiple speech completed');
    } catch (error) {
      console.error('[TTS] Multiple speech error:', error);
      this.isProcessingQueue = false;
      this.playbackQueue = [];
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      console.log('[TTS] Stopping speech');
      (Speech as any).stop();
      this.isPlaying = false;
      this.currentText = '';
      this.isProcessingQueue = false;
      this.playbackQueue = [];
      console.log('[TTS] Speech stopped');
    } catch (error) {
      console.error('[TTS] Stop error:', error);
      throw error;
    }
  }

  async pause(): Promise<void> {
    try {
      console.log('[TTS] Pausing speech');
      await this.stop();
    } catch (error) {
      console.error('[TTS] Pause error:', error);
      throw error;
    }
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentText(): string {
    return this.currentText;
  }

  isQueueProcessing(): boolean {
    return this.isProcessingQueue;
  }

  getQueueLength(): number {
    return this.playbackQueue.length;
  }

  private preprocessArabicText(text: string): string {
    try {
      let processedText = text ?? '';

      processedText = processedText.replace(/[ــ]+/g, '');
      processedText = processedText.replace(/[\u064B-\u0652]/g, '');

      processedText = processedText
        .replace(/,\s?/g, '، ')
        .replace(/;/g, '؛')
        .replace(/\s*\.\s*/g, '. ')
        .replace(/\?/g, '؟');

      processedText = processedText
        .replace(/\s+و\s+/g, ' و ')
        .replace(/\bثم\s+/g, 'ثم، ')
        .replace(/\bاللهم\s+/g, 'اللَّهُمَّ، ');

      const commonWords: Record<string, string> = {
        'الله': 'اللَّه',
        'اللهم': 'اللَّهُمَّ',
        'سبحان': 'سُبْحَان',
        'استغفر': 'أَسْتَغْفِر',
        'اكبر': 'أَكْبَر',
        'الاكبر': 'الأَكْبَر',
        'لا اله الا الله': 'لَا إِلَهَ إِلَّا اللَّه',
        'محمد': 'مُحَمَّد',
        'رسول': 'رَسُول',
        'صلى': 'صَلَّى',
        'عليه': 'عَلَيْه',
        'وسلم': 'وَسَلَّم',
        'السلام': 'السَّلَام',
        'ومنك': 'وَمِنْك',
        'تباركت': 'تَبَارَكْت',
        'الجلال': 'الْجَلَال',
        'والاكرام': 'وَالإِكْرَام',
        'انت': 'أَنْت',
        'وحده': 'وَحْدَه',
        'شريك': 'شَرِيك',
        'الملك': 'الْمُلْك',
        'قدير': 'قَدِير',
        'يغفر': 'يَغْفِر',
        'الذنوب': 'الذُّنُوب',
      };

      Object.entries(commonWords).forEach(([word, vocalized]) => {
        const regex = new RegExp(`${word}`, 'g');
        processedText = processedText.replace(regex, vocalized);
      });

      processedText = processedText.replace(/\s+/g, ' ').trim();

      console.log(`[TTS] Preprocessed text: ${processedText}`);
      return processedText;
    } catch (error) {
      console.error('[TTS] Text preprocessing error:', error);
      return text;
    }
  }

  async getAvailableVoices(): Promise<ExpoVoice[]> {
    try {
      await this.ensureVoicesLoaded();
      return this.voices.filter(v => (v.language ?? '').toLowerCase().startsWith('ar'));
    } catch (error) {
      console.error('[TTS] Get voices error:', error);
      return [];
    }
  }

  async playDhikr(arabicText: string, reciter?: ReciterId): Promise<void> {
    try {
      if (reciter) {
        this.setReciter(reciter);
      }
      console.log(`[TTS] Playing dhikr with ${this.currentReciter}`);
      await this.speak(arabicText);
    } catch (error) {
      console.error('[TTS] Play dhikr error:', error);
      throw error;
    }
  }

  async playAdhkarCategory(adhkarTexts: string[], reciter?: ReciterId): Promise<void> {
    try {
      if (reciter) {
        this.setReciter(reciter);
      }
      console.log(`[TTS] Playing adhkar category with ${this.currentReciter}: ${adhkarTexts.length} items`);
      await this.speakMultiple(adhkarTexts, 1700);
    } catch (error) {
      console.error('[TTS] Play adhkar category error:', error);
      throw error;
    }
  }

  getQuranRecitationUrl(surahNumber: number, reciter?: ReciterId): string | null {
    const selectedReciter = reciter || this.currentReciter;
    const url = QURAN_RECITATION_URLS[selectedReciter]?.[surahNumber];
    console.log(`[TTS] Getting Quran URL for surah ${surahNumber} with ${selectedReciter}: ${url}`);
    return url || null;
  }

  getAvailableReciters(): { id: ReciterId; name: string }[] {
    return Object.entries(RECITER_NAMES).map(([id, name]) => ({
      id: id as ReciterId,
      name,
    }));
  }
}

export const ttsService = new TTSService();

export const playDhikr = (text: string, reciter?: ReciterId) =>
  ttsService.playDhikr(text, reciter);

export const playAdhkarCategory = (texts: string[], reciter?: ReciterId) =>
  ttsService.playAdhkarCategory(texts, reciter);

export const stopTTS = () => ttsService.stop();

export const setTTSReciter = (reciter: ReciterId) => ttsService.setReciter(reciter);

export const isTTSPlaying = () => ttsService.isCurrentlyPlaying();

export const getQuranRecitationUrl = (surahNumber: number, reciter?: ReciterId) =>
  ttsService.getQuranRecitationUrl(surahNumber, reciter);

export const getAvailableReciters = () => ttsService.getAvailableReciters();
