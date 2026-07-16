import * as Notifications from 'expo-notifications';

/**
 * Native notifications module wrapper.
 *
 * This file is intentionally isolated so that `expo-notifications` is only
 * loaded on real builds. Loading it in Expo Go on Android triggers the remote
 * push auto-registration effect that crashes with SDK 53+.
 */
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

export { Notifications };
