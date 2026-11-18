import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Card, Eyebrow, Icon, IconBadge, Pill, Screen, Text, type IconName } from '@/components';
import { ageOf } from '@/components/profile/sections';
import { intentLabel } from '@/constants/intents';
import { profileCompletion } from '@/features/onboarding/completion';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { MOCK_ME } from '@/features/mock-data';
import { colors, fonts, radius, spacing } from '@/theme';

const LINKS: { icon: IconName; title: string; body: string; href: '/treats' | '/settings/privacy' }[] = [
  { icon: 'redeem', title: 'My treats', body: 'Vouchers you have received', href: '/treats' },
  { icon: 'visibility_off', title: 'Privacy & Incognito', body: 'Control who can see you', href: '/settings/privacy' },
];

/** Profile, with a completion card for everything onboarding let people skip. */
export default function MyProfile() {
  const { draft } = useOnboarding();
  // Demo: fall back to the sample profile until onboarding has been filled in.
  const name = draft.firstName?.trim() || MOCK_ME.firstName;
  const work = draft.occupation?.trim() || MOCK_ME.occupation;
  const intent = draft.intent ?? MOCK_ME.intent;
  const hood = `${draft.neighborhood}, ${draft.city}`;
  const { percent, items } = profileCompletion({ ...draft, firstName: name, intent });

  return (
    <Screen back={false} bottomInset={false}>
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <Image source={MOCK_ME.photos[0]?.source} style={{ width: 112, height: 112, borderRadius: 56 }} contentFit="cover" accessibilityLabel="Your photo" />
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <Text variant="headlineXl" accessibilityRole="header">
            {name}
            {draft.firstName ? '' : `, ${ageOf(MOCK_ME.birthDate)}`}
          </Text>
          <Text color="tertiary">
            {work} • {hood}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' }}>
          {draft.selfieSubmitted ? <Pill label="Verification pending" icon="verified_user" color="primary" size="md" /> : null}
          <Pill label={intentLabel(intent)} icon="favorite" iconColor="secondary" color="onSecondaryFixed" bg="secondaryFixed" size="md" />
        </View>
      </View>

      {percent < 100 ? (
        <Card rounded="card" padding="lg" shadow="warm" style={{ gap: spacing.md, borderWidth: 1, borderColor: colors.hairline }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text variant="headlineMd">Finish your profile</Text>
            <Text style={{ fontFamily: fonts.sansBold, fontSize: 20, color: colors.primary }}>{percent}%</Text>
          </View>
          <View
            accessibilityRole="progressbar"
            accessibilityLabel={`Profile ${percent} percent complete`}
            accessibilityValue={{ min: 0, max: 100, now: percent }}
            style={{ height: 8, borderRadius: 4, backgroundColor: colors.surfaceContainerHighest, overflow: 'hidden' }}
          >
            <View style={{ width: `${percent}%`, height: 8, borderRadius: 4, backgroundColor: colors.primaryContainer }} />
          </View>
          <Text variant="labelMd" color="tertiary" style={{ fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20 }}>
            Complete profiles get more thoughtful likes. Do it at your own pace.
          </Text>
          <View style={{ gap: spacing.xs }}>
            {items.map((i) => (
              <Pressable
                key={i.id}
                disabled={i.done || !i.href}
                accessibilityRole="button"
                accessibilityState={{ disabled: i.done || !i.href, checked: i.done }}
                accessibilityLabel={`${i.label}${i.done ? ', done' : ''}`}
                onPress={() => i.href && router.push(i.href === '/edit-prompts' ? '/edit-prompts' : { pathname: i.href, params: { from: 'profile' } })}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 12, borderRadius: radius.xs, opacity: pressed ? 0.7 : 1 })}
              >
                <Icon name={i.done ? 'task_alt' : 'radio_button_unchecked'} size={24} color={i.done ? 'primary' : 'outlineVariant'} filled={false} />
                <View style={{ flex: 1 }}>
                  <Text variant="labelLg" color={i.done ? 'tertiary' : 'onSurface'} style={{ fontFamily: fonts.sansBold, textDecorationLine: i.done ? 'line-through' : 'none' }}>
                    {i.label}
                  </Text>
                  {!i.done ? (
                    <Text variant="labelMd" color="tertiary" style={{ fontFamily: fonts.sansMedium }}>
                      {i.progress ? `${i.progress.done} of ${i.progress.total} answered · ` : ''}
                      {i.hint}
                    </Text>
                  ) : null}
                </View>
                {!i.done && i.href ? <Text variant="labelSm" color="tertiary">+{i.weight}%</Text> : null}
                {!i.done && i.href ? <Icon name="chevron_right" size={20} color="tertiary" /> : null}
              </Pressable>
            ))}
          </View>
        </Card>
      ) : null}

      <View style={{ gap: spacing.md }}>
        <Eyebrow>Settings</Eyebrow>
        {LINKS.map((l) => (
          <Card key={l.href} rounded="card" padding="margin" shadow="warm" onPress={() => router.push(l.href)} accessibilityLabel={l.title} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <IconBadge icon={l.icon} size={40} iconSize={20} bg="surfaceContainerHigh" color="primary" />
            <View style={{ flex: 1 }}>
              <Text variant="labelLg" style={{ fontFamily: fonts.sansBold }}>
                {l.title}
              </Text>
              <Text variant="labelMd" color="tertiary" style={{ fontFamily: fonts.sansMedium }}>
                {l.body}
              </Text>
            </View>
            <Icon name="chevron_right" size={20} color="tertiary" />
          </Card>
        ))}
      </View>
    </Screen>
  );
}
