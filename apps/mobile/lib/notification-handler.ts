import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

/**
 * Configure how notifications are displayed when the app is in the foreground.
 */
export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Handle notification taps — navigate to the relevant screen.
 * Returns a cleanup function for the listener subscription.
 */
export function setupNotificationResponseListener(): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as { itemId?: string } | undefined;

    if (data?.itemId) {
      router.push(`/(tabs)/(items)/${data.itemId}`);
    } else {
      router.push('/(tabs)/(dashboard)');
    }
  });

  return () => subscription.remove();
}
