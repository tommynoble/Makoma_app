# Layouts

- `src/app/_layout.tsx`: root Stack (fonts, safe area, onboarding state); `reply` is a native form sheet.
- `src/app/(tabs)/_layout.tsx`: bottom tab bar (Discover, Matches, Likes, Profile) with Material Symbols icons.
- `src/components/screen.tsx`: `Screen` frame (top bar with back + Makoma wordmark + optional segmented onboarding progress, scrolling 20px-margin column, optional pinned footer), `Heading`, `Wordmark`.

### `src/app/_layout.tsx`

```tsx
import { useEffect } from 'react';
import { MaterialSymbols_400Regular } from '@expo-google-fonts/material-symbols/400Regular';
import { MaterialSymbols_400Regular_Filled } from '@expo-google-fonts/material-symbols/400Regular_Filled';
import { Newsreader_400Regular } from '@expo-google-fonts/newsreader/400Regular';
import { Newsreader_400Regular_Italic } from '@expo-google-fonts/newsreader/400Regular_Italic';
import { Newsreader_500Medium } from '@expo-google-fonts/newsreader/500Medium';
import { Newsreader_500Medium_Italic } from '@expo-google-fonts/newsreader/500Medium_Italic';
import { Newsreader_600SemiBold } from '@expo-google-fonts/newsreader/600SemiBold';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingProvider } from '@/features/onboarding/onboarding-context';
import { colors, fonts } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Runtime loading works in Expo Go and on web. For store builds, also embed
  // these with the expo-font config plugin so they are ready at launch.
  const [loaded, error] = useFonts({
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    Newsreader_500Medium,
    Newsreader_500Medium_Italic,
    Newsreader_600SemiBold,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    MaterialSymbols_400Regular,
    MaterialSymbols_400Regular_Filled,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <OnboardingProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
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
          <Stack.Screen name="treats" options={{ headerShown: true, title: 'My treats' }} />
          <Stack.Screen name="settings/privacy" options={{ headerShown: true, title: 'Privacy' }} />
        </Stack>
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}
```

### `src/app/(tabs)/_layout.tsx`

```tsx
import { Tabs } from 'expo-router';
import { Icon, type IconName } from '@/components';
import { colors, fonts, shadows } from '@/theme';

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'discover', title: 'Discover', icon: 'local_fire_department' },
  { name: 'matches', title: 'Matches', icon: 'forum' },
  { name: 'likes', title: 'Likes', icon: 'favorite' },
  { name: 'profile', title: 'Profile', icon: 'person' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: { fontFamily: fonts.sansBold, fontSize: 11, letterSpacing: 0.44 },
        tabBarStyle: { backgroundColor: colors.surface, borderTopWidth: 0, boxShadow: shadows.tabBar, height: 64 + 20, paddingTop: 8 },
        sceneStyle: { backgroundColor: colors.surface },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ focused }) => <Icon name={t.icon} size={24} color={focused ? 'primary' : 'onSurfaceVariant'} filled={focused} />,
          }}
        />
      ))}
    </Tabs>
  );
}
```

### `src/components/screen.tsx`

```tsx
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, maxContentWidth, shadows, spacing } from '@/theme';
import { IconButton } from './button';
import { ProgressSegments } from './surface';
import { Text } from './text';

export const ONBOARDING_STEPS = 6;

/** "Makoma" wordmark in the editorial serif, as in the Discover header. */
export function Wordmark({ size = 'lg' }: { size?: 'lg' | 'md' }) {
  return (
    <Text variant={size === 'lg' ? 'headlineLg' : 'headlineMd'} color="primary" accessibilityRole="header">
      Makoma
    </Text>
  );
}

/**
 * Standard screen frame: fixed top bar (back, wordmark, optional step
 * progress), scrolling single-column content with the design's 20px margin,
 * and an optional footer pinned above the home indicator.
 */
export function Screen({
  children,
  step,
  back = true,
  headerRight,
  footer,
  scroll = true,
  bottomInset = true,
}: {
  children: ReactNode;
  /** Onboarding step number; shows the segmented progress bar. */
  step?: number;
  back?: boolean;
  headerRight?: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  bottomInset?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const body = (
    <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', paddingHorizontal: spacing.margin, gap: spacing.lg }}>
      {children}
    </View>
  );
  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ paddingTop: insets.top, backgroundColor: colors.surface, boxShadow: shadows.header, zIndex: 1 }}>
        <View style={{ paddingHorizontal: spacing.margin, paddingBottom: spacing.sm, gap: spacing.sm, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}>
          <View style={{ height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              {back && router.canGoBack() ? (
                <IconButton icon="arrow_back" label="Go back" onPress={() => router.back()} style={{ marginLeft: -spacing.sm }} />
              ) : null}
              <Wordmark />
            </View>
            {headerRight ??
              (step ? (
                <Text variant="labelSm" color="tertiary">
                  Step {step} of {ONBOARDING_STEPS}
                </Text>
              ) : null)}
          </View>
          {step ? <ProgressSegments total={ONBOARDING_STEPS} current={step} /> : null}
        </View>
      </View>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: spacing.xl + (footer || !bottomInset ? 0 : insets.bottom) }}
        >
          {body}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{children}</View>
      )}
      {footer ? (
        <View
          style={{
            paddingHorizontal: spacing.margin,
            paddingTop: spacing.sm,
            paddingBottom: Math.max(insets.bottom, spacing.md),
            gap: spacing.sm,
            backgroundColor: colors.surface,
            maxWidth: maxContentWidth,
            width: '100%',
            alignSelf: 'center',
          }}
        >
          {footer}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

/** Eyebrow + serif headline + supporting line: the opening block of every onboarding screen. */
export function Heading({ eyebrow, title, subtitle, center }: { eyebrow?: ReactNode; title: string; subtitle?: string; center?: boolean }) {
  return (
    <View style={{ gap: spacing.xs, alignItems: center ? 'center' : 'flex-start' }}>
      {eyebrow}
      <Text variant="headlineXl" center={center} accessibilityRole="header" style={{ marginTop: eyebrow ? 4 : 0 }}>
        {title}
      </Text>
      {subtitle ? (
        <Text color="tertiary" center={center}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
```
