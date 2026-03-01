import { ObjectId } from 'mongodb';
import type { Db, Document, WithId } from 'mongodb';

/**
 * Ensures a SubscriptionUser document exists for the given user.
 * If one doesn't exist yet (e.g. user was created before the Clerk webhook
 * started creating SubscriptionUser docs), creates it on the fly and links
 * it to the User document.
 */
export async function ensureSubscriptionUser(db: Db, user: WithId<Document>): Promise<WithId<Document>> {
  // Try the existing reference first
  if (user.subscriptionUserId) {
    const existing = await db.collection('SubscriptionUser').findOne({
      _id: new ObjectId(user.subscriptionUserId as string),
    });
    if (existing) return existing;
  }

  // Fallback: look up by userId in case the reference is missing but the doc exists
  const byUserId = await db.collection('SubscriptionUser').findOne({ userId: user._id });
  if (byUserId) {
    // Fix the missing reference on the User doc
    if (!user.subscriptionUserId) {
      await db.collection('User').updateOne({ _id: user._id }, { $set: { subscriptionUserId: byUserId._id } });
    }
    return byUserId;
  }

  // Create a new SubscriptionUser
  const now = new Date();
  const result = await db.collection('SubscriptionUser').insertOne({
    userId: user._id,
    tier: 'free',
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    createdAt: now,
    updatedAt: now,
  });

  // Link it to the User
  await db.collection('User').updateOne({ _id: user._id }, { $set: { subscriptionUserId: result.insertedId } });

  return (await db.collection('SubscriptionUser').findOne({ _id: result.insertedId }))!;
}
