import { schemaDatabaseObject } from '../../_partial';
import { z } from 'zod';

export const devicePlatformEnum = z.enum(['ios', 'android', 'web']);
export type DevicePlatform = z.infer<typeof devicePlatformEnum>;

export const schemaRelationshipFields = z.object({
  userId: schemaDatabaseObject.shape.id,
});

export const schema = z.object({
  ...schemaDatabaseObject.shape,
  deviceId: z.guid(),
  deviceName: z.string().max(60).optional(),
  platform: devicePlatformEnum.optional(),
  nativeDeviceId: z.string().max(255).optional(),
  model: z.string().max(100).optional(),
  osVersion: z.string().max(50).optional(),
  appVersion: z.string().max(20).optional(),
  expoPushToken: z.string().max(255).optional(),
  notifyOnTagScan: z.boolean().optional(),
  notifyOnFamilyScan: z.boolean().optional(),
  lastActiveAt: z.date().optional(),
  ...schemaRelationshipFields.shape,
});

export const schemaCreate = schema.pick({
  deviceId: true,
  deviceName: true,
  userId: true,
  platform: true,
  nativeDeviceId: true,
  model: true,
  osVersion: true,
  appVersion: true,
  expoPushToken: true,
});

export const schemaUpdate = z
  .object({
    deviceName: z.string().max(60).optional(),
    platform: devicePlatformEnum.optional(),
    nativeDeviceId: z.string().max(255).optional(),
    model: z.string().max(100).optional(),
    osVersion: z.string().max(50).optional(),
    appVersion: z.string().max(20).optional(),
    expoPushToken: z.string().max(255).optional(),
    notifyOnTagScan: z.boolean().optional(),
    notifyOnFamilyScan: z.boolean().optional(),
    lastActiveAt: z.date().optional(),
  })
  .partial();
