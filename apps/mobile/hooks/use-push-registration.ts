import { useEffect, useRef } from 'react';
import { useDeviceInfo } from './use-device-info';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { trpc } from '@/lib/trpc';

/**
 * Registers for Expo push notifications on app launch.
 * Runs for all users. Fire-and-forget — does not block UI.
 */
export function usePushRegistration(ownerId: string | undefined) {
  const deviceInfo = useDeviceInfo();
  const hasRegistered = useRef(false);
  const registerMutation = trpc.deviceRegistration.registerOrUpdate.useMutation();

  const nativeDeviceId = deviceInfo?.nativeDeviceId;
  const platform = deviceInfo?.platform;

  useEffect(() => {
    if (!ownerId || !nativeDeviceId || !platform || hasRegistered.current) return;

    async function register() {
      try {
        // Check/request notification permission
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') return;

        // Android requires a notification channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
          });
        }

        // Get Expo Push Token
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) return;

        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        const expoPushToken = tokenData.data;

        hasRegistered.current = true;

        // Send token to backend alongside device registration
        registerMutation.mutate({
          nativeDeviceId: nativeDeviceId!,
          platform: platform!,
          deviceName: deviceInfo?.deviceName ?? undefined,
          model: deviceInfo?.model ?? undefined,
          osVersion: deviceInfo?.osVersion ?? undefined,
          appVersion: deviceInfo?.appVersion ?? undefined,
          expoPushToken,
        });
      } catch {
        // Push registration failure is non-critical
      }
    }

    register();
  }, [ownerId, nativeDeviceId, platform, deviceInfo, registerMutation]);
}
