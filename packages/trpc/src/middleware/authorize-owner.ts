import 'server-only';

import { TRPCError } from '@trpc/server';
import type { Db } from 'mongodb';

/**
 * Resolves a Clerk ID to the MongoDB user and verifies the caller
 * is authorized to access data for the given ownerId/userId.
 *
 * Authorization passes if the caller IS the requested user.
 */
export async function authorizeOwner(db: Db, clerkId: string, requestedUserId: string): Promise<void> {
  const caller = await db.collection('User').findOne({ clerkId }, { projection: { _id: 1 } });
  if (!caller) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found' });
  }

  const callerId = caller._id.toHexString();

  // Direct ownership match
  if (callerId === requestedUserId) return;

  throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this data' });
}
