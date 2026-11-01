import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, Linking, AppState } from 'react-native';
import Constants from 'expo-constants';

import {
  UPDATE_CONFIG_URL,
  DEFAULT_REMOTE_CONFIG,
  PLAY_STORE_URL,
  PLAY_MARKET_URL,
  compareSemver,
  type UpdateRemoteConfig,
} from '@/constants/updateConfig';

export interface AppUpdateState {
  /** هل يجب عرض تنبيه التحديث الآن؟ */
  visible: boolean;
  /** تحديث إلزامي (لا يمكن تجاهله) */
  mandatory: boolean;
  /** رسالة مخصصة من الإعدادات البعيدة (فارغة = الافتراضية) */
  message: string;
  /** التنفيذ: فتح المتجر لتثبيت التحديث */
  performUpdate: () => void;
  /** تأجيل التحديث غير الإلزامي */
  dismiss: () => void;
}

const FETCH_TIMEOUT_MS = 8_000;

/**
 * يتحقق من الحاجة لتحديث عند تشغيل التطبيق وعند عودته للمقدمة:
 * يجلب الإعدادات من رابط JSON بعيد، ويقارنها بإصدار التطبيق الحالي.
 * أي فشل (شبكة/رابط/تحليل) يُتجاهل بصمت — لا يؤثر على عمل التطبيق.
 */
export function useAppUpdateCheck(): AppUpdateState {
  const [visible, setVisible] = useState<boolean>(false);
  const [mandatory, setMandatory] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const dismissedRef = useRef<boolean>(false);

  const checkForUpdate = useCallback(async () => {
    if (Platform.OS === 'web' || dismissedRef.current) return;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const response = await fetch(UPDATE_CONFIG_URL, {
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!response.ok) return;
      const remote: Partial<UpdateRemoteConfig> = await response.json();
      const config: UpdateRemoteConfig = {
        androidMinVersionCode:
          remote.androidMinVersionCode ?? DEFAULT_REMOTE_CONFIG.androidMinVersionCode,
        iosMinVersion: remote.iosMinVersion ?? DEFAULT_REMOTE_CONFIG.iosMinVersion,
        mandatory: remote.mandatory ?? false,
        message: remote.message ?? '',
      };

      const expoConfig = Constants.expoConfig;
      let needsUpdate = false;
      if (Platform.OS === 'android') {
        const currentCode = expoConfig?.android?.versionCode ?? 0;
        needsUpdate = currentCode > 0 && currentCode < config.androidMinVersionCode;
      } else if (Platform.OS === 'ios') {
        const currentVersion = expoConfig?.version ?? '0.0.0';
        needsUpdate = compareSemver(config.iosMinVersion, currentVersion) > 0;
      }

      if (needsUpdate) {
        setMandatory(config.mandatory);
        setMessage(config.message ?? '');
        setVisible(true);
      }
    } catch {
      // فشل صامت: لا شبكة أو رابط غير متوفر — التنبيه يظل مخفيًا
    }
  }, []);

  useEffect(() => {
    void checkForUpdate();
    // إعادة الفحص عند العودة للتطبيق من الخلفية
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void checkForUpdate();
    });
    return () => subscription.remove();
  }, [checkForUpdate]);

  const performUpdate = useCallback(() => {
    if (Platform.OS === 'android') {
      // رابط المتجر الأصلي أولًا، والعادي احتياطًا
      void Linking.canOpenURL(PLAY_MARKET_URL)
        .then((supported) => Linking.openURL(supported ? PLAY_MARKET_URL : PLAY_STORE_URL))
        .catch(() => void Linking.openURL(PLAY_STORE_URL));
    } else {
      void Linking.openURL(PLAY_STORE_URL).catch(() => {});
    }
    setVisible(false);
  }, []);

  const dismiss = useCallback(() => {
    if (mandatory) return; // الإلزامي لا يُؤجَّل
    dismissedRef.current = true;
    setVisible(false);
  }, [mandatory]);

  return { visible, mandatory, message, performUpdate, dismiss };
}
