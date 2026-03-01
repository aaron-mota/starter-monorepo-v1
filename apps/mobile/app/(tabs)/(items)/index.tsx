import { useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from '@/components/safe-area-view';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRefresh } from '@/hooks/use-refresh';
import { ChevronRight, Search, Star } from '@/lib/icons';
import { trpc } from '@/lib/trpc';

export default function ItemsScreen() {
  const { ownerId, isLoading: isUserLoading } = useCurrentUser();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { refreshing, onRefresh } = useRefresh();

  const { data: items, isLoading: isItemsLoading } = trpc.item.getAll.useQuery(
    { ownerId: ownerId! },
    { enabled: !!ownerId }
  );

  const isLoading = isUserLoading || isItemsLoading;

  const allItems = items ?? [];
  const filteredItems = search
    ? allItems.filter((item) => (item.name as string).toLowerCase().includes(search.toLowerCase()))
    : allItems;

  const topItems = allItems.slice(0, 3);

  if (isLoading) {
    return (
      <SafeAreaView>
        <View className="gap-4 pt-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id as string}
        contentContainerClassName="gap-3 pb-8 pt-4"
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <View className="gap-4">
            {/* Search */}
            <View className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
              <Input placeholder="Search items..." value={search} onChangeText={setSearch} className="pl-10" />
            </View>

            {/* Top Items */}
            {topItems.length > 0 && !search && (
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <Text className="text-sm font-medium text-muted-foreground">Recent</Text>
                </View>
                <View className="flex-row gap-2">
                  {topItems.map((item) => (
                    <Pressable
                      key={item.id as string}
                      onPress={() =>
                        router.push({ pathname: '/(tabs)/(items)/[id]', params: { id: item.id as string } })
                      }
                    >
                      <Badge variant="secondary" className="flex-row gap-1 px-3 py-1.5">
                        <Text className="text-xs">{item.name as string}</Text>
                      </Badge>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Items Header */}
            <Text className="text-sm font-medium text-muted-foreground">Your Items ({filteredItems.length})</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/(tabs)/(items)/[id]', params: { id: item.id as string } })}
          >
            <Card>
              <CardContent className="flex-row items-center p-4 gap-3">
                <View className="flex-1">
                  <Text className="font-medium">{item.name as string}</Text>
                  {item.description && (
                    <Text className="text-xs text-muted-foreground">{item.description as string}</Text>
                  )}
                </View>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text className="text-muted-foreground text-center py-8">
            {search ? 'No items match your search' : 'No items yet'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}
