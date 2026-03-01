import type { Db, ObjectId } from 'mongodb';

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
}

interface NotificationInfo {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const BATCH_SIZE = 100;

/**
 * Send Expo push notifications to target users.
 * Finds DeviceRegistration documents with non-null expoPushTokens for the given user IDs
 * and sends via the Expo Push API.
 */
export async function sendExpoPushNotifications(
  db: Db,
  notification: NotificationInfo,
  targetUserIds: ObjectId[]
): Promise<void> {
  if (targetUserIds.length === 0) return;

  // Find devices with push tokens for these users
  const devices = await db
    .collection('DeviceRegistration')
    .find({
      userId: { $in: targetUserIds },
      expoPushToken: { $exists: true, $ne: null },
    })
    .toArray();

  if (devices.length === 0) return;

  const messages: ExpoPushMessage[] = devices.map((device) => ({
    to: device.expoPushToken as string,
    title: notification.title,
    body: notification.body,
    data: notification.data,
    sound: 'default' as const,
  }));

  if (messages.length === 0) return;

  // Send in batches of 100
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (response.ok) {
        const result = (await response.json()) as { data: ExpoPushTicket[] };
        // Clean up stale tokens
        for (let j = 0; j < result.data.length; j++) {
          const ticket = result.data[j];
          if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
            const staleToken = batch[j].to;
            await db
              .collection('DeviceRegistration')
              .updateMany({ expoPushToken: staleToken }, { $unset: { expoPushToken: '' } });
          }
        }
      }
    } catch {
      // Push failure is non-critical
    }
  }
}
