import { useEffect } from 'react';
import { MaterialSymbolsRounded_400Regular } from '@expo-google-fonts/material-symbols-rounded/400Regular';
import { MaterialSymbolsRounded_400Regular_Filled } from '@expo-google-fonts/material-symbols-rounded/400Regular_Filled';
import { Fraunces_400Regular } from '@expo-google-fonts/fraunces/400Regular';
import { Fraunces_400Regular_Italic } from '@expo-google-fonts/fraunces/400Regular_Italic';
import { Fraunces_500Medium } from '@expo-google-fonts/fraunces/500Medium';
import { Fraunces_500Medium_Italic } from '@expo-google-fonts/fraunces/500Medium_Italic';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Fraunces_600SemiBold_Italic } from '@expo-google-fonts/fraunces/600SemiBold_Italic';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingProvider, useOnboarding } from '@/features/onboarding/onboarding-context';
import { SocialProvider, useSocial } from '@/features/social/social-store';
import { colors, fonts } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Runtime loading works in Expo Go and on web. For store builds, also embed
  // these with the expo-font config plugin so they are ready at launch.
  const [loaded, error] = useFonts({
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_500Medium,
    Fraunces_500Medium_Italic,
    Fraunces_600SemiBold,
    Fraunces_600SemiBold_Italic,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    MaterialSymbolsRounded_400Regular,
    MaterialSymbolsRounded_400Regular_Filled,
  });

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <OnboardingProvider>
          <SocialProvider>
            <StatusBar style="dark" />
            <AppStack />
          </SocialProvider>
        </OnboardingProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Keeps the splash screen up until saved data has been restored, so nothing flashes. */
function AppStack() {
  // With Reduce Motion on, screens crossfade instead of sliding.
  const reduced = useReducedMotion();
  const me = useOnboarding();
  const social = useSocial();
  const ready = me.hydrated && social.hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const header = { headerShown: true, headerBackButtonDisplayMode: 'minimal' as const };
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: reduced ? 'fade' : 'default',
        contentStyle: { backgroundColor: colors.surface },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.onSurface,
        headerTitleStyle: { fontFamily: fonts.serifMedium, fontSize: 20 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="reply"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.85, 1],
          sheetCornerRadius: 36,
          contentStyle: { backgroundColor: colors.surfaceContainerLowest },
        }}
      />
      <Stack.Screen
        name="filters"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.9],
          sheetCornerRadius: 28,
          contentStyle: { backgroundColor: colors.surface },
        }}
      />
      <Stack.Screen name="match/[matchId]" options={{ presentation: 'fullScreenModal', animation: 'fade', contentStyle: { backgroundColor: colors.primary } }} />
      <Stack.Screen name="person/[id]" options={{ ...header, title: '' }} />
      <Stack.Screen name="edit-profile" options={{ ...header, title: 'Edit profile', presentation: 'modal' }} />
      <Stack.Screen name="chat/[matchId]" options={{ ...header, title: '' }} />
      <Stack.Screen name="photos" options={{ presentation: 'modal', contentStyle: { backgroundColor: colors.onSurface } }} />
      <Stack.Screen name="edit-prompts" options={{ ...header, title: 'Your prompts' }} />
      <Stack.Screen name="treats" options={{ ...header, title: 'My treats' }} />
      <Stack.Screen name="settings/privacy" options={{ ...header, title: 'Privacy' }} />
      <Stack.Screen name="settings/index" options={{ ...header, title: 'Settings' }} />
      <Stack.Screen name="settings/blocked" options={{ ...header, title: 'Blocked people' }} />
      <Stack.Screen name="settings/delete-account" options={{ ...header, title: 'Delete account' }} />
      <Stack.Screen name="safety" options={{ ...header, title: 'Safety centre' }} />
      <Stack.Screen name="legal/[doc]" options={{ ...header, title: '' }} />
      <Stack.Screen name="date-plan" options={{ ...header, title: 'Date safety', presentation: 'modal' }} />
      <Stack.Screen
        name="report"
        options={{ presentation: 'formSheet', sheetGrabberVisible: true, sheetAllowedDetents: [0.92], sheetCornerRadius: 28, contentStyle: { backgroundColor: colors.surface } }}
      />
      <Stack.Screen
        name="match-actions"
        options={{ presentation: 'formSheet', sheetGrabberVisible: true, sheetAllowedDetents: [0.5], sheetCornerRadius: 28, contentStyle: { backgroundColor: colors.surface } }}
      />
    </Stack>
  );
}
