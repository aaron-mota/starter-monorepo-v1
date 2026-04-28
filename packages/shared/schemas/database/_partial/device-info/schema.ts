import { z } from 'zod';

export const schemaDeviceInfo = z.object({
  deviceId: z.guid().optional(),
  ua: z.string().optional(),
  os: z.string().optional(),
  browser: z.string().optional(),
});

export type DeviceInfo = z.infer<typeof schemaDeviceInfo>;

export const schemaDeviceInfoForm = z.object({
  deviceId: z.guid().optional().default(''),
  ua: z.string().optional().default(''),
  os: z.string().optional().default(''),
  browser: z.string().optional().default(''),
});
