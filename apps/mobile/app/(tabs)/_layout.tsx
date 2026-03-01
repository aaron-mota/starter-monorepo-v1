import { useEffect } from 'react';
import { StackActions } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { Platform, Pressable } from 'react-native';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useAutoRegisterDevice } from '@/hooks/use-auto-register-device';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePushRegistration } from '@/hooks/use-push-registration';
import { NAV_THEME } from '@/lib/constants';
import { BarChart3, LayoutDashboard, List, Settings, Users } from '@/lib/icons';
import { setupNotificationHandler, setupNotificationResponseListener } from '@/lib/notification-handler';

// Configure foreground notification display
setupNotificationHandler();

function HapticTabButton({ children, style, onPress, accessibilityRole, testID }: BottomTabBarButtonProps) {
  return (
    <Pressable
      style={style}
      accessibilityRole={accessibilityRole}
      testID={testID}
      onPress={(e) => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.(e);
      }}
    >
      {children}
    </Pressable>
  );
}

export default function TabLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;
  const { ownerId } = useCurrentUser();
  useAutoRegisterDevice(ownerId);
  usePushRegistration(ownerId);

  // Set up notification tap handler
  useEffect(() => {
    const cleanup = setupNotificationResponseListener();
    return cleanup;
  }, []);

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
        tabBarButton: HapticTabButton,
      }}
    >
      <Tabs.Screen
        name="(dashboard)"
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="(items)"
        options={{
          tabBarLabel: 'Items',
          tabBarIcon: ({ color, size }) => <List color={color} size={size} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            const state = navigation.getState();
            const itemsRoute = state.routes.find((r: { name: string }) => r.name === '(items)');
            // If the items stack has nested screens, pop back to the root
            if (itemsRoute?.state?.key && (itemsRoute.state.index ?? 0) > 0) {
              navigation.dispatch({
                ...StackActions.popToTop(),
                target: itemsRoute.state.key,
              });
            } else {
              // Otherwise just switch to the items tab normally
              navigation.navigate('(items)');
            }
          },
        })}
      />
      <Tabs.Screen
        name="(analytics)"
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="(groups)"
        options={{
          tabBarLabel: 'Groups',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
