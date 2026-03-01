import { Stack } from 'expo-router';
import { Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { NAV_THEME } from '@/lib/constants';
import { Moon, Sun } from '@/lib/icons';

export default function AnalyticsLayout() {
  const { isDarkColorScheme, toggleColorScheme } = useColorScheme();
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

  return (
    <Stack
      screenOptions={{
        headerRight: () => (
          <Pressable
            onPress={toggleColorScheme}
            hitSlop={8}
            style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
          >
            {isDarkColorScheme ? <Sun size={22} color={theme.text} /> : <Moon size={22} color={theme.text} />}
          </Pressable>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Analytics',
        }}
      />
    </Stack>
  );
}
