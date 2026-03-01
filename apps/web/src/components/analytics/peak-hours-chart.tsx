'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/hooks';

interface PeakHoursChartProps {
  userId: string;
  scope?: 'all' | 'family' | 'myself';
  days?: number;
}

function formatHour(hour: number): string {
  if (hour === 0) return '12am';
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return '12pm';
  return `${hour - 12}pm`;
}

export function PeakHoursChart({ userId, scope, days = 30 }: PeakHoursChartProps) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { data, isLoading } = trpc.stats.getPeakHours.useQuery(
    { userId, scope, days, timezone },
    { enabled: !!userId }
  );

  // Fill all 24 hours
  const chartData = Array.from({ length: 24 }, (_, i) => {
    const found = data?.find((d) => d.hour === i);
    return { hour: i, label: formatHour(i), count: found?.count ?? 0 };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Peak Hours</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : !data?.length ? (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No data available.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" className="text-xs" interval={2} />
              <YAxis className="text-xs" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                }}
              />
              <Bar dataKey="count" fill="var(--color-chart-1)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
