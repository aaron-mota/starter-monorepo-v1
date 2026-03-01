import { createBaseRouter } from '../_base';
import { protectedProcedure, router as trpcRouter } from '../../trpc-server';
import {
  adapterFnDbToFE,
  adapterFnFEToDbCreate,
  adapterFnFEToDbPartial,
  adapterFnFEToDbUpdate,
  schema,
  schemaCreate,
  schemaDb,
  schemaDbCreate,
  schemaDbUpdate,
  schemaUpdate,
  TYPE,
} from './_config';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { TDocDb } from '@starter/shared/schemas/database/device-registration/server/_config';
import { devicePlatformEnum } from '@starter/shared/schemas/database/device-registration/client/schema';

const routerBase = createBaseRouter({
  config: {
    routerName: TYPE.router,
    collectionName: TYPE.collection,
  },
  schemas: {
    schema,
    schemaCreate,
    schemaUpdate,
    schemaDb,
    schemaDbCreate,
    schemaDbUpdate,
  },
  adapterFns: {
    adapterFnDbToFE,
    adapterFnToDbPartial: adapterFnFEToDbPartial,
    adapterFnToDbCreate: adapterFnFEToDbCreate,
    adapterFnToDbUpdate: adapterFnFEToDbUpdate,
  },
});

export const router = trpcRouter({
  getSingleById: routerBase.getSingleById,
  getSingleWhere: routerBase.getSingleWhere,
  getAll: routerBase.getAll,
  getManyMongo: routerBase.getManyMongo,
  create: routerBase.create,
  delete: routerBase.delete,

  registerOrUpdate: protectedProcedure
    .input(
      z.object({
        nativeDeviceId: z.string().max(255),
        platform: devicePlatformEnum,
        deviceName: z.string().max(60).optional(),
        model: z.string().max(100).optional(),
        osVersion: z.string().max(50).optional(),
        appVersion: z.string().max(20).optional(),
        expoPushToken: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, clerkId } = ctx;
      const { nativeDeviceId, platform, deviceName, model, osVersion, appVersion, expoPushToken } = input;

      const user = await db.collection('User').findOne({ clerkId: clerkId! }, { projection: { _id: 1 } });
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      const userId = user._id;
      const now = new Date();

      const result = await db.collection(TYPE.collection).findOneAndUpdate(
        { nativeDeviceId, userId },
        {
          $set: {
            platform,
            ...(deviceName !== undefined ? { deviceName } : {}),
            ...(model !== undefined ? { model } : {}),
            ...(osVersion !== undefined ? { osVersion } : {}),
            ...(appVersion !== undefined ? { appVersion } : {}),
            ...(expoPushToken !== undefined ? { expoPushToken } : {}),
            lastActiveAt: now,
            updatedAt: now,
          },
          $setOnInsert: {
            deviceId: crypto.randomUUID(),
            nativeDeviceId,
            userId,
            createdAt: now,
          },
        },
        { upsert: true, returnDocument: 'after' }
      );

      return adapterFnDbToFE(result as unknown as TDocDb);
    }),

  updateNotificationPreferences: protectedProcedure
    .input(
      z.object({
        nativeDeviceId: z.string().max(255),
        notifyOnTagScan: z.boolean().optional(),
        notifyOnFamilyScan: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, clerkId } = ctx;
      const { nativeDeviceId, notifyOnTagScan, notifyOnFamilyScan } = input;

      const user = await db.collection('User').findOne({ clerkId: clerkId! }, { projection: { _id: 1 } });
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      const now = new Date();
      const $set: Record<string, unknown> = { updatedAt: now };
      if (notifyOnTagScan !== undefined) $set.notifyOnTagScan = notifyOnTagScan;
      if (notifyOnFamilyScan !== undefined) $set.notifyOnFamilyScan = notifyOnFamilyScan;

      await db.collection(TYPE.collection).updateOne({ nativeDeviceId, userId: user._id }, { $set });

      return { ok: true };
    }),
});
