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
        <IconButton icon="favorite" label={`Like ${profile.firstName}'s photo`} size={48} iconSize={24} color="onSurfaceVariant" {...glassButton} filled={false} onPress={onLike} style={{ position: 'absolute', right: 16, bottom: 16 }} />
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
        <Icon name="handshake" size={20} color="primary" filled={false} />
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
          <Waveform seed={profile.id} progress={0.35} count={16} height={32} barWidth={6} playedColor="primary" />
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
        <IconButton icon="favorite" label="Like and reply to this voice prompt" size={44} iconSize={20} bg="surfaceContainer" shadow={shadows.sm} filled={false} onPress={onLike} />
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
        <IconButton icon="favorite" label="Like and reply to this answer" size={44} iconSize={20} bg="surfaceContainer" color="onSurfaceVariant" shadow={shadows.sm} filled={false} onPress={onLike} />
      </View>
    </Card>
  );
}

export function PhotoCard({ photo, firstName, onLike }: { photo: Photo; firstName: string; onLike: () => void }) {
  return (
    <Card rounded="xl" padding="none" shadow="md" style={{ overflow: 'hidden' }}>
      <View style={{ aspectRatio: 4 / 3, backgroundColor: colors.surfaceDim }}>
        <Image source={photo.source} contentFit="cover" style={{ flex: 1 }} accessibilityLabel={photo.caption ?? `Photo of ${firstName}`} transition={200} />
        <IconButton icon="favorite" label="Like this photo" size={48} iconSize={24} color="onSurfaceVariant" {...glassButton} filled={false} onPress={onLike} style={{ position: 'absolute', right: 16, bottom: 16 }} />
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
