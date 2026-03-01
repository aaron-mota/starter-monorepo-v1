import { getDb } from './client';
import type { Db } from 'mongodb';

export async function ensureIndexes(db?: Db) {
  const database = db ?? (await getDb());

  // Users
  await database.collection('User').createIndex({ clerkId: 1 }, { unique: true });

  // Items
  await database.collection('Item').createIndex({ ownerId: 1 });

  // Company Users
  await database.collection('CompanyUser').createIndex({ userId: 1, companyId: 1 }, { unique: true });

  // Subscription Users
  await database.collection('SubscriptionUser').createIndex({ userId: 1 }, { unique: true });

  // Device Registrations
  await database.collection('DeviceRegistration').createIndex({ deviceId: 1 }, { unique: true });
  await database.collection('DeviceRegistration').createIndex({ userId: 1 });
  await database
    .collection('DeviceRegistration')
    .createIndex(
      { nativeDeviceId: 1, userId: 1 },
      { unique: true, partialFilterExpression: { nativeDeviceId: { $exists: true } } }
    );

  console.log('All indexes created successfully');
}

// Allow running as a standalone script
if (require.main === module) {
  ensureIndexes()
    .then(() => {
      console.log('Done');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to create indexes:', err);
      process.exit(1);
    });
}
