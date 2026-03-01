import { useMemo, useState } from 'react';
import { Linking, RefreshControl, ScrollView, View } from 'react-native';
import { Bar, CartesianChart } from 'victory-native';
import type { Scope } from '@/components/scope-filter';
import { SafeAreaView } from '@/components/safe-area-view';
import { ScopeFilter } from '@/components/scope-filter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRefresh } from '@/hooks/use-refresh';
import { BarChart3, ExternalLink, Minus, TrendingDown, TrendingUp } from '@/lib/icons';
import { trpc } from '@/lib/trpc';

const CHART_COLORS = ['#f97316', '#0ea5e9', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b', '#6366f1', '#ec4899'];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AnalyticsScreen() {
  const { user, ownerId, isLoading: isUserLoading } = useCurrentUser();
  const [scope, setScope] = useState<Scope>('myself');
  const { refreshing, onRefresh } = useRefresh();
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const isPro = user?.plan === 'pro';

  if (isUserLoading) {
    return (
      <SafeAreaView>
        <View className="gap-4 pt-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isPro) {
    return (
      <SafeAreaView edges={['bottom']}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 pb-8 pt-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Card>
            <CardContent className="items-center gap-4 p-6">
              <BarChart3 className="h-12 w-12 text-muted-foreground" />
              <Text className="text-xl font-bold text-center">Advanced Analytics</Text>
              <Text className="text-sm text-muted-foreground text-center">
                Upgrade to Pro to unlock trend analysis, peak hours, day-of-week patterns, and device insights.
              </Text>
              <Button
                onPress={() =>
                  Linking.openURL(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/settings`)
                }
                className="flex-row gap-2"
              >
                <ExternalLink className="h-4 w-4 text-primary-foreground" />
                <Text className="text-primary-foreground font-medium">Upgrade to Pro</Text>
              </Button>
            </CardContent>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 pb-8 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ScopeFilter scope={scope} onScopeChange={setScope} familyId={user?.familyId} />
        <TrendCards userId={ownerId!} scope={scope} />
        <PeakHoursChart userId={ownerId!} scope={scope} timezone={timezone} />
        <DayOfWeekChart userId={ownerId!} scope={scope} timezone={timezone} />
        <DeviceBreakdownCard userId={ownerId!} scope={scope} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TrendCards({ userId, scope }: { userId: string; scope: Scope }) {
  const { data: trend, isLoading } = trpc.stats.getTrendComparison.useQuery({ userId, scope }, { enabled: !!userId });

  if (isLoading) {
    return (
      <View className="flex-row gap-3">
        <Skeleton className="h-24 flex-1" />
        <Skeleton className="h-24 flex-1" />
      </View>
    );
  }

  const changePercent = trend?.changePercent ?? 0;
  const TrendIcon = changePercent > 0 ? TrendingUp : changePercent < 0 ? TrendingDown : Minus;
  const trendColor =
    changePercent > 0 ? 'text-green-500' : changePercent < 0 ? 'text-red-500' : 'text-muted-foreground';

  return (
    <View className="flex-row gap-3">
      <Card className="flex-1">
        <CardContent className="p-4 items-center gap-1">
          <Text className="text-xs text-muted-foreground">This Week</Text>
          <Text className="text-2xl font-bold">{trend?.thisWeek ?? 0}</Text>
          <View className="flex-row items-center gap-1">
            <TrendIcon className={`h-3 w-3 ${trendColor}`} />
            <Text className={`text-xs font-medium ${trendColor}`}>
              {changePercent > 0 ? '+' : ''}
              {changePercent.toFixed(0)}%
            </Text>
          </View>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardContent className="p-4 items-center gap-1">
          <Text className="text-xs text-muted-foreground">Last Week</Text>
          <Text className="text-2xl font-bold">{trend?.lastWeek ?? 0}</Text>
        </CardContent>
      </Card>
    </View>
  );
}

function PeakHoursChart({ userId, scope, timezone }: { userId: string; scope: Scope; timezone: string }) {
  const { data, isLoading } = trpc.stats.getPeakHours.useQuery(
    { userId, scope, days: 30, timezone },
    { enabled: !!userId }
  );

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const chartData = (data ?? []).map((d) => ({
    hour: d.hour as number,
    count: d.count as number,
    label: `${d.hour as number}`,
  }));

  if (chartData.length === 0 || chartData.every((d) => d.count === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Peak Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="text-muted-foreground text-center py-8">No data for the last 30 days</Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Peak Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <View style={{ height: 200 }}>
          <CartesianChart data={chartData} xKey="hour" yKeys={['count']}>
            {({ points, chartBounds }) => (
              <Bar
                points={points.count}
                chartBounds={chartBounds}
                color="#f97316"
                roundedCorners={{ topLeft: 4, topRight: 4 }}
              />
            )}
          </CartesianChart>
        </View>
      </CardContent>
    </Card>
  );
}

function DayOfWeekChart({ userId, scope, timezone }: { userId: string; scope: Scope; timezone: string }) {
  const { data, isLoading } = trpc.stats.getDayOfWeek.useQuery(
    { userId, scope, days: 30, timezone },
    { enabled: !!userId }
  );

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const chartData = (data ?? []).map((d) => ({
    day: d.day as number,
    count: d.count as number,
    label: DAY_LABELS[d.day as number] ?? '',
  }));

  if (chartData.length === 0 || chartData.every((d) => d.count === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Day of Week</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="text-muted-foreground text-center py-8">No data for the last 30 days</Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Day of Week</CardTitle>
      </CardHeader>
      <CardContent>
        <View style={{ height: 200 }}>
          <CartesianChart data={chartData} xKey="day" yKeys={['count']}>
            {({ points, chartBounds }) => (
              <Bar
                points={points.count}
                chartBounds={chartBounds}
                color="#0ea5e9"
                roundedCorners={{ topLeft: 4, topRight: 4 }}
              />
            )}
          </CartesianChart>
        </View>
      </CardContent>
    </Card>
  );
}

function DeviceBreakdownCard({ userId, scope }: { userId: string; scope: Scope }) {
  const { data, isLoading } = trpc.stats.getDeviceBreakdown.useQuery(
    { userId, scope, days: 30 },
    { enabled: !!userId }
  );

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  const items = (data ?? []).filter((d) => (d.count as number) > 0);
  const total = items.reduce((sum, d) => sum + (d.count as number), 0);

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="text-muted-foreground text-center py-8">No data for the last 30 days</Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Devices</CardTitle>
      </CardHeader>
      <CardContent className="gap-3">
        {items.map((item, i) => {
          const count = item.count as number;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <View key={item.os as string} className="gap-1">
              <View className="flex-row justify-between">
                <Text className="text-sm font-medium">{item.os as string}</Text>
                <Text className="text-sm text-muted-foreground">
                  {count} ({pct.toFixed(0)}%)
                </Text>
              </View>
              <View className="h-2 bg-secondary rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
              </View>
            </View>
          );
        })}
      </CardContent>
    </Card>
  );
}
