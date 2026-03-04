import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type PurchasesPackage = any;

const CREDITS_STORAGE_KEY = 'user_credits';
const CREDITS_PER_PURCHASE = 100;

let Purchases: any = null;
let rcConfigured = false;

function getRCApiKey() {
  if (Platform.OS === 'web') return '';
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '',
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '',
    default: '',
  }) ?? '';
}

async function initRevenueCat() {
  if (Platform.OS === 'web' || rcConfigured) return;
  const apiKey = getRCApiKey();
  if (!apiKey) {
    console.log('[RevenueCat] No API key found, skipping configuration');
    return;
  }
  try {
    const timeoutPromise = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error('RevenueCat init timeout')), 5000)
    );
    const importPromise = import('react-native-purchases').then(mod => {
      Purchases = mod.default;
      Purchases.configure({ apiKey });
      rcConfigured = true;
      console.log('[RevenueCat] Configured successfully');
      return true;
    });
    await Promise.race([importPromise, timeoutPromise]);
  } catch (e) {
    console.log('[RevenueCat] Configuration error (non-blocking):', e);
  }
}

export const [CreditsProvider, useCreditsStore] = createContextHook(() => {
  const [credits, setCredits] = useState<number>(0);
  const queryClient = useQueryClient();

  const creditsQuery = useQuery({
    queryKey: ['credits'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(CREDITS_STORAGE_KEY);
        const val = stored ? parseInt(stored, 10) : 0;
        console.log('[Credits] Loaded credits:', val);
        return isNaN(val) ? 0 : val;
      } catch (e) {
        console.log('[Credits] Load error:', e);
        return 0;
      }
    },
  });

  useEffect(() => {
    if (creditsQuery.data !== undefined) {
      setCredits(creditsQuery.data);
    }
  }, [creditsQuery.data]);

  useEffect(() => {
    initRevenueCat();
  }, []);

  const offeringsQuery = useQuery({
    queryKey: ['rc-offerings'],
    queryFn: async () => {
      try {
        if (Platform.OS === 'web' || !Purchases) {
          console.log('[RevenueCat] Not available, returning null offerings');
          return null;
        }
        const offerings = await Purchases.getOfferings();
        console.log('[RevenueCat] Offerings loaded:', JSON.stringify(offerings?.current?.identifier));
        return offerings;
      } catch (e) {
        console.log('[RevenueCat] Offerings error:', e);
        return null;
      }
    },
    enabled: Platform.OS !== 'web' && rcConfigured,
    staleTime: 1000 * 60 * 5,
  });

  const saveCredits = useCallback(async (newCredits: number) => {
    try {
      await AsyncStorage.setItem(CREDITS_STORAGE_KEY, String(newCredits));
      setCredits(newCredits);
      queryClient.setQueryData(['credits'], newCredits);
      console.log('[Credits] Saved credits:', newCredits);
    } catch (e) {
      console.log('[Credits] Save error:', e);
    }
  }, [queryClient]);

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      if (!Purchases) throw new Error('RevenueCat not initialized');
      console.log('[Purchase] Starting purchase for:', pkg.identifier);
      const result = await Purchases.purchasePackage(pkg);
      console.log('[Purchase] Purchase result:', result.customerInfo.activeSubscriptions);
      return result;
    },
    onSuccess: async () => {
      const newCredits = credits + CREDITS_PER_PURCHASE;
      await saveCredits(newCredits);
      console.log('[Purchase] Credits added. New total:', newCredits);
    },
    onError: (error: any) => {
      if (error?.userCancelled) {
        console.log('[Purchase] User cancelled');
        return;
      }
      console.log('[Purchase] Error:', error);
      Alert.alert('Error', 'Purchase failed. Please try again.');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      if (!Purchases) throw new Error('RevenueCat not initialized');
      console.log('[Purchase] Restoring purchases...');
      const customerInfo = await Purchases.restorePurchases();
      console.log('[Purchase] Restore result:', customerInfo);
      return customerInfo;
    },
    onError: (error: any) => {
      console.log('[Purchase] Restore error:', error);
      Alert.alert('Error', 'Failed to restore purchases.');
    },
  });

  const spendCredits = useCallback(async (amount: number): Promise<boolean> => {
    if (credits < amount) {
      console.log('[Credits] Not enough credits. Have:', credits, 'Need:', amount);
      return false;
    }
    const newCredits = credits - amount;
    await saveCredits(newCredits);
    console.log('[Credits] Spent', amount, 'credits. Remaining:', newCredits);
    return true;
  }, [credits, saveCredits]);

  const getCreditsPackage = useCallback((): PurchasesPackage | null => {
    const current = offeringsQuery.data?.current;
    if (!current) return null;
    const pkg = current.availablePackages.find(
      (p: any) => p.identifier === 'credits_100' || p.identifier === '$rc_consumable'
    );
    return pkg ?? current.availablePackages[0] ?? null;
  }, [offeringsQuery.data]);

  const { isPending: isPurchasing, mutate: doPurchase } = purchaseMutation;
  const { isPending: isRestoring, mutate: doRestore } = restoreMutation;

  const purchaseCreditsHandler = useCallback((pkg: PurchasesPackage) => {
    doPurchase(pkg);
  }, [doPurchase]);

  const restorePurchasesHandler = useCallback(() => {
    doRestore();
  }, [doRestore]);

  const addCreditsHandler = useCallback(async (amount: number) => {
    const newCredits = credits + amount;
    await saveCredits(newCredits);
  }, [credits, saveCredits]);

  return useMemo(() => ({
    credits,
    isLoadingCredits: creditsQuery.isLoading,
    offerings: offeringsQuery.data,
    isLoadingOfferings: offeringsQuery.isLoading,
    isPurchasing,
    isRestoring,
    purchaseCredits: purchaseCreditsHandler,
    restorePurchases: restorePurchasesHandler,
    spendCredits,
    getCreditsPackage,
    addCredits: addCreditsHandler,
  }), [
    credits,
    creditsQuery.isLoading,
    offeringsQuery.data,
    offeringsQuery.isLoading,
    isPurchasing,
    isRestoring,
    purchaseCreditsHandler,
    restorePurchasesHandler,
    spendCredits,
    getCreditsPackage,
    addCreditsHandler,
  ]);
});
