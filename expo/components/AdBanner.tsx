import React, { useState, useEffect, memo, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

const AD_UNIT_ID = 'ca-app-pub-4282819777610118/9248009059';
// Always use a test ID in development even if TestIds fails to load — never send real ad requests in dev
const DEV_FALLBACK_TEST_ID = 'ca-app-pub-3940256099942544/6300978111';

let BannerAdComponent: React.ComponentType<any> | null = null;
let BannerAdSizeValue: string | null = null;
let TestIdsValue: { BANNER?: string } | null = null;
let mobileAdsInit: (() => { initialize: () => Promise<unknown> }) | null = null;
let adsInitialized = false;
let initPromise: Promise<boolean> | null = null;

try {
  const adsModule = require('react-native-google-mobile-ads');
  BannerAdComponent = adsModule.BannerAd;
  // Fallback chain: ANCHORED_ADAPTIVE_BANNER -> FULL_BANNER -> BANNER (always available)
  BannerAdSizeValue =
    adsModule.BannerAdSize?.ANCHORED_ADAPTIVE_BANNER ||
    adsModule.BannerAdSize?.FULL_BANNER ||
    adsModule.BannerAdSize?.BANNER ||
    null;
  TestIdsValue = adsModule.TestIds;
  // Handle both `export default` and direct export shapes across Metro/Babel
  mobileAdsInit = adsModule.default || adsModule;
  console.log('[AdBanner] react-native-google-mobile-ads loaded successfully');
} catch (e) {
  console.log('[AdBanner] react-native-google-mobile-ads not available, ads will not be shown');
}

/**
 * Initialize the Mobile Ads SDK once globally and return a promise that resolves
 * to `true` when ready. Subsequent calls reuse the same in-flight promise.
 */
function ensureAdsInitialized(): Promise<boolean> {
  if (Platform.OS === 'web' || !mobileAdsInit) return Promise.resolve(false);
  if (adsInitialized) return Promise.resolve(true);
  if (initPromise) return initPromise;

  initPromise = new Promise<boolean>((resolve) => {
    try {
      mobileAdsInit!()
        .initialize()
        .then(() => {
          console.log('[AdBanner] Mobile Ads SDK initialized');
          adsInitialized = true;
          resolve(true);
        })
        .catch((err: any) => {
          console.log('[AdBanner] Failed to initialize Mobile Ads SDK:', err);
          initPromise = null;
          resolve(false);
        });
    } catch (e) {
      console.log('[AdBanner] Error initializing ads:', e);
      initPromise = null;
      resolve(false);
    }
  });

  return initPromise;
}

const AdBanner = memo(function AdBanner() {
  const [isReady, setIsReady] = useState<boolean>(adsInitialized);
  const [adLoaded, setAdLoaded] = useState<boolean>(false);
  const [adError, setAdError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' || !mobileAdsInit || adsInitialized) {
      setIsReady(adsInitialized);
      return;
    }
    let cancelled = false;
    ensureAdsInitialized().then((ready) => {
      if (!cancelled && mountedRef.current) setIsReady(ready);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset error when the component is re-mounted / retry is triggered
  useEffect(() => {
    if (retryCount > 0) {
      setAdError(false);
      setAdLoaded(false);
    }
  }, [retryCount]);

  // Retry mechanism: after an error, attempt reload ONCE after 15s (max 1 retry)
  useEffect(() => {
    if (!adError || retryCount >= 1) return;

    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setAdError(false);
        setAdLoaded(false);
        setRetryCount((count) => count + 1);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [adError, retryCount]);

  if (Platform.OS === 'web' || !BannerAdComponent || !BannerAdSizeValue) {
    return null;
  }

  // Wait for SDK initialization before rendering the ad to avoid race conditions
  if (!isReady) {
    return null;
  }

  if (adError) {
    return null;
  }

  // In development, always use a test ID — never fall back to the production unit ID
  const unitId =
    __DEV__ && (TestIdsValue?.BANNER || DEV_FALLBACK_TEST_ID)
      ? (TestIdsValue?.BANNER ?? DEV_FALLBACK_TEST_ID)
      : AD_UNIT_ID;

  const BannerAd = BannerAdComponent;

  return (
    <View style={[styles.container, !adLoaded && styles.invisible]} testID="ad-banner">
      <BannerAd
        key={retryCount}
        unitId={unitId}
        size={BannerAdSizeValue}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('[AdBanner] Ad loaded successfully');
          if (mountedRef.current) setAdLoaded(true);
        }}
        onAdFailedToLoad={(error: any) => {
          console.log('[AdBanner] Ad failed to load:', error);
          if (mountedRef.current) setAdError(true);
        }}
      />
    </View>
  );
});

export default AdBanner;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#F7F4EE',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  invisible: {
    opacity: 0,
  },
});
