import React, { useState, useEffect, memo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

const AD_UNIT_ID = 'ca-app-pub-4282819777610118/9248009059';

let BannerAdComponent: React.ComponentType<any> | null = null;
let BannerAdSizeValue: string | null = null;
let TestIdsValue: { BANNER?: string } | null = null;
let mobileAdsInit: { initialize: () => Promise<any> } | null = null;

try {
  const adsModule = require('react-native-google-mobile-ads');
  BannerAdComponent = adsModule.BannerAd;
  BannerAdSizeValue = adsModule.BannerAdSize?.ANCHORED_ADAPTIVE_BANNER || adsModule.BannerAdSize?.FULL_BANNER;
  TestIdsValue = adsModule.TestIds;
  mobileAdsInit = adsModule.default;
  console.log('[AdBanner] react-native-google-mobile-ads loaded successfully');
} catch (e) {
  console.log('[AdBanner] react-native-google-mobile-ads not available, ads will not be shown');
}

let adsInitialized = false;

function initializeAds() {
  if (adsInitialized || !mobileAdsInit || Platform.OS === 'web') return;
  try {
    mobileAdsInit.initialize().then(() => {
      console.log('[AdBanner] Mobile Ads SDK initialized');
      adsInitialized = true;
    }).catch((err: any) => {
      console.log('[AdBanner] Failed to initialize Mobile Ads SDK:', err);
    });
  } catch (e) {
    console.log('[AdBanner] Error initializing ads:', e);
  }
}

const AdBanner = memo(function AdBanner() {
  const [adLoaded, setAdLoaded] = useState<boolean>(false);
  const [adError, setAdError] = useState<boolean>(false);

  useEffect(() => {
    initializeAds();
  }, []);

  if (Platform.OS === 'web' || !BannerAdComponent || !BannerAdSizeValue) {
    return null;
  }

  const unitId = __DEV__ && TestIdsValue?.BANNER
    ? TestIdsValue.BANNER
    : AD_UNIT_ID;

  // if (adError) {
  //   return null;
  // }

  const NativeAd = BannerAdComponent;

  return (
    <View style={[styles.container, !adLoaded && styles.hidden]} testID="ad-banner">
      <NativeAd
        unitId={unitId}
        size={BannerAdSizeValue}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('[AdBanner] Ad loaded successfully');
          setAdLoaded(true);
        }}
        onAdFailedToLoad={(error: any) => {
          console.log('[AdBanner] Ad failed to load:', error);
          setAdError(true);
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
  },
  hidden: {
    height: 0,
    overflow: 'hidden',
  },
});
