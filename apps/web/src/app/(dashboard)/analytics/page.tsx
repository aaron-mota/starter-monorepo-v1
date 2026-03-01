'use client';

import { PLAN_LIMITS } from '@starter/shared/constants/plans';
import { PageHeader } from '@/components/shared/page-header';
import { UpgradePrompt } from '@/components/shared/upgrade-prompt';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/lib/hooks';
import { getEffectivePlan } from '@/lib/utils/get-effective-plan';

export default function AnalyticsPage() {
  const { user, isLoading: isUserLoading, error: userError } = useCurrentUser();

  const plan = getEffectivePlan(user);
  const isProPlan = PLAN_LIMITS[plan].advancedAnalytics;

  if (userError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" />
        <Alert variant="destructive">
          <AlertDescription>Failed to load analytics. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isUserLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Insights into your activity." />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!isProPlan) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Insights into your activity." />
        <UpgradePrompt message="Advanced analytics is a Pro feature. Upgrade to access detailed insights, trend comparisons, and more." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Insights into your activity." />
      <div className="rounded-lg border border-dashed p-12 text-center">
        <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
        <p className="mt-2 text-sm text-muted-foreground">Add your analytics charts and data visualizations here.</p>
      </div>
    </div>
  );
}
