import React from 'react';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Loader2 } from '@/lib/icons';
import { useKeyboard } from '@/lib/keyboard';

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const { dismissKeyboard } = useKeyboard();
  const [isPending, setIsPending] = React.useState(false);

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');

  const onSignUpPress = async () => {
    if (!isLoaded || isPending) return;
    dismissKeyboard();
    setIsPending(true);

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsPending(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded || isPending) return;
    dismissKeyboard();
    setIsPending(true);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsPending(false);
    }
  };

  if (pendingVerification) {
    return (
      <View className="flex-1">
        <View className="flex-1 justify-center p-5">
          <Text className="text-2xl font-bold mb-5 text-center">Verify your email</Text>
          <Input
            value={code}
            placeholder="Enter verification code"
            onChangeText={setCode}
            className="mb-4"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            editable={!isPending}
          />
          <Button onPress={onVerifyPress} className="mt-2" disabled={isPending}>
            {isPending ? (
              <View className="flex-row items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                <Text>Verifying...</Text>
              </View>
            ) : (
              <Text>Verify</Text>
            )}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="flex-1 justify-center p-5">
        <Text className="text-2xl font-bold mb-5 text-center">Sign Up</Text>

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

        <Button onPress={onSignUpPress} className="mt-2" disabled={isPending}>
          {isPending ? (
            <View className="flex-row items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
              <Text>Signing up...</Text>
            </View>
          ) : (
            <Text>Sign Up</Text>
          )}
        </Button>

        <View className="flex-row justify-center mt-5">
          <Text className="mr-1">Already have an account?</Text>
          <Text
            className="text-primary font-bold"
            onPress={() =>
              router.replace({
                pathname: '/(auth)/sign-in',
              })
            }
          >
            Sign In
          </Text>
        </View>
      </View>
    </View>
  );
}
