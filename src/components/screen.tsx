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
    <Text
      variant={size === 'lg' ? 'headlineLg' : 'headlineMd'}
      color="primary"
      accessibilityRole="header"
      style={size === 'lg' ? { fontSize: 30, lineHeight: 36, letterSpacing: -0.75 } : undefined}
    >
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
    <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', paddingHorizontal: spacing.margin, gap: spacing.section }}>
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
          contentContainerStyle={{ paddingTop: spacing.lg + spacing.xs, paddingBottom: spacing.xl + (footer || !bottomInset ? 0 : insets.bottom) }}
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
            paddingTop: spacing.md,
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
    <View style={{ gap: spacing.sm, alignItems: center ? 'center' : 'flex-start' }}>
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
