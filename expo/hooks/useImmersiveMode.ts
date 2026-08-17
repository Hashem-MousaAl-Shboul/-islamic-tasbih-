/**
 * useImmersiveMode — Activates Android Immersive Mode (sticky immersive).
 * Hides the system navigation bar so the app fills the entire screen.
 * The bar reappears temporarily when the user swipes from a screen edge,
 * then auto-hides again after a few seconds.
 *
 * No-op on iOS / web.
 */
import { useEffect, useRef } from 'react';
import { Platform, AppState, type AppStateStatus } from 'react-native';

type NavigationBarModule = typeof import('expo-navigation-bar');

let navigationBarModule: NavigationBarModule | null = null;
let loadPromise: Promise<NavigationBarModule | null> | null = null;

async function loadNavigationBar(): Promise<NavigationBarModule | null> {
  if (navigationBarModule) return navigationBarModule;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const mod = await import('expo-navigation-bar');
      navigationBarModule = mod;
      return mod;
    } catch (e) {
      console.log('[ImmersiveMode] expo-navigation-bar not available:', e);
      return null;
    }
  })();
  return loadPromise;
}

export function useImmersiveMode(): void {
  const listenerRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let cancelled = false;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const applyImmersive = async () => {
      const mod = await loadNavigationBar();
      if (!mod || cancelled) return;

      try {
        // Set behavior to overlay-swipe so the bar overlays content
        // instead of pushing it up, and appears on swipe.
        await mod.setBehaviorAsync('overlay-swipe');
        // Hide the navigation bar entirely.
        await mod.setVisibilityAsync('hidden');
      } catch (e) {
        console.log('[ImmersiveMode] Failed to apply immersive mode:', e);
      }
    };

    const setupListener = async () => {
      const mod = await loadNavigationBar();
      if (!mod || cancelled) return;

      // Remove any existing listener.
      if (listenerRef.current) {
        try { listenerRef.current.remove(); } catch {}
        listenerRef.current = null;
      }

      // Listen for visibility changes: when the user swipes from the edge,
      // the bar becomes "visible". We re-hide it after a short delay so the
      // user gets a moment to use the back/home/recents buttons, then it
      // disappears again automatically — classic "sticky immersive" behavior.
      const unsubscribe = mod.addVisibilityListener(({ visibility }) => {
        if (visibility === 'visible') {
          // Cancel any pending timer from a previous trigger.
          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }
          // Re-hide after 2.5 seconds — gives the user enough time to
          // interact with system buttons but keeps the UI clean otherwise.
          debounceTimer = setTimeout(() => {
            if (cancelled) return;
            mod.setVisibilityAsync('hidden').catch(() => {});
          }, 2500);
        }
      });

      listenerRef.current = unsubscribe;
    };

    void applyImmersive();
    void setupListener();

    // Re-apply immersive mode when the app returns to the foreground,
    // because Android resets system UI flags when an app is backgrounded.
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void applyImmersive();
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      cancelled = true;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      if (listenerRef.current) {
        try { listenerRef.current.remove(); } catch {}
        listenerRef.current = null;
      }
      appStateSubscription.remove();
    };
  }, []);
}
