'use client';

import { Activity, Clock, Users } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatCardSkeleton } from '@/components/dashboard/stat-card-skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCurrentUser } from '@/lib/hooks';

export default function DashboardPage() {
  const { isLoading, error } = useCurrentUser();

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
        <Alert variant="destructive">
          <AlertDescription>Failed to load dashboard data. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Welcome to your dashboard." />
        <div className="grid gap-4 md:grid-cols-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Welcome to your dashboard." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Events" value={0} icon={Activity} />
        <StatCard title="Active Users" value={0} icon={Users} />
        <StatCard title="Last Activity" value="Never" icon={Clock} />
      </div>
      <div className="rounded-lg border border-dashed p-12 text-center">
        <h3 className="text-lg font-semibold">Get Started</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          This is your dashboard. Customize it with your own data and components.
        </p>
      </div>
    </div>
  );
}
