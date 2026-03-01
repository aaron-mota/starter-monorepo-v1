import 'server-only';

import { resolveUserPlan } from '../lib/resolve-user-plan';
import { PLAN_LIMITS } from '@starter/shared/constants/plans';
import { TRPCError } from '@trpc/server';
import { ObjectId } from 'mongodb';
import type { Db } from 'mongodb';

interface CheckItemLimitArgs {
  db: Db;
  ownerId: string;
}

export async function checkItemLimit({ db, ownerId }: CheckItemLimitArgs): Promise<void> {
  const plan = await resolveUserPlan(db, ownerId);
  const limits = PLAN_LIMITS[plan];

  const currentCount = await db.collection('Item').countDocuments({
    ownerId: new ObjectId(ownerId),
  });

  if (currentCount >= limits.maxItems) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `You've reached the maximum of ${limits.maxItems} items on the ${plan} plan. Upgrade to Pro for up to ${PLAN_LIMITS.pro.maxItems} items.`,
    });
  }
}
