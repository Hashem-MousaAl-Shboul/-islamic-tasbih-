import { Platform } from 'react-native';

let AudioModule: any = null;

async function getAudio(): Promise<any> {
  if (AudioModule) return AudioModule;
  try {
    const mod = await import('expo-av');
    AudioModule = mod.Audio;
    return AudioModule;
  } catch (e) {
    console.log('[SoundService] expo-av not available:', e);
    return null;
  }
}

class SoundService {
  private clickSound: any | null = null;
  private completionSound: any | null = null;
  private isLoaded: boolean = false;

  private isInitializing: boolean = false;

  async initialize() {
    if (this.isLoaded || this.isInitializing || Platform.OS === 'web') return;
    this.isInitializing = true;
    
    try {
      const Audio = await getAudio();
      if (!Audio) {
        console.log('[SoundService] Audio module not available');
        return;
      }

      const audioModePromise = Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log('[SoundService] setAudioModeAsync timed out, continuing');
          resolve();
        }, 3000);
      });

      await Promise.race([audioModePromise, timeoutPromise]);

      this.isLoaded = true;
      console.log('[SoundService] Audio mode set successfully');

      this.preloadSounds();
    } catch (error) {
      console.log('[SoundService] Error initializing audio (non-blocking):', error);
      this.isLoaded = true;
    } finally {
      this.isInitializing = false;
    }
  }

  private preloadSounds() {
    this.ensureClickSound().catch(e => console.log('[SoundService] Preload click failed:', e));
    this.ensureCompletionSound().catch(e => console.log('[SoundService] Preload completion failed:', e));
  }

  private async ensureClickSound(): Promise<void> {
    if (this.clickSound) return;
    try {
      const Audio = await getAudio();
      if (!Audio) return;
      this.clickSound = new Audio.Sound();
      await this.clickSound.loadAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3' },
        { shouldPlay: false, volume: 0.5 }
      );
    } catch (e) {
      console.log('[SoundService] Failed to load click sound:', e);
      this.clickSound = null;
    }
  }

  private async ensureCompletionSound(): Promise<void> {
    if (this.completionSound) return;
    try {
      const Audio = await getAudio();
      if (!Audio) return;
      this.completionSound = new Audio.Sound();
      await this.completionSound.loadAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
        { shouldPlay: false, volume: 0.7 }
      );
    } catch (e) {
      console.log('[SoundService] Failed to load completion sound:', e);
      this.completionSound = null;
    }
  }

  playClickSync() {
    if (Platform.OS === 'web') {
      try {
        const audio = new window.Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (error) {
        console.log('[SoundService] Web audio play error:', error);
      }
      return;
    }

    if (!this.isLoaded) return;

    if (this.clickSound) {
      this.clickSound.replayAsync().catch((error: unknown) => {
        console.log('[SoundService] Click sound replay error:', error);
        this.clickSound = null;
      });
    } else {
      this.ensureClickSound().then(() => {
        this.clickSound?.replayAsync().catch(() => {});
      }).catch(() => {});
    }
  }

  async playClick() {
    this.playClickSync();
  }

  playCompletionSync() {
    if (Platform.OS === 'web') {
      try {
        const audio = new window.Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.7;
        audio.play().catch(() => {});
      } catch (error) {
        console.log('[SoundService] Web audio play error:', error);
      }
      return;
    }

    if (!this.isLoaded) return;

    if (this.completionSound) {
      this.completionSound.replayAsync().catch((error: unknown) => {
        console.log('[SoundService] Completion sound replay error:', error);
        this.completionSound = null;
      });
    } else {
      this.ensureCompletionSound().then(() => {
        this.completionSound?.replayAsync().catch(() => {});
      }).catch(() => {});
    }
  }

  async playCompletion() {
    this.playCompletionSync();
  }

  async unload() {
    if (Platform.OS === 'web') return;

    try {
      if (this.clickSound) {
        await this.clickSound.unloadAsync();
        this.clickSound = null;
      }
      if (this.completionSound) {
        await this.completionSound.unloadAsync();
        this.completionSound = null;
      }
      this.isLoaded = false;
      console.log('[SoundService] Sounds unloaded');
    } catch (error) {
      console.error('[SoundService] Error unloading sounds:', error);
    }
  }
}

export const soundService = new SoundService();
