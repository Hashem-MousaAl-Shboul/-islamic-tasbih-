import { Platform } from 'react-native';

// ----------------------------------------------------------------------------
// Polyfill: requestIdleCallback (needed for older Android WebView / JS engines)
// ----------------------------------------------------------------------------
declare global {
  function requestIdleCallback(
    callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
    options?: { timeout: number }
  ): number;
  function cancelIdleCallback(id: number): void;
}

if (typeof requestIdleCallback === 'undefined') {
  (global as any).requestIdleCallback = (
    callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
    options?: { timeout: number }
  ) => {
    const start = Date.now();
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, options?.timeout || 1);
  };
}

if (typeof cancelIdleCallback === 'undefined') {
  (global as any).cancelIdleCallback = (id: number) => {
    clearTimeout(id);
  };
}

// ----------------------------------------------------------------------------
// Fix: Prevent "Detected multiple renderers concurrently rendering the same
// context provider" error on web with React 19.
//
// The web preview environment calls AppRegistry.runApplication multiple times
// (HMR, iframe reloads), and react-native-web's render() creates a new React
// root via createRoot() each time WITHOUT unmounting the previous one. Since
// @nkzw/create-context-hook creates contexts at module level, multiple
// concurrent roots share the same Context objects — React 19 rejects this.
//
// Fix: intercept runApplication and unmount the previous root before mounting.
// ----------------------------------------------------------------------------
if (Platform.OS === 'web') {
  try {
    const { AppRegistry } = require('react-native');
    const originalRunApplication = AppRegistry.runApplication;
    let currentRoot: any = null;

    AppRegistry.runApplication = function (appKey: string, params: any) {
      if (currentRoot) {
        try { currentRoot.unmount(); } catch {}
        currentRoot = null;
      }
      const root = originalRunApplication.call(AppRegistry, appKey, params);
      currentRoot = root;
      return root;
    };
  } catch (e) {
    // Non-fatal — will only matter on web
  }
}

export {};
