import { Pressable, ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { Button, Card, Eyebrow, Icon, IconBadge, Pill, PressableScale, Screen, Text, type IconName } from '@/components';
import { ageOf } from '@/components/profile/sections';
import { LANGUAGES } from '@/constants/ghana';
import { intentLabel } from '@/constants/intents';
import { useMyProfile } from '@/features/me';
import { profileCompletion } from '@/features/onboarding/completion';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { useSocial } from '@/features/social/social-store';
import { CSS_EASE_OUT } from '@/lib/motion';
import { isBackendConfigured } from '@/lib/supabase';
import { colors, fonts, radius, spacing } from '@/theme';

const LINKS: { icon: IconName; title: string; body: string; href: '/treats' | '/settings/privacy' | '/settings' | '/safety' }[] = [
  { icon: 'redeem', title: 'My treats', body: 'Vouchers you have received', href: '/treats' },
  { icon: 'visibility_off', title: 'Privacy & Incognito', body: 'Control who can see you', href: '/settings/privacy' },
  { icon: 'shield_person', title: 'Safety centre', body: 'Date tips, scams to avoid, emergency numbers', href: '/safety' },
  { icon: 'settings', title: 'Settings', body: 'Account, notifications, pause, delete', href: '/settings' },
];

/** Profile, with a completion card for everything onboarding let people skip. */
// The completion bar fills from the left once, when the profile opens.
const FILL = { from: { transform: [{ scaleX: 0 }] }, to: { transform: [{ scaleX: 1 }] } } as const;

export default function MyProfile() {
  const reduced = useReducedMotion();
  const { draft } = useOnboarding();
  const social = useSocial();
  const me = useMyProfile();
  const name = me.firstName;
  const intent = me.intent;
  const hood = `${me.neighborhood}, ${me.city}`;
  const { percent, items } = profileCompletion({ ...draft, firstName: name, intent });
  const incognito = social.state.incognitoUntil && new Date(social.state.incognitoUntil) > new Date();
  const matchCount = Object.keys(social.state.matches).length;
  const likedCount = Object.keys(social.state.liked).length;

  return (
    <Screen back={false} bottomInset={false}>
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <PressableScale
          scaleTo={0.96}
          onPress={() => router.push({ pathname: '/photos', params: { profileId: 'me' } })}
          accessibilityRole="imagebutton"
          accessibilityLabel="Your photo. Opens all your photos."
        >
          <Image source={me.photos[0]?.source} style={{ width: 112, height: 112, borderRadius: 56, borderWidth: 3, borderColor: colors.surfaceContainerLowest }} contentFit="cover" />
        </PressableScale>
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <Text variant="headlineXl" accessibilityRole="header">
            {name}, {ageOf(me.birthDate)}
          </Text>
          <Text color="tertiary" center>
            {me.occupation} • {hood}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' }}>
          {me.verification === 'verified' ? <Pill label="Selfie verified" icon="verified" color="primary" size="md" /> : null}
          {me.verification === 'pending' ? <Pill label="Verification pending" icon="verified_user" color="primary" size="md" /> : null}
          {incognito ? <Pill label="Incognito on" icon="visibility_off" color="primary" size="md" /> : null}
          {social.state.paused ? <Pill label="Profile paused" icon="pause_circle" color="secondary" size="md" /> : null}
          <Pill label={intentLabel(intent)} icon="favorite" iconColor="secondary" color="onSecondaryFixed" bg="secondaryFixed" size="md" />
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <Button title="Edit profile" icon="person_edit" variant="tonal" onPress={() => router.push('/edit-profile')} />
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          {[
            { n: matchCount, label: matchCount === 1 ? 'Match' : 'Matches', href: '/matches' as const },
            { n: likedCount, label: 'You liked', href: undefined },
            { n: me.photos.length, label: 'Photos', href: undefined },
          ].map((s) => (
            <Card key={s.label} rounded="card" padding="md" style={{ flex: 1, alignItems: 'center', gap: 2 }} onPress={s.href ? () => router.push(s.href!) : undefined} accessibilityLabel={`${s.n} ${s.label}`}>
              <Text style={{ fontFamily: fonts.sansBold, fontSize: 22, color: colors.primary, fontVariant: ['tabular-nums'] }}>{s.n}</Text>
              <Text variant="labelSm" color="tertiary">
                {s.label}
              </Text>
            </Card>
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Eyebrow>Your photos</Eyebrow>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }} style={{ marginHorizontal: -spacing.margin }}>
          <View style={{ width: spacing.margin - spacing.sm }} />
          {me.photos.map((p, i) => (
            <PressableScale key={p.id} scaleTo={0.96} onPress={() => router.push({ pathname: '/photos', params: { profileId: 'me', index: String(i) } })} accessibilityRole="imagebutton" accessibilityLabel={`Photo ${i + 1} of ${me.photos.length}`}>
              <Image source={p.source} contentFit="cover" style={{ width: 104, height: 138, borderRadius: radius.card, backgroundColor: colors.surfaceDim }} />
            </PressableScale>
          ))}
          <PressableScale scaleTo={0.96} onPress={() => router.push('/edit-profile')} accessibilityRole="button" accessibilityLabel="Add or change photos" style={{ width: 104, height: 138, borderRadius: radius.card, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.control, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainerLow }}>
            <Icon name="add_circle" size={26} color="secondary" />
          </PressableScale>
          <View style={{ width: spacing.margin - spacing.sm }} />
        </ScrollView>
      </View>

      <Card rounded="card" padding="lg" style={{ gap: spacing.md }}>
        <Eyebrow>About you</Eyebrow>
        {me.lifeGoals ? <Text italic>“{me.lifeGoals}”</Text> : null}
        {[
          { icon: 'translate' as IconName, text: me.languages.map((l) => LANGUAGES.find((x) => x.id === l)?.label ?? l).join(', ') },
          { icon: 'church' as IconName, text: me.church },
          { icon: 'location_on' as IconName, text: me.heritage ? `Roots: ${me.heritage}` : undefined },
          { icon: 'local_bar' as IconName, text: me.drinks ? `Drinks ${me.drinks}` : undefined },
        ]
          .filter((r) => r.text)
          .map((r) => (
            <View key={r.icon} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
              <Icon name={r.icon} size={20} color="primary" filled={false} />
              <Text style={{ flex: 1 }}>{r.text}</Text>
            </View>
          ))}
      </Card>

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
            <Animated.View
              style={[
                { width: `${percent}%`, height: 8, borderRadius: 4, backgroundColor: colors.primaryContainer, transformOrigin: 'left' },
                reduced ? null : { animationName: FILL, animationDuration: 700, animationTimingFunction: CSS_EASE_OUT },
              ]}
            />
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
        <Text variant="labelSm" color="tertiary" center>
          {isBackendConfigured ? 'Makoma · your profile is saved to your account' : 'Makoma prototype · demo data stays on this device'}
        </Text>
      </View>
    </Screen>
  );
}
