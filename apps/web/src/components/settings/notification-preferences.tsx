'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { getCurrentPushSubscription, subscribeToPush, unsubscribeFromPush } from '@/lib/services/push/subscribe-client';

interface NotificationPreferencesProps {
  notifyOnTagScan?: boolean;
  notifyOnFamilyScan?: boolean;
}

export function NotificationPreferences({
  notifyOnTagScan: initialTagScan = true,
  notifyOnFamilyScan: initialFamilyScan = false,
}: NotificationPreferencesProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifyOnTagScan, setNotifyOnTagScan] = useState(initialTagScan);
  const [notifyOnFamilyScan, setNotifyOnFamilyScan] = useState(initialFamilyScan);
  const [error, setError] = useState<string | null>(null);
  const [endpoint, setEndpoint] = useState<string | null>(null);

  useEffect(() => {
    getCurrentPushSubscription().then((sub) => {
      setIsSubscribed(!!sub);
      setEndpoint(sub?.endpoint || null);
      setIsLoading(false);
    });
  }, []);

  const handleTogglePush = useCallback(async (enabled: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      if (enabled) {
        const sub = await subscribeToPush();
        setIsSubscribed(!!sub);
        setEndpoint(sub?.endpoint || null);
      } else {
        await unsubscribeFromPush();
        setIsSubscribed(false);
        setEndpoint(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update push notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePreferenceChange = useCallback(
    async (key: 'notifyOnTagScan' | 'notifyOnFamilyScan', value: boolean) => {
      if (!endpoint) return;

      if (key === 'notifyOnTagScan') setNotifyOnTagScan(value);
      if (key === 'notifyOnFamilyScan') setNotifyOnFamilyScan(value);

      try {
        await fetch('/api/push/subscribe', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint, [key]: value }),
        });
      } catch {
        // Revert on failure
        if (key === 'notifyOnTagScan') setNotifyOnTagScan(!value);
        if (key === 'notifyOnFamilyScan') setNotifyOnFamilyScan(!value);
      }
    },
    [endpoint]
  );

  const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;

  if (!supported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BellOff className="h-4 w-4" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Push notifications are not supported in this browser.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Enable push notifications</p>
            <p className="text-sm text-muted-foreground">Get notified about important events.</p>
          </div>
          <Switch checked={isSubscribed} onCheckedChange={handleTogglePush} disabled={isLoading} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {isSubscribed && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notify on my activity</p>
                <p className="text-xs text-muted-foreground">Receive a push when there is activity on your items.</p>
              </div>
              <Switch checked={notifyOnTagScan} onCheckedChange={(v) => handlePreferenceChange('notifyOnTagScan', v)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notify on team activity</p>
                <p className="text-xs text-muted-foreground">Get notified when team members have activity.</p>
              </div>
              <Switch
                checked={notifyOnFamilyScan}
                onCheckedChange={(v) => handlePreferenceChange('notifyOnFamilyScan', v)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
