import { useLocalSearchParams } from 'expo-router';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from '@/components/safe-area-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRefresh } from '@/hooks/use-refresh';
import { trpc } from '@/lib/trpc';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoading: isUserLoading } = useCurrentUser();
  const { refreshing, onRefresh } = useRefresh();

  const { data: item, isLoading: isItemLoading } = trpc.item.getSingleById.useQuery({ id: id! }, { enabled: !!id });

  const isLoading = isUserLoading || isItemLoading;

  if (isLoading) {
    return (
      <SafeAreaView>
        <View className="gap-4 pt-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-48 w-full" />
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView className="items-center justify-center">
        <Text className="text-muted-foreground">Item not found</Text>
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
        {/* Header */}
        <View>
          <Text className="text-2xl font-bold">{item.name}</Text>
          {item.description && <Text className="text-sm text-muted-foreground mt-1">{item.description}</Text>}
        </View>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Created</Text>
              <Text className="font-medium">
                {item.createdAt ? new Date(item.createdAt as string).toLocaleDateString() : '--'}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Updated</Text>
              <Text className="font-medium">
                {item.updatedAt ? new Date(item.updatedAt as string).toLocaleDateString() : '--'}
              </Text>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
