import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { SplashScreen } from 'expo-router';
import type { PropsWithChildren } from 'react';

SplashScreen.preventAutoHideAsync();

export default function SplashScreenController({ children }: PropsWithChildren) {
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    SplashScreen.hideAsync();
  }, [isLoaded, isSignedIn]);

  return <>{children}</>;
}
