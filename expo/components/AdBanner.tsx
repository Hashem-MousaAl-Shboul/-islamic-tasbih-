import { useEffect, useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import mobileAds, {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

const AD_UNIT_ID = 'ca-app-pub-4282819777610118/9248009059';

let initializationPromise: Promise<boolean> | null = null;

function initializeAds(): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(false);

  if (!initializationPromise) {
    initializationPromise = mobileAds()
      .initialize()
      .then(() => {
        console.log('[AdBanner] Mobile Ads SDK initialized');
        return true;
      })
      .catch((error: unknown) => {
        console.warn('[AdBanner] Failed to initialize Mobile Ads SDK:', error);
        initializationPromise = null;
        return false;
      });
  }

  return initializationPromise;
}

export default function AdBanner() {
  const [isReady, setIsReady] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    initializeAds().then((initialized) => {
      if (isMounted) {
        setIsReady(initialized);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // عدم عرض المكون نهائياً على الويب أو عند حدوث خطأ أو عدم الجاهزية
  if (Platform.OS === 'web' || !isReady || adFailed) {
    return null;
  }

  // استخدام TestIds.BANNER الآمن لبيئة التطوير
  const unitId = __DEV__
    ? TestIds.BANNER
    : AD_UNIT_ID;

  return (
    <View style={[styles.container, !adLoaded && styles.hidden]} testID="ad-banner">
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('[AdBanner] Ad loaded successfully');
          setAdLoaded(true);
        }}
        onAdFailedToLoad={(error) => {
          console.warn('[AdBanner] Ad failed to load:', error);
          setAdFailed(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F7F4EE',
    minHeight: 58,
    width: '100%',
    justifyContent: 'center',
  },
  hidden: {
    minHeight: 0,
    height: 0,
    opacity: 0,
    overflow: 'hidden',
  },
});
