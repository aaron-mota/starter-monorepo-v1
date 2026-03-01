import webpush from 'web-push';
import type { Db, ObjectId } from 'mongodb';

interface TagDoc {
  _id: ObjectId;
  ownerId: ObjectId;
  name: string;
  slug?: string;
  isOfficial?: boolean;
}

interface ScanDoc {
  tagId: ObjectId;
  scannedBy?: ObjectId;
  city?: string;
}

function ensureVapidConfigured() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

/**
 * Collect all user IDs that should be notified for a tag scan.
 * Returns the primary user + their family members.
 */
async function collectNotifyUserIds(db: Db, primaryUserId: ObjectId): Promise<ObjectId[]> {
  const notifyUserIds: ObjectId[] = [primaryUserId];

  const user = await db.collection('User').findOne({ _id: primaryUserId }, { projection: { familyId: 1 } });

  if (user?.familyId) {
    const family = await db.collection('Family').findOne({ _id: user.familyId });
    if (family?.memberIds?.length) {
      for (const memberId of family.memberIds as ObjectId[]) {
        if (!memberId.equals(primaryUserId)) {
          notifyUserIds.push(memberId);
        }
      }
    }
  }

  return notifyUserIds;
}

/**
 * Send web push notifications via Web Push API (VAPID).
 */
async function sendWebPushNotifications(
  db: Db,
  tag: TagDoc,
  scan: ScanDoc,
  notifyUserIds: ObjectId[],
  primaryUserId: ObjectId
): Promise<void> {
  if (!ensureVapidConfigured()) return;

  const subscriptions = await db
    .collection('PushSubscription')
    .find({ userId: { $in: notifyUserIds } })
    .toArray();

  const locationStr = scan.city ? ` in ${scan.city}` : '';
  const payload = JSON.stringify({
    title: `${tag.name} scanned`,
    body: `Your tag "${tag.name}" was just scanned${locationStr}.`,
    url: '/dashboard',
  });

  const sendPromises = subscriptions
    .filter((sub) => {
      const isPrimary = (sub.userId as ObjectId).equals(primaryUserId);
      if (isPrimary) return sub.notifyOnTagScan !== false;
      return sub.notifyOnFamilyScan === true;
    })
    .map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint as string,
            keys: sub.keys as { p256dh: string; auth: string },
          },
          payload
        );
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 410 || statusCode === 404) {
          await db.collection('PushSubscription').deleteOne({ _id: sub._id });
        }
      }
    });

  await Promise.allSettled(sendPromises);
}

/**
 * Send Expo push notifications to mobile devices with registered push tokens.
 */
async function sendExpoPushNotifications(
  db: Db,
  tag: TagDoc,
  scan: ScanDoc,
  notifyUserIds: ObjectId[],
  primaryUserId: ObjectId
): Promise<void> {
  const devices = await db
    .collection('DeviceRegistration')
    .find({
      userId: { $in: notifyUserIds },
      expoPushToken: { $exists: true, $ne: null },
    })
    .toArray();

  if (devices.length === 0) return;

  const locationStr = scan.city ? ` in ${scan.city}` : '';

  const messages = devices
    .filter((device) => {
      const isPrimary = (device.userId as ObjectId).equals(primaryUserId);
      if (isPrimary) return device.notifyOnTagScan !== false;
      return device.notifyOnFamilyScan === true;
    })
    .map((device) => ({
      to: device.expoPushToken as string,
      title: `${tag.name} scanned`,
      body: `Your tag "${tag.name}" was just scanned${locationStr}.`,
      data: { url: `/t/${tag.slug ?? ''}`, tagSlug: tag.slug ?? '' },
      sound: 'default' as const,
    }));

  if (messages.length === 0) return;

  const BATCH_SIZE = 100;
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (response.ok) {
        const result = (await response.json()) as { data: Array<{ status: string; details?: { error?: string } }> };
        for (let j = 0; j < result.data.length; j++) {
          const ticket = result.data[j];
          if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
            await db
              .collection('DeviceRegistration')
              .updateMany({ expoPushToken: batch[j].to }, { $unset: { expoPushToken: '' } });
          }
        }
      }
    } catch {
      // Push failure is non-critical
    }
  }
}

export async function sendScanNotifications(db: Db, tag: TagDoc, scan: ScanDoc): Promise<void> {
  // Determine the primary user to notify based on item ownership
  let primaryUserId: ObjectId;
  if (tag.isOfficial) {
    if (!scan.scannedBy) return; // Can't notify anonymous scanners of official tags
    primaryUserId = scan.scannedBy;
  } else {
    primaryUserId = tag.ownerId;
  }

  const notifyUserIds = await collectNotifyUserIds(db, primaryUserId);

  // Send web push and Expo push in parallel
  await Promise.allSettled([
    sendWebPushNotifications(db, tag, scan, notifyUserIds, primaryUserId),
    sendExpoPushNotifications(db, tag, scan, notifyUserIds, primaryUserId),
  ]);
}
