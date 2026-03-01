import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from '@/components/safe-area-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRefresh } from '@/hooks/use-refresh';
import { Users } from '@/lib/icons';

export default function GroupsScreen() {
  const { isLoading: isUserLoading } = useCurrentUser();
  const { refreshing, onRefresh } = useRefresh();

  if (isUserLoading) {
    return (
      <SafeAreaView>
        <View className="gap-4 pt-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
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
        <View className="items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12">
          <Users className="h-10 w-10 text-muted-foreground mb-3" />
          <Text className="text-lg font-semibold text-muted-foreground">Groups</Text>
          <Text className="text-sm text-muted-foreground">Coming soon</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
