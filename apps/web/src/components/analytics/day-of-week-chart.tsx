'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/hooks';

interface DayOfWeekChartProps {
  userId: string;
  scope?: 'all' | 'family' | 'myself';
  days?: number;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DayOfWeekChart({ userId, scope, days = 30 }: DayOfWeekChartProps) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { data, isLoading } = trpc.stats.getDayOfWeek.useQuery(
    { userId, scope, days, timezone },
    { enabled: !!userId }
  );

  // Fill all 7 days (MongoDB $dayOfWeek: 1=Sun, 7=Sat)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const found = data?.find((d) => d.day === i + 1);
    return { dayName: DAY_NAMES[i], count: found?.count ?? 0 };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Day of Week</CardTitle>
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
              <XAxis dataKey="dayName" className="text-xs" />
              <YAxis className="text-xs" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                }}
              />
              <Bar dataKey="count" fill="var(--color-chart-2)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
