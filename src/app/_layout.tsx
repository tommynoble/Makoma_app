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
import { OnboardingProvider } from '@/features/onboarding/onboarding-context';
import { colors, fonts } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // With Reduce Motion on, screens crossfade instead of sliding.
  const reduced = useReducedMotion();
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

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <OnboardingProvider>
        <StatusBar style="dark" />
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
          <Stack.Screen name="chat/[matchId]" options={{ headerShown: true, title: '' }} />
          <Stack.Screen name="photos" options={{ presentation: 'modal', contentStyle: { backgroundColor: colors.onSurface } }} />
          <Stack.Screen name="edit-prompts" options={{ headerShown: true, title: 'Your prompts' }} />
          <Stack.Screen name="treats" options={{ headerShown: true, title: 'My treats' }} />
          <Stack.Screen name="settings/privacy" options={{ headerShown: true, title: 'Privacy' }} />
        </Stack>
      </OnboardingProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
