import SplashScreenController from '@/components/splash-screen-controller';
import { TRPCProvider } from '@/components/trpc/trpc-provider';

import '@/global.css';

import { useEffect, useLayoutEffect } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Appearance, Platform, Text as RNText, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Theme } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { setAndroidNavigationBar } from '@/lib/android-navigation-bar';
import { NAV_THEME } from '@/lib/constants';

import 'react-native-reanimated';

import { Toaster } from 'sonner-native';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export { ErrorBoundary } from 'expo-router';

const usePlatformSpecificSetup = Platform.select({
  web: useSetWebBackgroundClassName,
  android: useSetAndroidNavigationBar,
  default: noop,
});

export const unstable_settings = {
  anchor: '(tabs)',
};

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
const isClerkConfigured = clerkPublishableKey.length > 15 && !clerkPublishableKey.includes('...');

export default function RootLayout() {
  usePlatformSpecificSetup();

  if (!isClerkConfigured) {
    return <EnvSetupScreen />;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <TRPCProvider>
        <InitialLayout />
      </TRPCProvider>
    </ClerkProvider>
  );
}

function InitialLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const { isSignedIn } = useAuth();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <SplashScreenController>
          <StatusBar style="auto" />

          <Stack>
            {/* SIGNED OUT */}
            <Stack.Protected guard={Boolean(!isSignedIn)}>
              <Stack.Screen
                name="(auth)"
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Protected>

            {/* SIGNED IN */}
            <Stack.Protected guard={Boolean(isSignedIn)}>
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Protected>

            <Stack.Screen name="+not-found" />
          </Stack>

          <PortalHost />
          <Toaster />
        </SplashScreenController>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const useIsomorphicLayoutEffect = Platform.OS === 'web' && typeof window === 'undefined' ? useEffect : useLayoutEffect;

function useSetWebBackgroundClassName() {
  useIsomorphicLayoutEffect(() => {
    document.documentElement.classList.add('bg-background');
  }, []);
}

function useSetAndroidNavigationBar() {
  useLayoutEffect(() => {
    setAndroidNavigationBar(Appearance.getColorScheme() ?? 'light');
  }, []);
}

function noop() {}

const MONO = Platform.select({ ios: 'Menlo', default: 'monospace' });
const TAB_LABELS = ['Dashboard', 'Items', 'Analytics', 'Groups', 'Settings'];

function EnvSetupScreen() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Main content area — empty app shell */}
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
          <RNText style={{ fontSize: 22, fontWeight: 'bold', color: '#09090b' }}>Dashboard</RNText>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <RNText style={{ fontSize: 15, color: '#a1a1aa' }}>No data yet</RNText>
          </View>
        </View>
      </SafeAreaView>

      {/* Setup banner — pinned above tab bar */}
      <View
        style={{
          marginHorizontal: 12,
          marginBottom: 8,
          backgroundColor: '#fef9c3',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#fde047',
          padding: 14,
        }}
      >
        <RNText style={{ fontSize: 14, fontWeight: '600', color: '#713f12', marginBottom: 4 }}>Setup required</RNText>
        <RNText style={{ fontSize: 13, color: '#854d0e', lineHeight: 18 }}>
          Add your Clerk key to{' '}
          <RNText style={{ fontFamily: MONO, fontSize: 12, color: '#713f12' }}>apps/mobile/.env</RNText>
          {'\n'}
          <RNText style={{ fontFamily: MONO, fontSize: 11, color: '#a16207' }}>
            EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
          </RNText>
        </RNText>
      </View>

      {/* Mock tab bar */}
      <View
        style={{
          flexDirection: 'row',
          borderTopWidth: 0.5,
          borderTopColor: '#e4e4e7',
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          backgroundColor: '#ffffff',
        }}
      >
        {TAB_LABELS.map((label, i) => (
          <View key={label} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: '#f4f4f5', marginBottom: 4 }} />
            <RNText style={{ fontSize: 10, color: i === 0 ? '#09090b' : '#a1a1aa' }}>{label}</RNText>
          </View>
        ))}
      </View>
    </View>
  );
}
