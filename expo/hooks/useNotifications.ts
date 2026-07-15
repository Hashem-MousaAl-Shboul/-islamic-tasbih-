import { useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform, Linking, Alert } from 'react-native';
import Constants from 'expo-constants';

import { useTasbihStore } from './useTasbihStore';
import { useLanguageStore } from './useLanguageStore';

const NOTIF_TAG = '[Notifications]';

const MORNING_REMINDER_ID = 'morning-adhkar-reminder';
const EVENING_REMINDER_ID = 'evening-adhkar-reminder';

/**
 * Detects whether the app is running inside Expo Go.
 * expo-notifications remote push functionality was removed from Expo Go in SDK 53+,
 * which causes a runtime error on Android even for local-only notifications.
 */
export function isExpoGo(): boolean {
  if (Platform.OS === 'web') return false;
  return (
    Constants.executionEnvironment === 'storeClient' ||
    Constants.appOwnership === 'expo'
  );
}

// Only register the notification handler outside Expo Go to avoid the
// "Android Push notifications removed from Expo Go" runtime error.
if (!isExpoGo()) {
  Notifications.setNotificationHandler({
    handleNotification: () =>
      Promise.resolve({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
  });
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  if (isExpoGo()) return;
  try {
    const existing = await Notifications.getNotificationChannelAsync('adhkar-reminders');
    if (!existing) {
      await Notifications.setNotificationChannelAsync('adhkar-reminders', {
        name: 'Adhkar Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4A853',
      });
      console.log(NOTIF_TAG, 'Android notification channel created');
    }
  } catch (e) {
    console.log(NOTIF_TAG, 'Error ensuring channel:', e);
  }
}

async function requestPermissions(): Promise<boolean> {
  if (isExpoGo()) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;

    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
      android: {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldVibrate: true,
      },
    });

    if (!requested.granted && !requested.canAskAgain) {
      return false;
    }
    return requested.granted;
  } catch (e) {
    console.log(NOTIF_TAG, 'Permission request error:', e);
    return false;
  }
}

function parseTime(timeStr: string): { hour: number; minute: number } {
  const [h, m] = timeStr.split(':').map((p) => parseInt(p, 10));
  return { hour: h ?? 6, minute: m ?? 0 };
}

function getNextTrigger(hour: number, minute: number): Date {
  const now = new Date();
  const trigger = new Date();
  trigger.setFullYear(now.getFullYear());
  trigger.setMonth(now.getMonth());
  trigger.setDate(now.getDate());
  trigger.setHours(hour, minute, 0, 0);

  if (trigger <= now) {
    trigger.setDate(trigger.getDate() + 1);
  }
  return trigger;
}

async function scheduleReminder(
  id: string,
  hour: number,
  minute: number,
  title: string,
  body: string,
): Promise<void> {
  if (isExpoGo()) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);

    const triggerDate = getNextTrigger(hour, minute);

    // DAILY trigger repeats correctly on both Android and iOS
    const trigger: Notifications.NotificationTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    };

    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title,
        body,
        sound: 'default',
        ...(Platform.OS === 'android' && {
          channelId: 'adhkar-reminders',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        }),
      },
      trigger,
    });
    console.log(NOTIF_TAG, `Scheduled ${id} for ${hour}:${minute}`);
  } catch (e) {
    console.log(NOTIF_TAG, `Error scheduling ${id}:`, e);
  }
}

async function cancelReminder(id: string): Promise<void> {
  if (isExpoGo()) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
    console.log(NOTIF_TAG, `Cancelled ${id}`);
  } catch (e) {
    console.log(NOTIF_TAG, `Error cancelling ${id}:`, e);
  }
}

export interface NotificationsHook {
  toggleNotifications: (enabled: boolean) => Promise<void>;
  toggleMorningReminder: (enabled: boolean) => void;
  toggleEveningReminder: (enabled: boolean) => void;
  setMorningTime: (time: string) => void;
  setEveningTime: (time: string) => void;
  isExpoGoEnvironment: boolean;
}

export function useNotifications(): NotificationsHook {
  const { settings, updateSettings } = useTasbihStore();
  const { t } = useLanguageStore();
  const isFirstRender = useRef<boolean>(true);

  const refreshAllReminders = useCallback(async () => {
    const {
      notificationsEnabled,
      morningReminderEnabled,
      morningReminderTime,
      eveningReminderEnabled,
      eveningReminderTime,
    } = settings;

    if (!notificationsEnabled) {
      await cancelReminder(MORNING_REMINDER_ID);
      await cancelReminder(EVENING_REMINDER_ID);
      return;
    }

    if (morningReminderEnabled) {
      const { hour, minute } = parseTime(morningReminderTime);
      await scheduleReminder(
        MORNING_REMINDER_ID,
        hour,
        minute,
        t('morningAdhkar'),
        t('morningReminderBody'),
      );
    } else {
      await cancelReminder(MORNING_REMINDER_ID);
    }

    if (eveningReminderEnabled) {
      const { hour, minute } = parseTime(eveningReminderTime);
      await scheduleReminder(
        EVENING_REMINDER_ID,
        hour,
        minute,
        t('eveningAdhkar'),
        t('eveningReminderBody'),
      );
    } else {
      await cancelReminder(EVENING_REMINDER_ID);
    }
  }, [settings, t]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (isExpoGo()) return;
    void ensureAndroidChannel();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (isExpoGo()) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    void refreshAllReminders();
  }, [refreshAllReminders]);

  const toggleNotifications = useCallback(
    async (enabled: boolean) => {
      if (isExpoGo()) {
        Alert.alert(
          t('notificationsExpoGoTitle'),
          t('notificationsExpoGoWarning'),
          [{ text: t('ok'), style: 'default' }],
        );
        return;
      }

      if (!enabled) {
        await cancelReminder(MORNING_REMINDER_ID);
        await cancelReminder(EVENING_REMINDER_ID);
        updateSettings({ notificationsEnabled: false });
        return;
      }

      const granted = await requestPermissions();
      if (!granted) {
        const appName = Constants.expoConfig?.name ?? 'Sabbah';
        Alert.alert(
          t('notificationsPermissionTitle'),
          t('notificationsPermissionDenied'),
          [
            { text: t('cancel'), style: 'cancel' },
            {
              text: t('openSettings'),
              onPress: () => {
                if (Platform.OS === 'web') {
                  // Linking.openSettings() is native-only; open browser settings page as fallback
                  void Linking.openURL('about:settings');
                } else {
                  void Linking.openSettings();
                }
              },
            },
          ],
        );
        return;
      }

      await ensureAndroidChannel();
      updateSettings({ notificationsEnabled: true });
    },
    [t, updateSettings],
  );

  const toggleMorningReminder = useCallback(
    (enabled: boolean) => {
      updateSettings({ morningReminderEnabled: enabled });
    },
    [updateSettings],
  );

  const toggleEveningReminder = useCallback(
    (enabled: boolean) => {
      updateSettings({ eveningReminderEnabled: enabled });
    },
    [updateSettings],
  );

  const setMorningTime = useCallback(
    (time: string) => {
      updateSettings({ morningReminderTime: time });
    },
    [updateSettings],
  );

  const setEveningTime = useCallback(
    (time: string) => {
      updateSettings({ eveningReminderTime: time });
    },
    [updateSettings],
  );

  return {
    toggleNotifications,
    toggleMorningReminder,
    toggleEveningReminder,
    setMorningTime,
    setEveningTime,
    isExpoGoEnvironment: isExpoGo(),
  };
}
