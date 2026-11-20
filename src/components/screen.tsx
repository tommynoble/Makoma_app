import { Children, type ReactNode } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, maxContentWidth, shadows, spacing } from '@/theme';
import { IconButton } from './button';
import { Enter } from './enter';
import { FormScrollView, KeyboardDoneBar } from './keyboard';
import { ProgressSegments } from './surface';
import { Text } from './text';

export const ONBOARDING_STEPS = 5;

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
  animateIn,
}: {
  children: ReactNode;
  /** Onboarding step number; shows the segmented progress bar. */
  step?: number;
  back?: boolean;
  headerRight?: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  bottomInset?: boolean;
  /** Stagger the content blocks in on mount. Defaults to on for onboarding steps; off for tabs (visited constantly). */
  animateIn?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const body = (
    <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', paddingHorizontal: step ? spacing.lg : spacing.margin, gap: spacing.section }}>
      {animateIn ?? !!step
        ? Children.toArray(children).map((child, i) => (
            <Enter key={i} index={i}>
              {child}
            </Enter>
          ))
        : children}
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {step ? (
        <View style={{ paddingTop: insets.top + spacing.sm, backgroundColor: colors.surface, zIndex: 1 }}>
          <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            {back && router.canGoBack() ? (
              <IconButton icon="arrow_back" label="Go back" onPress={() => router.back()} style={{ marginLeft: -spacing.md }} />
            ) : null}
            <View style={{ flex: 1 }}>
              <ProgressSegments total={ONBOARDING_STEPS} current={step} />
            </View>
            <Text variant="labelSm" color="tertiary" accessibilityLabel={`Step ${step} of ${ONBOARDING_STEPS}`}>
              {step}/{ONBOARDING_STEPS}
            </Text>
          </View>
        </View>
      ) : (
        <View style={{ paddingTop: insets.top, backgroundColor: colors.surface, boxShadow: shadows.header, zIndex: 1 }}>
          <View style={{ paddingHorizontal: spacing.margin, paddingBottom: spacing.sm, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}>
            <View style={{ height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                {back && router.canGoBack() ? (
                  <IconButton icon="arrow_back" label="Go back" onPress={() => router.back()} style={{ marginLeft: -spacing.sm }} />
                ) : null}
                <Wordmark />
              </View>
              {headerRight}
            </View>
          </View>
        </View>
      )}
      {scroll ? (
        <FormScrollView contentContainerStyle={{ paddingTop: spacing.lg + spacing.xs, paddingBottom: spacing.xl + (footer || !bottomInset ? 0 : insets.bottom) }}>
          {body}
        </FormScrollView>
      ) : (
        <View style={{ flex: 1 }}>{children}</View>
      )}
      {footer ? (
        <View
          style={{
            paddingHorizontal: step ? spacing.lg : spacing.margin,
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
      {scroll ? <KeyboardDoneBar /> : null}
    </View>
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
