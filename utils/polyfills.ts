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

export {};
