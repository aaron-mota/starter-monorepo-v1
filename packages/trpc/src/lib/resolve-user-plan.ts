import 'server-only';

import { ObjectId } from 'mongodb';
import type { PlanTier } from '@app/shared/constants/plans';
import type { Db } from 'mongodb';

export function resolveUserPlanFromDoc(user: { plan?: string; planOverride?: string | null }): PlanTier {
  return ((user.planOverride ?? user.plan) as PlanTier) || 'free';
}

export async function resolveUserPlan(db: Db, userId: string): Promise<PlanTier> {
  const user = await db
    .collection('User')
    .findOne({ _id: new ObjectId(userId) }, { projection: { plan: 1, planOverride: 1 } });
  if (!user) return 'free';
  return resolveUserPlanFromDoc(user as unknown as { plan?: string; planOverride?: string | null });
}
