import SplashScreenController from '@/components/splash-screen-controller';
import { TRPCProvider } from '@/components/trpc/trpc-provider';

import '@/global.css';

import { useEffect, useLayoutEffect } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Appearance, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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

export default function RootLayout() {
  usePlatformSpecificSetup();

  return (
    <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
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
