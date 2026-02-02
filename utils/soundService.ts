import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class SoundService {
  private clickSound: Audio.Sound | null = null;
  private completionSound: Audio.Sound | null = null;
  private isLoaded: boolean = false;

  async initialize() {
    if (this.isLoaded || Platform.OS === 'web') return;
    
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      this.clickSound = new Audio.Sound();
      await this.clickSound.loadAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3' },
        { shouldPlay: false, volume: 0.5 }
      );

      this.completionSound = new Audio.Sound();
      await this.completionSound.loadAsync(
        { uri: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
        { shouldPlay: false, volume: 0.7 }
      );

      this.isLoaded = true;
      console.log('[SoundService] Sounds loaded successfully');
    } catch (error) {
      console.error('[SoundService] Error loading sounds:', error);
    }
  }

  async playClick() {
    if (Platform.OS === 'web') {
      try {
        const audio = new window.Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3');
        audio.volume = 0.5;
        await audio.play();
      } catch (error) {
        console.log('[SoundService] Web audio play error:', error);
      }
      return;
    }

    if (!this.isLoaded || !this.clickSound) {
      await this.initialize();
    }

    try {
      await this.clickSound?.replayAsync();
    } catch (error) {
      console.log('[SoundService] Click sound error:', error);
    }
  }

  async playCompletion() {
    if (Platform.OS === 'web') {
      try {
        const audio = new window.Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.7;
        await audio.play();
      } catch (error) {
        console.log('[SoundService] Web audio play error:', error);
      }
      return;
    }

    if (!this.isLoaded || !this.completionSound) {
      await this.initialize();
    }

    try {
      await this.completionSound?.replayAsync();
    } catch (error) {
      console.log('[SoundService] Completion sound error:', error);
    }
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
