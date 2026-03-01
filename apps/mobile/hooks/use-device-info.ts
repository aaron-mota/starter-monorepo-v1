import { useEffect, useState } from 'react';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

interface DeviceInfo {
  nativeDeviceId: string | null;
  platform: 'ios' | 'android';
  deviceName: string | null;
  model: string | null;
  osVersion: string | null;
  appVersion: string | null;
}

export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    async function resolve() {
      const nativeDeviceId =
        Platform.OS === 'ios' ? await Application.getIosIdForVendorAsync() : Application.getAndroidId();

      setDeviceInfo({
        nativeDeviceId,
        platform: Platform.OS as 'ios' | 'android',
        deviceName: Device.deviceName,
        model: Device.modelName,
        osVersion: `${Platform.OS === 'ios' ? 'iOS' : 'Android'} ${Device.osVersion ?? ''}`.trim(),
        appVersion: Application.nativeApplicationVersion,
      });
    }

    resolve();
  }, []);

  return deviceInfo;
}
