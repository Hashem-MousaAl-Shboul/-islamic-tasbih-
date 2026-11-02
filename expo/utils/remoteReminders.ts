import { Platform } from 'react-native';
import Constants from 'expo-constants';

const TAG = '[RemoteReminders]';

/**
 * Local copy of the Expo Go check (kept here instead of importing from
 * useNotifications to avoid a require cycle).
 */
function isExpoGo(): boolean {
  if (Platform.OS === 'web') return false;
  return (
    Constants.executionEnvironment === 'storeClient' ||
    Constants.appOwnership === 'expo'
  );
}

let cachedModule: typeof import('@/hooks/notificationsNative') | null = null;
let cachedPushToken: string | null = null;
let lastSyncAt = 0;

const SYNC_DEBOUNCE_MS = 30_000;

function getFunctionsUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_RORK_FUNCTIONS_URL;
  return fromEnv && fromEnv.length > 0
    ? fromEnv
    : 'https://islamic-dhikr-backend.rork.app';
}

function getModule(): typeof import('@/hooks/notificationsNative') | null {
  if (cachedModule !== null) return cachedModule;
  if (isExpoGo()) return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  cachedModule = require('@/hooks/notificationsNative') as typeof import('@/hooks/notificationsNative');
  return cachedModule;
}

function getProjectId(): string | undefined {
  return Constants.expoConfig?.extra?.eas?.projectId;
}

export interface RemoteReminderSyncInput {
  notificationsEnabled: boolean;
  morningReminderEnabled: boolean;
  morningReminderTime: string;
  eveningReminderEnabled: boolean;
  eveningReminderTime: string;
}

/**
 * Registers / updates this device's remote reminder schedule on the backend
 * (or unregisters when notifications are disabled). Returns true when the
 * server has the schedule, meaning the app can rely on pushes and skip the
 * local scheduled notifications. Returns false when remote delivery is not
 * available (web, Expo Go, no push token, network failure) — the caller then
 * falls back to local scheduling.
 */
export async function syncRemoteReminders(
  input: RemoteReminderSyncInput,
  t: (key: string) => string,
): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (isExpoGo()) return false;

  // When notifications are off, tell the server to forget this device.
  if (!input.notificationsEnabled) {
    const token = cachedPushToken;
    if (token) {
      cachedPushToken = null;
      void fetch(`${getFunctionsUrl()}/reminders/unregister`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pushToken: token }),
      }).catch(() => undefined);
    }
    return false;
  }

  // Avoid hammering the server on rapid settings toggles.
  const now = Date.now();
  if (now - lastSyncAt < SYNC_DEBOUNCE_MS && cachedPushToken) {
    return true;
  }

  try {
    const mod = getModule();
    if (!mod) return false;
    const { Notifications } = mod;

    if (!cachedPushToken) {
      const projectId = getProjectId();
      if (!projectId) {
        console.log(TAG, 'No projectId — falling back to local reminders');
        return false;
      }
      const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
      cachedPushToken = tokenResponse.data;
    }

    if (!cachedPushToken) {
      console.log(TAG, 'No push token — falling back to local reminders');
      return false;
    }

    // Minutes east of UTC (e.g. Amman UTC+3 → 180).
    const tzOffsetMinutes = -new Date().getTimezoneOffset();

    const response = await fetch(`${getFunctionsUrl()}/reminders/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pushToken: cachedPushToken,
        tzOffsetMinutes,
        morning: {
          enabled: input.morningReminderEnabled,
          hour: parseInt(input.morningReminderTime.split(':')[0] ?? '6', 10) || 6,
          minute: parseInt(input.morningReminderTime.split(':')[1] ?? '0', 10) || 0,
          title: t('morningAdhkar'),
          body: t('morningReminderBody'),
        },
        evening: {
          enabled: input.eveningReminderEnabled,
          hour: parseInt(input.eveningReminderTime.split(':')[0] ?? '18', 10) || 18,
          minute: parseInt(input.eveningReminderTime.split(':')[1] ?? '0', 10) || 0,
          title: t('eveningAdhkar'),
          body: t('eveningReminderBody'),
        },
      }),
    });

    if (!response.ok) {
      console.log(TAG, `Registration failed with HTTP ${response.status} — local fallback`);
      return false;
    }

    lastSyncAt = now;
    console.log(TAG, 'Reminder schedule registered with backend');
    return true;
  } catch (e) {
    console.log(TAG, 'Registration error — local fallback:', e);
    return false;
  }
}

/** Sends a test push via the backend (arrives within ~10 seconds). */
export async function sendRemoteTestPush(): Promise<boolean> {
  if (!cachedPushToken) return false;
  try {
    const response = await fetch(`${getFunctionsUrl()}/reminders/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pushToken: cachedPushToken, delaySeconds: 10 }),
    });
    return response.ok;
  } catch (e) {
    console.log(TAG, 'Test push failed:', e);
    return false;
  }
}
