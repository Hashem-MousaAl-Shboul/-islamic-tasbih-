import { Platform } from 'react-native';

let audioModule: any = null;

async function getAudio(): Promise<any> {
  if (audioModule) return audioModule;
  try {
    const mod = await import('expo-audio');
    audioModule = mod;
    return audioModule;
  } catch (e) {
    console.log('[SoundService] expo-audio not available:', e);
    return null;
  }
}

class SoundService {
  private clickPlayer: any | null = null;
  private completionPlayer: any | null = null;
  private isLoaded: boolean = false;

  private isInitializing: boolean = false;

  async initialize() {
    if (this.isLoaded || this.isInitializing || Platform.OS === 'web') return;
    this.isInitializing = true;

    try {
      const audio = await getAudio();
      if (!audio) {
        console.log('[SoundService] Audio module not available');
        return;
      }

      const audioModePromise = audio.setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'duckOthers',
        allowsRecording: false,
        shouldRouteThroughEarpiece: false,
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
    if (this.clickPlayer) return;
    try {
      const audio = await getAudio();
      if (!audio) return;
      this.clickPlayer = audio.createAudioPlayer(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3' }
      );
      this.clickPlayer.volume = 0.5;
    } catch (e) {
      console.log('[SoundService] Failed to load click sound:', e);
      this.clickPlayer = null;
    }
  }

  private async ensureCompletionSound(): Promise<void> {
    if (this.completionPlayer) return;
    try {
      const audio = await getAudio();
      if (!audio) return;
      this.completionPlayer = audio.createAudioPlayer(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' }
      );
      this.completionPlayer.volume = 0.7;
    } catch (e) {
      console.log('[SoundService] Failed to load completion sound:', e);
      this.completionPlayer = null;
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

    if (this.clickPlayer) {
      try {
        this.clickPlayer.seekTo(0);
        this.clickPlayer.play();
      } catch (error) {
        console.log('[SoundService] Click sound replay error:', error);
        this.clickPlayer = null;
      }
    } else {
      this.ensureClickSound().then(() => {
        try {
          this.clickPlayer?.seekTo(0);
          this.clickPlayer?.play();
        } catch {}
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

    if (this.completionPlayer) {
      try {
        this.completionPlayer.seekTo(0);
        this.completionPlayer.play();
      } catch (error) {
        console.log('[SoundService] Completion sound replay error:', error);
        this.completionPlayer = null;
      }
    } else {
      this.ensureCompletionSound().then(() => {
        try {
          this.completionPlayer?.seekTo(0);
          this.completionPlayer?.play();
        } catch {}
      }).catch(() => {});
    }
  }

  async playCompletion() {
    this.playCompletionSync();
  }

  async unload() {
    if (Platform.OS === 'web') return;

    try {
      if (this.clickPlayer) {
        try { this.clickPlayer.remove(); } catch {}
        this.clickPlayer = null;
      }
      if (this.completionPlayer) {
        try { this.completionPlayer.remove(); } catch {}
        this.completionPlayer = null;
      }
      this.isLoaded = false;
      console.log('[SoundService] Sounds unloaded');
    } catch (error) {
      console.error('[SoundService] Error unloading sounds:', error);
    }
  }
}

export const soundService = new SoundService();
