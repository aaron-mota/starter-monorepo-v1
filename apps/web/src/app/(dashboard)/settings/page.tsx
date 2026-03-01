'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Mail, Monitor, Smartphone, Trash2, XCircle } from 'lucide-react';
import { PLAN_LIMITS } from '@starter/shared/constants/plans';
import { NotificationPreferences } from '@/components/settings/notification-preferences';
import { PageHeader } from '@/components/shared/page-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc, useCurrentUser } from '@/lib/hooks';
import { getEffectivePlan } from '@/lib/utils/get-effective-plan';

const VALID_TABS = ['account', 'devices', 'subscription', 'notifications'] as const;
type SettingsTab = (typeof VALID_TABS)[number];

function DevicesTab({ ownerId }: { ownerId: string }) {
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showManualRegister, setShowManualRegister] = useState(false);

  const utils = trpc.useUtils();
  const { data: devices, isLoading } = trpc.deviceRegistration.getManyMongo.useQuery({
    where: { userId: ownerId },
  });

  const createMutation = trpc.deviceRegistration.create.useMutation({
    onSuccess: () => utils.deviceRegistration.getManyMongo.invalidate(),
  });

  const deleteMutation = trpc.deviceRegistration.delete.useMutation({
    onSuccess: () => utils.deviceRegistration.getManyMongo.invalidate(),
  });

  // Check if this device is already registered by fetching the cookie value from a server endpoint
  useEffect(() => {
    fetch('/api/device/identify', { credentials: 'same-origin' })
      .then((res) => res.json())
      .then((data: { deviceId: string | null }) => setCurrentDeviceId(data.deviceId))
      .catch(() => setCurrentDeviceId(null));
  }, []);

  const handleRegister = useCallback(async () => {
    setIsRegistering(true);
    try {
      const deviceId = crypto.randomUUID();
      // 1. Create DeviceRegistration via tRPC
      await createMutation.mutateAsync({
        deviceId,
        deviceName: deviceName.trim() || undefined,
        userId: ownerId,
      });
      // 2. Set HTTP-only cookie via API route
      await fetch('/api/device/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
        credentials: 'same-origin',
      });
      setCurrentDeviceId(deviceId);
      setDeviceName('');
    } catch (err) {
      console.error('Failed to register device:', err);
    } finally {
      setIsRegistering(false);
    }
  }, [createMutation, deviceName, ownerId]);

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync({ id });
    },
    [deleteMutation]
  );

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  const isCurrentDeviceRegistered = devices?.some((d) => d.deviceId === currentDeviceId);

  const platformIcon = (platform?: string) => {
    if (platform === 'ios' || platform === 'android') return <Smartphone className="h-4 w-4 text-muted-foreground" />;
    return <Monitor className="h-4 w-4 text-muted-foreground" />;
  };

  const platformLabel = (platform?: string) => {
    if (platform === 'ios') return 'iOS';
    if (platform === 'android') return 'Android';
    return 'Web';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Registered Devices</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {devices && devices.length > 0 ? (
          <div className="space-y-3">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  {platformIcon(device.platform)}
                  <div>
                    <p className="text-sm font-medium">
                      {device.deviceName || device.model || 'Unnamed Device'}
                      {device.deviceId === currentDeviceId && (
                        <Badge variant="secondary" className="ml-2">
                          This device
                        </Badge>
                      )}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        {platformLabel(device.platform)}
                      </Badge>
                      {device.osVersion && <span>{device.osVersion}</span>}
                      {device.lastActiveAt && (
                        <span>Active {formatDistanceToNow(new Date(device.lastActiveAt), { addSuffix: true })}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(device.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No devices registered yet. Install the mobile app and sign in to automatically register your device.
          </p>
        )}

        {!isCurrentDeviceRegistered && (
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowManualRegister(!showManualRegister)}
              className="text-xs text-muted-foreground"
            >
              {showManualRegister ? 'Hide manual registration' : 'Register this browser manually'}
            </Button>
            {showManualRegister && (
              <div className="mt-3 space-y-3">
                <Input
                  placeholder="Device name (e.g. Aaron's Chrome)"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  maxLength={60}
                />
                <Button onClick={handleRegister} disabled={isRegistering} className="w-full" variant="outline">
                  <Monitor className="mr-2 h-4 w-4" />
                  {isRegistering ? 'Registering...' : 'Register This Browser'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StripeSubscriptionDetails {
  status: string;
  interval: 'month' | 'year' | null;
  amount: number | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

function SubscriptionTab({ plan }: { plan: 'free' | 'pro' }) {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(false);
  const [stripeDetails, setStripeDetails] = useState<StripeSubscriptionDetails | null>(null);

  const limits = PLAN_LIMITS[plan];

  useEffect(() => {
    if (plan !== 'pro') return;
    fetch('/api/stripe/subscription-status')
      .then((res) => res.json())
      .then((data: { subscription?: StripeSubscriptionDetails }) => {
        if (data.subscription) setStripeDetails(data.subscription);
      })
      .catch(() => {});
  }, [plan]);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const priceId =
        billingInterval === 'month'
          ? process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID
          : process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID;

      const res = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Failed to create checkout session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Failed to create portal session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your Pro subscription? You will lose access to Pro features.')) {
      return;
    }
    setIsLoading(true);
    try {
      await fetch('/api/stripe/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      window.location.reload();
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Your subscription has been activated. Welcome to Pro!</AlertDescription>
        </Alert>
      )}
      {canceled && (
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>Checkout was canceled. No changes were made.</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            Current Plan
            <Badge variant={plan === 'pro' ? 'default' : 'secondary'}>{plan.toUpperCase()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium">Max Items</p>
              <p className="text-lg font-bold">{limits.maxItems}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium">Max Team Members</p>
              <p className="text-lg font-bold">{limits.maxTeamMembers}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium">History Retention</p>
              <p className="text-lg font-bold">
                {limits.historyDays ? `${limits.historyDays} days` : 'Unlimited'}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium">Advanced Analytics</p>
              <p className="text-lg font-bold">{limits.advancedAnalytics ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {plan === 'free' && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={billingInterval === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBillingInterval('month')}
                >
                  Monthly — $4.99/mo
                </Button>
                <Button
                  variant={billingInterval === 'year' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBillingInterval('year')}
                >
                  Annual — $49/yr
                </Button>
              </div>
              <Button onClick={handleUpgrade} disabled={isLoading} className="w-full">
                {isLoading ? 'Redirecting...' : 'Upgrade to Pro'}
              </Button>
            </div>
          )}

          {plan === 'pro' && (
            <div className="space-y-4 border-t pt-4">
              {stripeDetails && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium">Billing</p>
                    <p className="text-lg font-bold">
                      ${stripeDetails.amount ?? '—'}/{stripeDetails.interval === 'year' ? 'yr' : 'mo'}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium">
                      {stripeDetails.cancelAtPeriodEnd ? 'Access Until' : 'Next Renewal'}
                    </p>
                    <p className="text-lg font-bold">
                      {stripeDetails.currentPeriodEnd
                        ? new Date(stripeDetails.currentPeriodEnd).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>
                </div>
              )}
              {stripeDetails?.cancelAtPeriodEnd && (
                <Alert>
                  <AlertDescription>
                    Your subscription is set to cancel at the end of the current period. You will retain Pro access
                    until then.
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleManageBilling} disabled={isLoading}>
                  Manage Billing
                </Button>
                {!stripeDetails?.cancelAtPeriodEnd && (
                  <Button variant="ghost" onClick={handleCancel} disabled={isLoading}>
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationsTab({ userId, emailDigestEnabled }: { userId?: string; emailDigestEnabled: boolean }) {
  const utils = trpc.useUtils();
  const updateMutation = trpc.user.update.useMutation({
    onSuccess: () => utils.user.getSingleWhere.invalidate(),
  });

  function handleDigestToggle(checked: boolean) {
    if (!userId) return;
    updateMutation.mutate({ id: userId, emailDigestEnabled: checked });
  }

  return (
    <div className="space-y-4">
      <NotificationPreferences />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" />
            Email Digest
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Weekly scan summary</p>
              <p className="text-sm text-muted-foreground">
                Receive a weekly email with your activity highlights.
              </p>
            </div>
            <Switch
              checked={emailDigestEnabled}
              onCheckedChange={handleDigestToggle}
              disabled={updateMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  const { clerkUser, user, ownerId, isLoading, error } = useCurrentUser();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab: SettingsTab = VALID_TABS.includes(tabParam as SettingsTab) ? (tabParam as SettingsTab) : 'account';
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  useEffect(() => {
    if (VALID_TABS.includes(tabParam as SettingsTab)) {
      setActiveTab(tabParam as SettingsTab);
    }
  }, [tabParam]);

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" />
        <Alert variant="destructive">
          <AlertDescription>Failed to load settings. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" description="Manage your account and preferences." />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  const plan = getEffectivePlan(user);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences." />
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTab)}>
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {clerkUser?.primaryEmailAddress?.emailAddress || 'Not available'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{user?.name || 'Not set'}</p>
              </div>
              <Button variant="outline" asChild>
                <a href="https://accounts.clerk.dev/user" target="_blank" rel="noopener noreferrer">
                  Manage Account
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="devices" className="space-y-6">
          {ownerId && <DevicesTab ownerId={ownerId} />}
        </TabsContent>
        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionTab plan={plan} />
        </TabsContent>
        <TabsContent value="notifications" className="space-y-6">
          <NotificationsTab userId={user?.id} emailDigestEnabled={user?.emailDigestEnabled ?? false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
