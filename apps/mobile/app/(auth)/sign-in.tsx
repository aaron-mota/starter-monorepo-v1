import React from 'react';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Loader2 } from '@/lib/icons';
import { useKeyboard } from '@/lib/keyboard';

export default function SignIn() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const { dismissKeyboard } = useKeyboard();
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState('');

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');

  // 2FA state
  const [needsSecondFactor, setNeedsSecondFactor] = React.useState(false);
  const [secondFactorCode, setSecondFactorCode] = React.useState('');

  const onSignInPress = async () => {
    if (!isLoaded || isPending) return;
    dismissKeyboard();
    setIsPending(true);
    setError('');

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
      } else if (signInAttempt.status === 'needs_second_factor') {
        await signIn.prepareSecondFactor({ strategy: 'email_code' });
        setNeedsSecondFactor(true);
      } else {
        setError('Sign in could not be completed. Please try again.');
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ longMessage?: string }> };
      setError(clerkError.errors?.[0]?.longMessage ?? 'Something went wrong. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  const onSecondFactorPress = async () => {
    if (!isLoaded || isPending) return;
    dismissKeyboard();
    setIsPending(true);
    setError('');

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code: secondFactorCode,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      } else {
        setError('Verification could not be completed. Please try again.');
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: Array<{ longMessage?: string }> };
      setError(clerkError.errors?.[0]?.longMessage ?? 'Invalid code. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  if (needsSecondFactor) {
    return (
      <View className="flex-1">
        <View className="flex-1 justify-center p-5">
          <Text className="text-2xl font-bold mb-2 text-center">Two-Factor Authentication</Text>
          <Text className="text-muted-foreground text-center mb-5">Enter the verification code sent to your email</Text>

          {error ? <Text className="text-destructive text-center mb-4">{error}</Text> : null}

          <Input
            value={secondFactorCode}
            placeholder="Enter verification code"
            onChangeText={setSecondFactorCode}
            className="mb-4"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            editable={!isPending}
          />

          <Button onPress={onSecondFactorPress} className="mt-2" disabled={isPending}>
            {isPending ? (
              <View className="flex-row items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                <Text>Verifying...</Text>
              </View>
            ) : (
              <Text>Verify</Text>
            )}
          </Button>

          <Button
            variant="ghost"
            className="mt-3"
            onPress={() => {
              setNeedsSecondFactor(false);
              setSecondFactorCode('');
              setError('');
            }}
          >
            <Text>Back to Sign In</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="flex-1 justify-center p-5">
        <Text className="text-2xl font-bold mb-5 text-center">Sign In</Text>

        {error ? <Text className="text-destructive text-center mb-4">{error}</Text> : null}

        <Input
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Email address"
          onChangeText={setEmailAddress}
          className="mb-4"
          editable={!isPending}
        />

        <Input
          value={password}
          placeholder="Password"
          secureTextEntry
          onChangeText={setPassword}
          className="mb-4"
          editable={!isPending}
        />

        <Button onPress={onSignInPress} className="mt-2" disabled={isPending}>
          {isPending ? (
            <View className="flex-row items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
              <Text>Signing in...</Text>
            </View>
          ) : (
            <Text>Sign In</Text>
          )}
        </Button>

        <View className="flex-row justify-center mt-5">
          <Text className="mr-1">Don&apos;t have an account?</Text>
          <Text
            className="text-primary font-bold"
            onPress={() =>
              router.replace({
                pathname: '/(auth)/sign-up',
              })
            }
          >
            Sign Up
          </Text>
        </View>
      </View>
    </View>
  );
}
