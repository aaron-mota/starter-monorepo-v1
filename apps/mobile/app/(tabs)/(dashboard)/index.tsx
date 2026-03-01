import { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import type { Scope } from '@/components/scope-filter';
import { SafeAreaView } from '@/components/safe-area-view';
import { ScopeFilter } from '@/components/scope-filter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRefresh } from '@/hooks/use-refresh';
import { Activity, Clock, Hash } from '@/lib/icons';
import { trpc } from '@/lib/trpc';

export default function DashboardScreen() {
  const { user, ownerId, isLoading: isUserLoading } = useCurrentUser();
  const [scope, setScope] = useState<Scope>('myself');
  const { refreshing, onRefresh } = useRefresh();

  const { data: stats, isLoading: isStatsLoading } = trpc.stats.getDashboardStats.useQuery(
    { userId: ownerId!, scope },
    { enabled: !!ownerId }
  );

  const { data: recentActivity, isLoading: isActivityLoading } = trpc.stats.getRecentActivity.useQuery(
    { userId: ownerId!, scope, limit: 20 },
    { enabled: !!ownerId, refetchInterval: 30_000 }
  );

  const isLoading = isUserLoading || isStatsLoading;

  if (isLoading) {
    return (
      <SafeAreaView>
        <View className="gap-4 pt-4">
          <Skeleton className="h-8 w-48" />
          <View className="flex-row gap-3">
            <Skeleton className="h-24 flex-1" />
            <Skeleton className="h-24 flex-1" />
            <Skeleton className="h-24 flex-1" />
          </View>
        </View>
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
        {/* Scope Filter */}
        <ScopeFilter scope={scope} onScopeChange={setScope} familyId={user?.familyId} />

        {/* Stat Cards */}
        <View className="flex-row gap-3">
          <Card className="flex-1">
            <CardContent className="p-4 items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <Text className="text-2xl font-bold">{stats?.totalActions ?? 0}</Text>
              <Text className="text-xs text-muted-foreground">Total Actions</Text>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardContent className="p-4 items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <Text className="text-2xl font-bold">{stats?.totalItems ?? 0}</Text>
              <Text className="text-xs text-muted-foreground">Items</Text>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardContent className="p-4 items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <Text className="text-2xl font-bold">
                {stats?.lastActivityAt ? formatTimeAgo(stats.lastActivityAt) : '--'}
              </Text>
              <Text className="text-xs text-muted-foreground">Last Active</Text>
            </CardContent>
          </Card>
        </View>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="gap-2">
            {isActivityLoading ? (
              <View className="gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </View>
            ) : !recentActivity?.length ? (
              <Text className="text-muted-foreground text-center py-4">No recent activity</Text>
            ) : (
              recentActivity.slice(0, 10).map((entry, i) => (
                <View key={i}>
                  <View className="flex-row items-center gap-3 py-2">
                    <View className="flex-1">
                      <Text className="text-sm font-medium">{entry.title as string}</Text>
                      <Text className="text-xs text-muted-foreground">
                        {formatTimeAgo(entry.createdAt as string | Date)}
                      </Text>
                    </View>
                  </View>
                  {i < Math.min(recentActivity.length, 10) - 1 && <Separator />}
                </View>
              ))
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatTimeAgo(input: string | Date): string {
  const now = new Date();
  const date = input instanceof Date ? input : new Date(input);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 30) return `${diffDays}d`;
  return date.toLocaleDateString();
}
