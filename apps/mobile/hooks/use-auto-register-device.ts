import { useEffect, useRef } from 'react';
import { useDeviceInfo } from './use-device-info';
import { trpc } from '@/lib/trpc';

/**
 * Automatically registers or updates the device when the user is authenticated.
 * Fire-and-forget — does not block UI or surface errors.
 */
export function useAutoRegisterDevice(ownerId: string | undefined) {
  const deviceInfo = useDeviceInfo();
  const hasRegistered = useRef(false);
  const registerMutation = trpc.deviceRegistration.registerOrUpdate.useMutation();

  const nativeDeviceId = deviceInfo?.nativeDeviceId;
  const platform = deviceInfo?.platform;
  const deviceName = deviceInfo?.deviceName;
  const model = deviceInfo?.model;
  const osVersion = deviceInfo?.osVersion;
  const appVersion = deviceInfo?.appVersion;

  useEffect(() => {
    if (!ownerId || !nativeDeviceId || !platform || hasRegistered.current) return;

    hasRegistered.current = true;

    registerMutation.mutate({
      nativeDeviceId,
      platform,
      deviceName: deviceName ?? undefined,
      model: model ?? undefined,
      osVersion: osVersion ?? undefined,
      appVersion: appVersion ?? undefined,
    });
  }, [ownerId, nativeDeviceId, platform, deviceName, model, osVersion, appVersion, registerMutation]);
}
