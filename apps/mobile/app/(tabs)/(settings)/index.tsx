import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/clerk-expo';
import { Alert, Linking, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from '@/components/safe-area-view';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useDeviceInfo } from '@/hooks/use-device-info';
import { useRefresh } from '@/hooks/use-refresh';
import { Bell, ExternalLink, LogOut, Mail, Smartphone, Trash2 } from '@/lib/icons';
import { trpc } from '@/lib/trpc';

export default function SettingsScreen() {
  const { signOut } = useClerk();
  const { clerkUser, user, ownerId, isLoading } = useCurrentUser();
  const deviceInfo = useDeviceInfo();
  const { refreshing, onRefresh } = useRefresh();
  const utils = trpc.useUtils();

  // Notification preferences (local state, synced from DB on mount)
  const [notifyOnActivity, setNotifyOnActivity] = useState(true);
  const [notifyOnGroupActivity, setNotifyOnGroupActivity] = useState(false);
  const [emailDigestEnabled, setEmailDigestEnabled] = useState(false);

  const nativeDeviceId = deviceInfo?.nativeDeviceId ?? '';
  const { data: deviceRegistration } = trpc.deviceRegistration.getSingleWhere.useQuery(
    { nativeDeviceId },
    { enabled: !!nativeDeviceId }
  );

  const { data: allDevices, isLoading: isDevicesLoading } = trpc.deviceRegistration.getAll.useQuery(undefined, {
    enabled: !!ownerId,
  });

  useEffect(() => {
    if (deviceRegistration) {
      setNotifyOnActivity(deviceRegistration.notifyOnTagScan ?? true);
      setNotifyOnGroupActivity(deviceRegistration.notifyOnFamilyScan ?? false);
    }
  }, [deviceRegistration]);

  useEffect(() => {
    if (user) {
      setEmailDigestEnabled(((user as Record<string, unknown>).emailDigestEnabled as boolean) ?? false);
    }
  }, [user]);

  const updatePrefsMutation = trpc.deviceRegistration.updateNotificationPreferences.useMutation();
  const updateUserMutation = trpc.user.update.useMutation({
    onSuccess: () => utils.user.getSingleWhere.invalidate(),
  });
  const deleteDeviceMutation = trpc.deviceRegistration.delete.useMutation({
    onSuccess: () => utils.deviceRegistration.getAll.invalidate(),
  });

  function handleToggleActivity(value: boolean) {
    setNotifyOnActivity(value);
    if (deviceInfo?.nativeDeviceId) {
      updatePrefsMutation.mutate({
        nativeDeviceId: deviceInfo.nativeDeviceId,
        notifyOnTagScan: value,
      });
    }
  }

  function handleToggleGroupActivity(value: boolean) {
    setNotifyOnGroupActivity(value);
    if (deviceInfo?.nativeDeviceId) {
      updatePrefsMutation.mutate({
        nativeDeviceId: deviceInfo.nativeDeviceId,
        notifyOnFamilyScan: value,
      });
    }
  }

  function handleToggleEmailDigest(value: boolean) {
    setEmailDigestEnabled(value);
    if (ownerId) {
      updateUserMutation.mutate({ id: ownerId, emailDigestEnabled: value });
    }
  }

  const plan = (user?.plan as string) || 'free';

  if (isLoading) {
    return (
      <SafeAreaView>
        <View className="gap-4 pt-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
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
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Name</Text>
              <Text className="font-medium">{user?.name || clerkUser?.fullName || '--'}</Text>
            </View>
            <Separator />
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Email</Text>
              <Text className="font-medium">{clerkUser?.primaryEmailAddress?.emailAddress || '--'}</Text>
            </View>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <CardTitle className="text-lg">Subscription</CardTitle>
              <Badge variant={plan === 'pro' ? 'default' : 'secondary'}>
                <Text className="text-xs font-bold">{plan.toUpperCase()}</Text>
              </Badge>
            </View>
          </CardHeader>
          <CardContent className="gap-3">
            <Button
              variant="outline"
              className="flex-row gap-2 mt-1"
              onPress={() =>
                Linking.openURL(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/settings`)
              }
            >
              <ExternalLink className="h-4 w-4 text-foreground" />
              <Text>{plan === 'pro' ? 'Manage Billing' : 'Upgrade to Pro'}</Text>
            </Button>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader>
            <View className="flex-row items-center gap-2">
              <Smartphone className="h-5 w-5 text-foreground" />
              <CardTitle className="text-lg">Devices</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="gap-2">
            {isDevicesLoading ? (
              <View className="gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </View>
            ) : !allDevices?.length ? (
              <Text className="text-muted-foreground text-center py-4">No devices registered</Text>
            ) : (
              allDevices.map((device, i) => {
                const isCurrentDevice = (device.nativeDeviceId as string) === nativeDeviceId;
                return (
                  <View key={device.id}>
                    <View className="flex-row items-center gap-3 py-2">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-sm font-medium">
                            {(device.deviceName as string) || (device.model as string) || 'Unknown Device'}
                          </Text>
                          {isCurrentDevice && (
                            <Badge variant="secondary">
                              <Text className="text-xs">This device</Text>
                            </Badge>
                          )}
                        </View>
                        <Text className="text-xs text-muted-foreground">
                          {(device.platform as string) || ''}
                          {device.osVersion ? ` ${device.osVersion as string}` : ''}
                          {device.updatedAt ? ` · ${formatTimeAgo(device.updatedAt as string | Date)}` : ''}
                        </Text>
                      </View>
                      {!isCurrentDevice && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onPress={() => {
                            Alert.alert('Remove Device', 'Remove this device from your account?', [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Remove',
                                style: 'destructive',
                                onPress: () => deleteDeviceMutation.mutate({ id: device.id }),
                              },
                            ]);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </View>
                    {i < allDevices.length - 1 && <Separator />}
                  </View>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <View className="flex-row items-center gap-2">
              <Bell className="h-5 w-5 text-foreground" />
              <CardTitle className="text-lg">Notifications</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="font-medium">Activity alerts</Text>
                <Text className="text-xs text-muted-foreground">Get notified about activity on your items</Text>
              </View>
              <Switch checked={notifyOnActivity} onCheckedChange={handleToggleActivity} />
            </View>
            <Separator />
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="font-medium">Group activity</Text>
                <Text className="text-xs text-muted-foreground">Get notified about group member activity</Text>
              </View>
              <Switch checked={notifyOnGroupActivity} onCheckedChange={handleToggleGroupActivity} />
            </View>
            <Separator />
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <View className="flex-row items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Text className="font-medium">Weekly summary</Text>
                </View>
                <Text className="text-xs text-muted-foreground">
                  Receive a weekly email with your activity highlights
                </Text>
              </View>
              <Switch checked={emailDigestEnabled} onCheckedChange={handleToggleEmailDigest} />
            </View>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="flex-row gap-2"
          onPress={() => {
            Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Sign Out',
                style: 'destructive',
                onPress: () => signOut(),
              },
            ]);
          }}
        >
          <LogOut className="h-4 w-4 text-foreground" />
          <Text>Sign Out</Text>
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
