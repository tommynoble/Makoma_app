import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingProvider } from '@/features/onboarding/OnboardingContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <OnboardingProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="chat/[matchId]" options={{ headerShown: true, title: 'Chat' }} />
          <Stack.Screen name="treats" options={{ headerShown: true, title: 'My treats' }} />
          <Stack.Screen name="settings/privacy" options={{ headerShown: true, title: 'Privacy' }} />
        </Stack>
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}
