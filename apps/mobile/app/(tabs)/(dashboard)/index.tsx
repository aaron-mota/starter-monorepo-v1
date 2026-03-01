import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from '@/components/safe-area-view';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRefresh } from '@/hooks/use-refresh';
import { Activity, Clock, Hash } from '@/lib/icons';

export default function DashboardScreen() {
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { refreshing, onRefresh } = useRefresh();

  if (isUserLoading) {
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
        <Text className="text-xl font-bold">Welcome{user?.name ? `, ${user.name}` : ''}</Text>

        <View className="flex-row gap-3">
          <Card className="flex-1">
            <CardContent className="p-4 items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <Text className="text-2xl font-bold">0</Text>
              <Text className="text-xs text-muted-foreground">Total Actions</Text>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardContent className="p-4 items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <Text className="text-2xl font-bold">0</Text>
              <Text className="text-xs text-muted-foreground">Items</Text>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardContent className="p-4 items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <Text className="text-2xl font-bold">--</Text>
              <Text className="text-xs text-muted-foreground">Last Active</Text>
            </CardContent>
          </Card>
        </View>

        <View className="items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8">
          <Text className="text-sm text-muted-foreground">Dashboard stats coming soon</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
