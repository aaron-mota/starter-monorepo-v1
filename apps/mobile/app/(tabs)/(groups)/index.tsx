import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Alert, Linking, RefreshControl, ScrollView, View } from 'react-native';
import { toast } from 'sonner-native';
import { SafeAreaView } from '@/components/safe-area-view';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useRefresh } from '@/hooks/use-refresh';
import { Copy, Trophy, Users } from '@/lib/icons';
import { trpc } from '@/lib/trpc';

export default function GroupsScreen() {
  const { user, ownerId, isLoading: isUserLoading } = useCurrentUser();
  const [inviteCode, setInviteCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const utils = trpc.useUtils();
  const { refreshing, onRefresh } = useRefresh();

  const groupId = user?.familyId;

  const { data: group, isLoading: isGroupLoading } = trpc.family.getSingleById.useQuery(
    { id: groupId! },
    { enabled: !!groupId }
  );

  const memberIds = (group?.memberIds as string[]) ?? [];

  const { data: members, isLoading: isMembersLoading } = trpc.family.getMembers.useQuery(
    { memberIds },
    { enabled: memberIds.length > 0 }
  );

  const { data: groupActivity, isLoading: isGroupActivityLoading } = trpc.stats.getFamilyActivity.useQuery(
    { memberIds, limit: 20 },
    { enabled: memberIds.length > 0, refetchInterval: 30_000 }
  );

  const isPro = user?.plan === 'pro';

  const { data: leaderboard, isLoading: isLeaderboardLoading } = trpc.stats.getFamilyLeaderboard.useQuery(
    { familyId: groupId!, days: 30 },
    { enabled: !!groupId && isPro }
  );

  const joinGroup = trpc.family.joinByInviteCode.useMutation({
    onSuccess: async () => {
      toast.success('Joined group!');
      setInviteCode('');
      await utils.user.getSingleWhere.invalidate();
      await utils.family.getSingleWhere.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const createGroup = trpc.family.create.useMutation({
    onSuccess: async () => {
      toast.success('Group created!');
      setGroupName('');
      await utils.user.getSingleWhere.invalidate();
      await utils.family.getSingleWhere.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const leaveGroup = trpc.family.leaveFamily.useMutation({
    onSuccess: async () => {
      toast.success('Left group');
      await utils.user.getSingleWhere.invalidate();
      await utils.family.getSingleWhere.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const isLoading = isUserLoading || isGroupLoading;

  if (isLoading) {
    return (
      <SafeAreaView>
        <View className="gap-4 pt-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </View>
      </SafeAreaView>
    );
  }

  // No group -- show join + create screen
  if (!groupId || !group) {
    return (
      <SafeAreaView edges={['bottom']}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 pb-8 pt-4"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Join a Group</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <Text className="text-sm text-muted-foreground">Enter an invite code to join a group.</Text>
              <Input
                placeholder="Enter invite code"
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="characters"
                maxLength={8}
              />
              <Button
                onPress={() => {
                  if (ownerId && inviteCode.length === 8) {
                    joinGroup.mutate({ inviteCode, userId: ownerId });
                  }
                }}
                disabled={inviteCode.length !== 8 || joinGroup.isPending}
              >
                <Text className="text-primary-foreground font-medium">Join Group</Text>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create a Group</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <Text className="text-sm text-muted-foreground">Start a new group and invite others.</Text>
              <Input placeholder="Group name" value={groupName} onChangeText={setGroupName} maxLength={60} />
              <Button
                onPress={() => {
                  if (ownerId && groupName.trim().length > 0) {
                    createGroup.mutate({ name: groupName.trim(), ownerId });
                  }
                }}
                disabled={groupName.trim().length === 0 || createGroup.isPending}
              >
                <Text className="text-primary-foreground font-medium">Create Group</Text>
              </Button>
            </CardContent>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const isOwner = group.ownerId === ownerId;
  const isSoleMember = memberIds.length <= 1;
  const leaveButtonLabel = isOwner && isSoleMember ? 'Delete Group' : 'Leave Group';
  const leaveConfirmTitle = isOwner && isSoleMember ? 'Delete Group' : 'Leave Group';
  const leaveConfirmMessage =
    isOwner && isSoleMember
      ? 'You are the only member. This will permanently delete the group.'
      : isOwner
        ? 'Ownership will be transferred to another member.'
        : 'Are you sure you want to leave this group?';

  // Has group
  return (
    <SafeAreaView edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 pb-8 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Group Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{group.name}</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-muted-foreground">Invite Code</Text>
                <Text className="text-lg font-mono font-bold tracking-wider">{group.inviteCode}</Text>
              </View>
              <Button
                variant="outline"
                size="icon"
                onPress={async () => {
                  await Clipboard.setStringAsync(group.inviteCode);
                  toast.success('Invite code copied!');
                }}
              >
                <Copy className="h-4 w-4 text-foreground" />
              </Button>
            </View>
            <Button
              variant="outline"
              onPress={async () => {
                const message = `Join my group "${group.name}"! Use invite code: ${group.inviteCode}`;
                await Clipboard.setStringAsync(message);
                toast.success('Invite message copied!');
              }}
            >
              <Text>Copy Invite Message</Text>
            </Button>
          </CardContent>
        </Card>

        {/* Members */}
        <Card>
          <CardHeader>
            <View className="flex-row items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Members ({memberIds.length})</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="gap-2">
            {isMembersLoading ? (
              <View className="gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </View>
            ) : !members?.length ? (
              <Text className="text-muted-foreground text-center py-4">No members yet</Text>
            ) : (
              members.map((member, i) => (
                <View key={member.id}>
                  <View className="flex-row items-center gap-3 py-2">
                    <View className="h-10 w-10 rounded-full bg-secondary items-center justify-center">
                      <Text className="text-lg font-medium">
                        {(member.name || member.email || '?').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="font-medium">{member.name || 'Member'}</Text>
                        {member.id === group.ownerId && (
                          <Badge variant="secondary">
                            <Text className="text-xs">Owner</Text>
                          </Badge>
                        )}
                      </View>
                      <Text className="text-xs text-muted-foreground">{member.email}</Text>
                    </View>
                  </View>
                  {i < members.length - 1 && <Separator />}
                </View>
              ))
            )}
          </CardContent>
        </Card>

        {/* Group Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Group Activity</CardTitle>
          </CardHeader>
          <CardContent className="gap-2">
            {isGroupActivityLoading ? (
              <View className="gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </View>
            ) : !groupActivity?.length ? (
              <Text className="text-muted-foreground text-center py-4">No group activity yet</Text>
            ) : (
              groupActivity.slice(0, 10).map((entry, i) => (
                <View key={i}>
                  <View className="flex-row items-center gap-3 py-2">
                    <View className="h-8 w-8 rounded-full bg-secondary items-center justify-center">
                      <Text className="text-sm font-medium">
                        {((entry.scannedByName as string) || '?').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-medium">{entry.tagName as string}</Text>
                      <Text className="text-xs text-muted-foreground">
                        {entry.scannedByName ? `${entry.scannedByName as string} · ` : ''}
                        {formatTimeAgo(entry.scannedAt as string | Date)}
                      </Text>
                    </View>
                  </View>
                  {i < Math.min(groupActivity.length, 10) - 1 && <Separator />}
                </View>
              ))
            )}
          </CardContent>
        </Card>

        {/* Leaderboard (Pro only) */}
        {isPro && (
          <Card>
            <CardHeader>
              <View className="flex-row items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <CardTitle className="text-lg">Leaderboard</CardTitle>
              </View>
            </CardHeader>
            <CardContent className="gap-2">
              {isLeaderboardLoading ? (
                <View className="gap-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </View>
              ) : !leaderboard?.length ? (
                <Text className="text-muted-foreground text-center py-4">No data yet</Text>
              ) : (
                leaderboard.map((entry, i) => {
                  const medalColor =
                    i === 0
                      ? 'text-yellow-500'
                      : i === 1
                        ? 'text-gray-400'
                        : i === 2
                          ? 'text-amber-700'
                          : 'text-muted-foreground';
                  return (
                    <View key={entry.memberId as string}>
                      <View className="flex-row items-center gap-3 py-2">
                        <Text className={`text-lg font-bold w-6 text-center ${medalColor}`}>{i + 1}</Text>
                        <View className="h-8 w-8 rounded-full bg-secondary items-center justify-center">
                          <Text className="text-sm font-medium">
                            {((entry.memberName as string) || '?').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="font-medium">{entry.memberName as string}</Text>
                        </View>
                        <Text className="font-bold">{entry.totalScans as number}</Text>
                      </View>
                      {i < leaderboard.length - 1 && <Separator />}
                    </View>
                  );
                })
              )}
            </CardContent>
          </Card>
        )}

        {!isPro && (
          <Card>
            <CardContent className="items-center gap-3 p-6">
              <Trophy className="h-8 w-8 text-muted-foreground" />
              <Text className="text-sm text-muted-foreground text-center">
                Upgrade to Pro to see the group leaderboard
              </Text>
              <Button
                variant="outline"
                onPress={() =>
                  Linking.openURL(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/settings`)
                }
              >
                <Text>Upgrade to Pro</Text>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Leave/Delete Group */}
        <Button
          variant="destructive"
          onPress={() => {
            Alert.alert(leaveConfirmTitle, leaveConfirmMessage, [
              { text: 'Cancel', style: 'cancel' },
              {
                text: isOwner && isSoleMember ? 'Delete' : 'Leave',
                style: 'destructive',
                onPress: () => {
                  if (ownerId) {
                    leaveGroup.mutate({ userId: ownerId, familyId: group.id });
                  }
                },
              },
            ]);
          }}
          disabled={leaveGroup.isPending}
        >
          <Text className="text-destructive-foreground font-medium">{leaveButtonLabel}</Text>
        </Button>
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

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
