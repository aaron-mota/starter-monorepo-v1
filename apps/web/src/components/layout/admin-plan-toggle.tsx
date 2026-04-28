'use client';

import type { PlanTier } from '@app/shared/constants/plans';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc, useCurrentUser } from '@/lib/hooks';
import { getEffectivePlan } from '@/lib/utils/get-effective-plan';

const OPTIONS: Array<{ label: string; value: PlanTier | null }> = [
  { label: 'Default', value: null },
  { label: 'Free', value: 'free' },
  { label: 'Pro', value: 'pro' },
];

export function AdminPlanToggle() {
  const { user } = useCurrentUser();
  const utils = trpc.useUtils();

  const mutation = trpc.user.setPlanOverride.useMutation({
    onSuccess: () => utils.user.getSingleWhere.invalidate(),
  });

  if (!user?.isAdmin) return null;

  const effectivePlan = getEffectivePlan(user);
  const currentOverride = user.planOverride ?? null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full border bg-background/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
      <Badge
        variant={effectivePlan === 'pro' ? 'default' : 'secondary'}
        className={effectivePlan === 'pro' ? 'bg-emerald-600 text-xs hover:bg-emerald-600' : 'text-xs'}
      >
        {effectivePlan.toUpperCase()}
      </Badge>
      {OPTIONS.map((opt) => (
        <Button
          key={opt.label}
          variant={currentOverride === opt.value ? 'default' : 'ghost'}
          size="sm"
          className="h-6 px-2 text-xs"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate({ planOverride: opt.value })}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
