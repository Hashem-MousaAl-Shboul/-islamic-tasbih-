import * as Notifications from 'expo-notifications';
import { Platform, LogBox } from 'react-native';
import i18n from '@/constants/translations';

if (Platform.OS !== 'web') {
  LogBox.ignoreLogs([
    'expo-notifications: Android Push notifications',
    'expo-notifications',
  ]);
}

let _notificationHandlerSet = false;
let _channelSetup = false;

function ensureNotificationHandler() {
  if (_notificationHandlerSet) return;
  _notificationHandlerSet = true;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    console.log('[NotificationService] Handler set successfully');
  } catch (e) {
    console.warn('[NotificationService] Handler setup error:', e);
  }
}

function ensureAndroidChannel() {
  if (_channelSetup || Platform.OS !== 'android') return;
  _channelSetup = true;
  try {
    Notifications.setNotificationChannelAsync('daily-reminder', {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1a5c4c',
    }).catch((err) => console.warn('[NotificationService] Channel setup error:', err));
  } catch (e) {
    console.warn('[NotificationService] Channel creation error:', e);
  }
}

export const notificationService = {
  async registerForPushNotificationsAsync() {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return false;
      }
      
      return true;
    } catch (error) {
      console.log('[NotificationService] Permission request error (expected in dev):', error);
      return false;
    }
  },

  async scheduleDailyReminder(enabled: boolean, hour: number = 20, minute: number = 0) {
    if (Platform.OS === 'web') return;

    ensureNotificationHandler();
    ensureAndroidChannel();

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (enabled) {
        const hasPermission = await this.registerForPushNotificationsAsync();
        
        if (hasPermission) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: i18n.t('appName') || 'Tasbeeh',
              body: i18n.t('dailyReminders') || 'Time for your daily dhikr',
              sound: true,
              ...(Platform.OS === 'android' ? { channelId: 'daily-reminder' } : {}),
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
              hour,
              minute,
              repeats: true,
            },
          });
          console.log(`[NotificationService] Daily reminder scheduled for ${hour}:${minute}`);
        } else {
          console.log('[NotificationService] No permission to schedule notifications');
        }
      } else {
        console.log('[NotificationService] All notifications cancelled');
      }
    } catch (error) {
      console.log('[NotificationService] Scheduling error (expected in dev):', error);
    }
  }
};
