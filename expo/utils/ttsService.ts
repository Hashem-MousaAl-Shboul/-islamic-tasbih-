import { Platform } from 'react-native';

let Speech: any = null;
let speechLoadAttempted = false;
let speechLoadRetries = 0;
const MAX_RETRIES = 3;

async function getSpeech(): Promise<any> {
  if (Speech) return Speech;
  if (speechLoadAttempted && speechLoadRetries >= MAX_RETRIES) return null;
  speechLoadAttempted = true;
  try {
    const mod = await import('expo-speech');
    Speech = mod.default || mod;
    console.log('[TTS] expo-speech loaded successfully');
    return Speech;
  } catch (e) {
    speechLoadRetries++;
    console.log(`[TTS] expo-speech not available (attempt ${speechLoadRetries}):`, e);
    return null;
  }
}

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

// Reciter server mapping for mp3quran.net — verified paths from the mp3quran.net API v3
const RECITER_SERVERS: Record<ReciterId, { server: string; path: string }> = {
  sudais:  { server: 'https://server11.mp3quran.net/sds',   path: 'sds'   },
  shuraim: { server: 'https://server7.mp3quran.net/shur',   path: 'shur'  },
  alafasy: { server: 'https://server8.mp3quran.net/afs',    path: 'afs'   },
  maher:   { server: 'https://server12.mp3quran.net/maher', path: 'maher' },
  husary:  { server: 'https://server13.mp3quran.net/husr',  path: 'husr'  },
};

/**
 * Generate a Quran recitation URL for any surah (1-114) and reciter.
 * Pattern: https://server{N}.mp3quran.net/{reciter}/{NNN}.mp3
 */
function generateRecitationUrl(surahNumber: number, reciter: ReciterId): string {
  const config = RECITER_SERVERS[reciter];
  if (!config) return '';
  const padded = String(surahNumber).padStart(3, '0');
  // Pattern: https://server{N}.mp3quran.net/{path}/{NNN}.mp3
  return `${config.server}/${padded}.mp3`;
}

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

  async ensureVoicesLoaded(): Promise<void> {
    try {
      const sp = await getSpeech();
      if (this.isVoicesLoaded || !sp) {
        this.isVoicesLoaded = true;
        return;
      }
      const available = (await sp.getAvailableVoicesAsync?.()) as ExpoVoice[] | undefined;
      this.voices = Array.isArray(available) ? available : [];

      if (this.voices.length === 0 && Platform.OS === 'web') {
        const synth = (globalThis as any)?.speechSynthesis;
        const webVoices = Array.isArray(synth?.getVoices?.()) ? synth.getVoices() : [];
        const mapped = webVoices.map((v: any) => ({ name: v.name as string, language: (v.lang as string) ?? undefined } as ExpoVoice));
        this.voices = mapped.length > 0 ? mapped : this.voices;
      }

      this.isVoicesLoaded = true;
      console.log(`[TTS] Loaded voices: ${this.voices.length}`);
    } catch {
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
    const sp = await getSpeech();
    if (!sp) {
      console.log('[TTS] Speech module not available, skipping');
      return;
    }
    return new Promise<void>((resolve, reject) => {
      try {
        const options = this.platformAdjustedOptions(baseOptions, this.currentReciter) as any;
        sp.speak(text, {
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

      const splitPattern = /(،|\.|!|\?|؛|:|—|-|\(|\)|\[|\]|\{|\}|\n|\r|\u06D6|\u06D7|\u06D8|\u06D9|\u06DA|\u06DB|\u06DC|\u06DD|\u06DE|\u06DF|\u06E0|\u06E2|\u06E3|\u06E5|\u06E6)/g;
      const parts = normalized
        .split(splitPattern)
        .reduce<string[]>((acc, cur) => {
          if (splitPattern.test(cur)) {
            splitPattern.lastIndex = 0;
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
    const sp = await getSpeech();
    if (!sp) {
      console.log('[TTS] Speech module not available');
      return;
    }
    try {
      if (this.isPlaying) {
        await this.stop();
      }

      await this.ensureVoicesLoaded();
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
      const sp = await getSpeech();
      sp?.stop?.();
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

      processedText = processedText
        .replace(/,\s?/g, '، ')
        .replace(/;/g, '؛')
        .replace(/\s*\.\s*/g, '. ')
        .replace(/\?/g, '؟');

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
      return this.voices.filter((v: ExpoVoice) => (v.language ?? '').toLowerCase().startsWith('ar'));
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
    if (surahNumber < 1 || surahNumber > 114) {
      console.log(`[TTS] Invalid surah number: ${surahNumber}`);
      return null;
    }
    const url = generateRecitationUrl(surahNumber, selectedReciter);
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
