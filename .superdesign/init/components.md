# Shared UI components

Framework: React Native 0.88 + Expo SDK 58, Expo Router (file-based, routes in `src/app/`), TypeScript.
Styling: React Native inline styles only (no CSS, no Tailwind). All values come from tokens in `src/theme/`.
Component library: custom kit in `src/components/` (no third-party UI library). Icons: Material Symbols (font glyphs) via `Icon`.
Fonts: Newsreader (serif, reading/headlines) and Plus Jakarta Sans (labels/buttons), one file per weight.
Target: mobile (390×844), light mode only. Design name: "Warm Editorial Trust". App name: Makoma.

Barrel export: `src/components/index.ts` re-exports button, controls, icon, screen, surface, text, waveform. `src/components/icon-glyphs.ts` maps icon names to Material Symbols codepoints (generated).

### `src/components/text.tsx`

```tsx
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { colors, italicOf, type, type ColorName, type TypeVariant } from '@/theme';

export interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  color?: ColorName;
  italic?: boolean;
  uppercase?: boolean;
  center?: boolean;
}

/** The only way screens render text: picks a step of the type ramp and a palette colour. */
export function Text({ variant = 'bodyMd', color = 'onSurface', italic, uppercase, center, style, ...props }: TextProps) {
  const base = type[variant];
  return (
    <RNText
      style={[
        base,
        { color: colors[color] },
        italic && { fontFamily: italicOf[base.fontFamily] ?? base.fontFamily },
        uppercase && { textTransform: 'uppercase', letterSpacing: 1.1 },
        center && { textAlign: 'center' },
        style,
      ]}
      {...props}
    />
  );
}
```

### `src/components/icon.tsx`

```tsx
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { colors, type ColorName } from '@/theme';
import { glyphs, type IconName } from './icon-glyphs';

export type { IconName };

/**
 * Material Symbols icon, the same set the designs use, on every platform.
 * `filled` switches to the filled style. Decorative by default: put the
 * accessibility label on the pressable that wraps it.
 */
export function Icon({
  name,
  size = 24,
  color = 'onSurface',
  filled,
  style,
}: {
  name: IconName;
  size?: number;
  color?: ColorName;
  filled?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      aria-hidden
      allowFontScaling={false}
      style={[
        {
          fontFamily: filled ? 'MaterialSymbols_400Regular_Filled' : 'MaterialSymbols_400Regular',
          fontSize: size,
          lineHeight: size,
          width: size,
          height: size,
          color: colors[color],
        },
        style,
      ]}
    >
      {String.fromCharCode(glyphs[name])}
    </Text>
  );
}
```

### `src/components/button.tsx`

```tsx
import { ActivityIndicator, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing, type ColorName } from '@/theme';
import { Icon, type IconName } from './icon';
import { Text } from './text';

const variants = {
  /** Default CTA in the designs: pastel teal pill. */
  primary: { bg: 'primaryContainer', fg: 'onPrimary', shadow: shadows.md },
  /** Strong CTA (deep teal), e.g. "Take Live Selfie". */
  strong: { bg: 'primary', fg: 'onPrimary', shadow: shadows.primaryGlow },
  /** Terracotta, for warm/emotional actions like "Send Rose". */
  warm: { bg: 'secondary', fg: 'onSecondary', shadow: shadows.lg },
  /** Quiet surface button. */
  tonal: { bg: 'surfaceContainerHigh', fg: 'onSurface', shadow: undefined },
} as const satisfies Record<string, { bg: ColorName; fg: ColorName; shadow?: string }>;

const sizes = {
  md: { height: 48, paddingHorizontal: spacing.margin },
  lg: { height: 56, paddingHorizontal: spacing.lg },
} as const;

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconLeft,
  iconFilled,
  disabled,
  loading,
  fullWidth = true,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Trailing icon (the designs use a trailing arrow). */
  icon?: IconName;
  iconLeft?: IconName;
  iconFilled?: boolean;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const v = variants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          borderRadius: radius.full,
          backgroundColor: colors[v.bg],
          boxShadow: disabled ? undefined : v.shadow,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          alignSelf: fullWidth ? 'stretch' : 'center',
          ...sizes[size],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors[v.fg]} />
      ) : (
        <>
          {iconLeft ? <Icon name={iconLeft} size={22} color={v.fg} filled={iconFilled} /> : null}
          <Text variant="labelLg" color={v.fg}>
            {title}
          </Text>
          {icon ? <Icon name={icon} size={18} color={v.fg} filled={iconFilled} /> : null}
        </>
      )}
    </Pressable>
  );
}

/** Round icon-only button. Always needs a label for screen readers. */
export function IconButton({
  icon,
  label,
  onPress,
  size = 44,
  iconSize = 22,
  bg = 'transparent',
  color = 'onSurface',
  filled,
  shadow,
  style,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
  bg?: ColorName;
  color?: ColorName;
  filled?: boolean;
  shadow?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={size < 44 ? (44 - size) / 2 : 0}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors[bg],
          boxShadow: shadow,
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
        style,
      ]}
    >
      <Icon name={icon} size={iconSize} color={color} filled={filled} />
    </Pressable>
  );
}
```

### `src/components/surface.tsx`

```tsx
import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing, type ColorName } from '@/theme';
import { Icon, type IconName } from './icon';
import { Text } from './text';

/** Rounded surface the designs build everything from. Content goes in as children. */
export function Card({
  children,
  bg = 'surfaceContainerLowest',
  rounded = 'lg',
  padding = 'md',
  shadow = 'sm',
  onPress,
  accessibilityLabel,
  selected,
  style,
}: {
  children: ReactNode;
  bg?: ColorName;
  rounded?: keyof typeof radius;
  padding?: keyof typeof spacing | 'none';
  shadow?: keyof typeof shadows | 'none';
  onPress?: () => void;
  accessibilityLabel?: string;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const base: ViewStyle = {
    backgroundColor: colors[bg],
    borderRadius: radius[rounded],
    borderCurve: 'continuous',
    padding: padding === 'none' ? 0 : spacing[padding],
    boxShadow: shadow === 'none' ? undefined : shadows[shadow],
  };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={selected === undefined ? undefined : { selected }}
      onPress={onPress}
      style={({ pressed }) => [base, { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }, style]}
    >
      {children}
    </Pressable>
  );
}

/** Small rounded label: eyebrow tags ("OUR PLEDGE"), identity pills, status badges. */
export function Pill({
  label,
  icon,
  iconFilled,
  dot,
  bg = 'surfaceContainerHigh',
  color = 'onSurfaceVariant',
  iconColor,
  size = 'sm',
  uppercase,
  style,
}: {
  label: string;
  icon?: IconName;
  iconFilled?: boolean;
  dot?: ColorName;
  bg?: ColorName | string;
  color?: ColorName;
  iconColor?: ColorName;
  size?: 'sm' | 'md';
  uppercase?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: size === 'md' ? 6 : 4,
          borderRadius: radius.full,
          backgroundColor: bg in colors ? colors[bg as ColorName] : bg,
        },
        style,
      ]}
    >
      {dot ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors[dot] }} /> : null}
      {icon ? <Icon name={icon} size={16} color={iconColor ?? color} filled={iconFilled} /> : null}
      <Text variant={size === 'md' ? 'labelMd' : 'labelSm'} color={color} uppercase={uppercase}>
        {label}
      </Text>
    </View>
  );
}

/** Round tinted container for an icon, used as a leading visual in rows and cards. */
export function IconBadge({
  icon,
  size = 48,
  iconSize = 24,
  bg = 'primaryFixed',
  color = 'onPrimaryContainer',
  rounded = 'full',
  filled,
}: {
  icon: IconName;
  size?: number;
  iconSize?: number;
  bg?: ColorName;
  color?: ColorName;
  rounded?: keyof typeof radius;
  filled?: boolean;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius[rounded],
        borderCurve: 'continuous',
        backgroundColor: colors[bg],
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon name={icon} size={iconSize} color={color} filled={filled} />
    </View>
  );
}

/** Segmented progress bar from the onboarding designs: thin pill dashes. */
export function ProgressSegments({ total, current }: { total: number; current: number }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${current} of ${total}`}
      accessibilityValue={{ min: 0, max: total, now: current }}
      style={{ flexDirection: 'row', gap: spacing.xs }}
    >
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            backgroundColor: i < current ? colors.primaryContainer : colors.surfaceContainerHighest,
          }}
        />
      ))}
    </View>
  );
}

/** Dots used for small milestones, e.g. "2 of 3 voice notes exchanged". */
export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }} accessibilityLabel={`${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            borderWidth: i < current ? 0 : 1.5,
            borderColor: colors.outlineVariant,
            backgroundColor: i < current ? colors.primary : colors.transparent,
          }}
        />
      ))}
    </View>
  );
}
```

### `src/components/controls.tsx`

```tsx
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, radius, spacing, type } from '@/theme';
import { Icon } from './icon';
import { Text } from './text';

/** Pill switch from the designs (48×28, teal when on). */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      hitSlop={8}
      style={{
        width: 48,
        height: 28,
        borderRadius: radius.full,
        padding: 4,
        backgroundColor: value ? colors.primary : colors.outlineVariant,
        alignItems: value ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.onPrimary, boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }} />
    </Pressable>
  );
}

export function Checkbox({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minHeight: 44 }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: radius.xs,
          borderWidth: value ? 0 : 1.5,
          borderColor: colors.outline,
          backgroundColor: value ? colors.primary : colors.surfaceContainer,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {value ? <Icon name="check" size={16} color="onPrimary" /> : null}
      </View>
      <Text variant="labelMd" style={{ flex: 1 }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Radio indicator used on the intent cards: filled terracotta check when selected. */
export function RadioMark({ selected }: { selected: boolean }) {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: selected ? colors.secondary : colors.surfaceContainerHighest,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {selected ? <Icon name="check" size={18} color="onSecondary" /> : null}
    </View>
  );
}

/** Soft-fill text field. `serif` uses the reading font for user-written answers. */
export function Field({ serif, style, ...props }: TextInputProps & { serif?: boolean }) {
  return (
    <TextInput
      placeholderTextColor={colors.tertiaryContainer}
      style={[
        serif ? type.bodyMd : { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 22 },
        {
          color: colors.onSurface,
          backgroundColor: colors.surfaceContainerLow,
          borderRadius: props.multiline ? radius.md : radius.full,
          borderCurve: 'continuous',
          paddingHorizontal: spacing.margin,
          paddingVertical: 14,
          minHeight: props.multiline ? 96 : 52,
          textAlignVertical: props.multiline ? 'top' : 'center',
        },
        style,
      ]}
      {...props}
    />
  );
}
```

### `src/components/waveform.tsx`

```tsx
import { View } from 'react-native';
import { colors, type ColorName } from '@/theme';

/** Deterministic bar heights so a clip looks the same every time it renders. */
function bars(seed: string, count: number): number[] {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return Array.from({ length: count }, (_, i) => {
    h = (h * 1664525 + 1013904223 + i) >>> 0;
    return 0.25 + ((h >>> 8) % 100) / 133; // 0.25..1
  });
}

/**
 * Voice-note waveform. Played bars use `playedColor`, the rest are muted.
 * TODO: draw from real audio levels once recordings are metered.
 */
export function Waveform({
  seed,
  progress = 0,
  count = 28,
  height = 40,
  playedColor = 'primaryContainer',
  restColor = 'outlineVariant',
}: {
  seed: string;
  progress?: number;
  count?: number;
  height?: number;
  playedColor?: ColorName;
  restColor?: ColorName;
}) {
  const played = Math.round(progress * count);
  return (
    <View aria-hidden style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height }}>
      {bars(seed, count).map((b, i) => (
        <View
          key={i}
          style={{ width: 4, borderRadius: 2, height: Math.max(4, b * height), backgroundColor: colors[i < played ? playedColor : restColor] }}
        />
      ))}
    </View>
  );
}
```

### `src/components/gift-button.tsx`

```tsx
import { View } from 'react-native';
import { giftLockHint, giftUnlockSteps } from '@/features/gifts/unlock';
import { spacing } from '@/theme';
import type { GiftUnlock } from '@/types/domain';
import { IconButton } from './button';
import { Card, IconBadge, ProgressDots } from './surface';
import { Text } from './text';

/** Banner at the top of a chat showing progress towards unlocking treats. */
export function TreatUnlockBanner({ unlock }: { unlock: GiftUnlock }) {
  return (
    <Card bg={unlock.unlocked ? 'primaryFixed' : 'surfaceContainerHigh'} rounded="lg" shadow="none" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <IconBadge icon={unlock.unlocked ? 'lock_open' : 'lock'} size={40} iconSize={20} bg={unlock.unlocked ? 'primary' : 'secondaryContainer'} color={unlock.unlocked ? 'onPrimary' : 'onSecondaryContainer'} />
      <View style={{ flex: 1 }}>
        <Text variant="labelLg">{unlock.unlocked ? 'Treats unlocked' : 'Treat tray unlocking'}</Text>
        <Text variant="labelMd" color="tertiary">
          {unlock.unlocked ? 'You can now send a treat.' : giftLockHint(unlock)}
        </Text>
      </View>
      <ProgressDots total={unlock.voiceNotesRequired} current={giftUnlockSteps(unlock)} />
    </Card>
  );
}

/**
 * Treat button for the chat composer. Locked until the voice-note milestone;
 * tapping while locked only explains what is left. There is deliberately no
 * way to request a treat.
 */
export function GiftButton({ unlock, onPress, onLockedPress }: { unlock: GiftUnlock; onPress: () => void; onLockedPress: (hint: string) => void }) {
  return (
    <IconButton
      icon={unlock.unlocked ? 'redeem' : 'lock'}
      label={unlock.unlocked ? 'Send a treat' : `Treats locked. ${giftLockHint(unlock)}`}
      size={48}
      bg={unlock.unlocked ? 'secondaryFixed' : 'surfaceContainerHigh'}
      color={unlock.unlocked ? 'secondary' : 'tertiaryContainer'}
      onPress={() => (unlock.unlocked ? onPress() : onLockedPress(giftLockHint(unlock)))}
    />
  );
}
```

### `src/components/profile/sections.tsx`

```tsx
/**
 * The building blocks of a profile in Discover: a photo card, the voice
 * prompt player, a written prompt and the values grid. Each "likeable" block
 * has its own heart, which opens the reply sheet for that specific item.
 */
import { View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Icon, IconBadge, IconButton, Pill, Text, Waveform, type IconName } from '@/components';
import { INSTITUTIONS, LANGUAGES } from '@/constants/ghana';
import { intentLabel } from '@/constants/intents';
import { promptById, slotOfPrompt } from '@/constants/prompts';
import { alpha, colors, radius, shadows, spacing, type ColorName } from '@/theme';
import type { Photo, Profile, ProfilePrompt, SharedGround, VoicePrompt } from '@/types/domain';

export const ageOf = (birth: string) => {
  const b = new Date(birth);
  const now = new Date();
  return now.getFullYear() - b.getFullYear() - (now < new Date(now.getFullYear(), b.getMonth(), b.getDate()) ? 1 : 0);
};

const glassButton = { bg: 'surfaceBright' as ColorName, shadow: shadows.lg };

export function HeroPhotoCard({ profile, onLike }: { profile: Profile; onLike: () => void }) {
  const photo = profile.photos[0];
  const pills: { icon: IconName; label: string; warm?: boolean; iconColor?: ColorName }[] = [
    { icon: 'apartment', label: [profile.neighborhood, profile.city].filter(Boolean).join(', ') },
    { icon: 'favorite', label: intentLabel(profile.intent), warm: true },
    ...(profile.occupation ? [{ icon: 'work' as IconName, label: profile.occupation }] : []),
    ...(profile.church ? [{ icon: 'church' as IconName, label: profile.church, iconColor: 'tertiary' as ColorName }] : []),
  ];
  return (
    <Card rounded="xl" padding="none" shadow="md" style={{ overflow: 'hidden' }}>
      <View style={{ aspectRatio: 3 / 4, backgroundColor: colors.surfaceDim }}>
        {photo ? <Image source={photo.source} contentFit="cover" style={{ flex: 1 }} accessibilityLabel={`Photo of ${profile.firstName}`} transition={200} /> : null}
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', colors.transparent, alpha(colors.onSurface, 0.8)]}
          locations={[0, 0.45, 1]}
          style={{ position: 'absolute', inset: 0 }}
          pointerEvents="none"
        />
        {profile.verification === 'verified' ? (
          <Pill label="Selfie Verified" icon="verified_user" iconColor="primary" color="onSurface" bg={alpha(colors.surfaceBright, 0.95)} style={{ position: 'absolute', top: 16, left: 16, boxShadow: shadows.sm }} />
        ) : null}
        <View style={{ position: 'absolute', left: 16, right: 76, bottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}>
            <Text variant="headlineXl" color="surfaceBright" accessibilityRole="header">
              {profile.firstName}
            </Text>
            <Text variant="headlineLg" color="surfaceContainerHigh">
              {ageOf(profile.birthDate)}
            </Text>
          </View>
          {profile.headline ? (
            <Text italic color="surfaceContainerLow" numberOfLines={1}>
              {profile.headline}
            </Text>
          ) : null}
        </View>
        <IconButton icon="favorite" label={`Like ${profile.firstName}'s photo`} size={48} iconSize={24} color="onSurfaceVariant" {...glassButton} onPress={onLike} style={{ position: 'absolute', right: 16, bottom: 16 }} />
      </View>
      <View style={{ padding: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {pills.map((p) => (
          <Pill
            key={p.label}
            size="md"
            label={p.label}
            icon={p.icon}
            iconColor={p.warm ? 'secondary' : (p.iconColor ?? 'primary')}
            color={p.warm ? 'onSecondaryFixed' : 'onSurface'}
            bg={p.warm ? alpha(colors.secondaryFixed, 0.5) : 'surfaceContainerLow'}
          />
        ))}
      </View>
    </Card>
  );
}

/** "You have in common": the digital stand-in for being vouched for by a mutual friend. */
export function SharedGroundCard({ profile, shared }: { profile: Profile; shared: SharedGround }) {
  const items: { icon: IconName; label: string }[] = [
    ...shared.institutions.map((id) => ({ icon: 'school' as IconName, label: INSTITUTIONS.find((i) => i.id === id)?.label ?? id })),
    ...shared.languages.map((id) => ({ icon: 'translate' as IconName, label: `You both speak ${LANGUAGES.find((l) => l.id === id)?.label}` })),
    ...(shared.sameNeighborhood ? [{ icon: 'location_on' as IconName, label: `Both in ${profile.neighborhood}` }] : []),
    ...(shared.sameChurch ? [{ icon: 'church' as IconName, label: `Both ${profile.church}` }] : []),
    ...(shared.sameIntent ? [{ icon: 'favorite' as IconName, label: `Both ${intentLabel(profile.intent).toLowerCase()}` }] : []),
  ];
  if (items.length === 0) return null;
  return (
    <Card rounded="xl" padding="lg" shadow="md" bg="surfaceContainerLow" style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Icon name="handshake" size={20} color="primary" />
        <Text variant="labelLg" uppercase>
          You have in common
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {items.map((i) => (
          <Pill key={i.label} size="md" label={i.label} icon={i.icon} iconColor="primary" color="onSurface" bg="surfaceContainerLowest" />
        ))}
      </View>
    </Card>
  );
}

export function VoicePromptCard({ profile, voice, onLike }: { profile: Profile; voice: VoicePrompt; onLike: () => void }) {
  const secs = Math.round(voice.durationMs / 1000);
  return (
    <Card rounded="xl" padding="lg" shadow="md" style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pill label="Voice Prompt" icon="graphic_eq" uppercase color="onPrimaryFixedVariant" bg={alpha(colors.primaryFixed, 0.4)} />
        <Text variant="labelSm" color="tertiary">
          0:{String(secs).padStart(2, '0')}
        </Text>
      </View>
      <Text variant="headlineLg">{voice.promptText}</Text>
      <View style={{ padding: spacing.md, borderRadius: radius.lg, borderCurve: 'continuous', backgroundColor: colors.surfaceContainerLow, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          {/* TODO: wire to expo-audio once profiles carry real recordings. */}
          <IconButton icon="play_arrow" label={`Play ${profile.firstName}'s voice note`} filled size={48} iconSize={26} bg="secondary" color="onSecondary" shadow={shadows.md} />
          <Waveform seed={profile.id} progress={0} count={22} playedColor="primary" />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="labelSm" color="tertiary">
            0:00
          </Text>
          <Text variant="labelSm" color="tertiary">
            {profile.firstName}’s voice note
          </Text>
          <Text variant="labelSm" color="tertiary">
            0:{String(secs).padStart(2, '0')}
          </Text>
        </View>
      </View>
      {voice.transcript ? (
        <View style={{ borderLeftWidth: 2, borderLeftColor: colors.primaryContainer, paddingLeft: 12 }}>
          <Text variant="bodyLg" italic color="onSurfaceVariant">
            “{voice.transcript}”
          </Text>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="labelSm" color="tertiary" uppercase>
          Tap heart to reply to voice
        </Text>
        <IconButton icon="favorite" label="Like and reply to this voice prompt" size={44} iconSize={20} bg="surfaceContainer" shadow={shadows.sm} onPress={onLike} />
      </View>
    </Card>
  );
}

export function TextPromptCard({ prompt, onLike }: { prompt: ProfilePrompt; onLike: () => void }) {
  const slot = slotOfPrompt(prompt.promptId);
  return (
    <Card rounded="xl" padding="lg" shadow="md" style={{ gap: spacing.md }}>
      {slot ? <Pill label={slot.label} icon={slot.icon as IconName} iconColor="secondary" uppercase color="onSecondaryFixedVariant" bg={alpha(colors.secondaryFixed, 0.3)} /> : null}
      <View style={{ gap: spacing.sm }}>
        <Text variant="headlineLg" color="tertiary">
          {promptById(prompt.promptId)?.text}
        </Text>
        <Text variant="headlineMd" style={{ lineHeight: 32 }}>
          “{prompt.answer}”
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <IconButton icon="favorite" label="Like and reply to this answer" size={44} iconSize={20} bg="surfaceContainer" color="onSurfaceVariant" shadow={shadows.sm} onPress={onLike} />
      </View>
    </Card>
  );
}

export function PhotoCard({ photo, firstName, onLike }: { photo: Photo; firstName: string; onLike: () => void }) {
  return (
    <Card rounded="xl" padding="none" shadow="md" style={{ overflow: 'hidden' }}>
      <View style={{ aspectRatio: 4 / 3, backgroundColor: colors.surfaceDim }}>
        <Image source={photo.source} contentFit="cover" style={{ flex: 1 }} accessibilityLabel={photo.caption ?? `Photo of ${firstName}`} transition={200} />
        <IconButton icon="favorite" label="Like this photo" size={48} iconSize={24} color="onSurfaceVariant" {...glassButton} onPress={onLike} style={{ position: 'absolute', right: 16, bottom: 16 }} />
      </View>
      {photo.caption ? (
        <View style={{ padding: spacing.md }}>
          <Text italic>{photo.caption}</Text>
        </View>
      ) : null}
    </Card>
  );
}

const DRINKS = { never: 'Doesn’t drink', socially: 'Socially', regularly: 'Regularly' } as const;

export function ValuesCard({ profile }: { profile: Profile }) {
  const cells: { icon: IconName; bg: ColorName; color: ColorName; label: string; value: string }[] = [
    { icon: 'verified', bg: 'secondaryContainer', color: 'onSecondaryContainer', label: 'Intention', value: intentLabel(profile.intent) },
    {
      icon: 'translate',
      bg: 'primaryFixed',
      color: 'onPrimaryFixedVariant',
      label: 'Languages',
      value: profile.languages.map((id) => LANGUAGES.find((l) => l.id === id)?.label).join(' & '),
    },
    ...(profile.drinks ? [{ icon: 'local_bar' as IconName, bg: 'tertiaryFixed' as ColorName, color: 'onTertiaryFixedVariant' as ColorName, label: 'Drinks', value: DRINKS[profile.drinks] }] : []),
    ...(profile.heritage ? [{ icon: 'diversity_1' as IconName, bg: 'secondaryFixed' as ColorName, color: 'onSecondaryFixedVariant' as ColorName, label: 'Heritage', value: profile.heritage }] : []),
  ];
  return (
    <Card rounded="xl" padding="lg" shadow="md" style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Icon name="spa" size={20} color="primary" />
        <Text variant="labelLg" uppercase>
          Values & Foundations
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {cells.map((c) => (
          <View
            key={c.label}
            style={{
              flexBasis: '47%',
              flexGrow: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              padding: 12,
              borderRadius: radius.lg,
              borderCurve: 'continuous',
              backgroundColor: colors.surfaceContainerLow,
            }}
          >
            <IconBadge icon={c.icon} size={32} iconSize={18} bg={c.bg} color={c.color} />
            <View style={{ flex: 1 }}>
              <Text variant="labelSm" color="tertiary">
                {c.label}
              </Text>
              <Text variant="labelMd" numberOfLines={1}>
                {c.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
```
