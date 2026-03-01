import type { PlanTier } from '@starter/shared/constants/plans';

export function getEffectivePlan(user: { plan?: string; planOverride?: string | null } | null | undefined): PlanTier {
  if (!user) return 'free';
  return ((user.planOverride ?? user.plan) as PlanTier) || 'free';
}
