import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Card, ListRow, Text, Toggle } from '@/components';
import { ME_KEY, useOnboarding } from '@/features/onboarding/onboarding-context';
import { SOCIAL_KEY, useSocial, type NotificationKey } from '@/features/social/social-store';
import { haptic } from '@/lib/motion';
import { clearPersisted } from '@/lib/persist';
import { isBackendConfigured, supabase } from '@/lib/supabase';
import { colors, maxContentWidth, spacing } from '@/theme';

const NOTIFS: { key: NotificationKey; title: string; body: string }[] = [
  { key: 'matches', title: 'New matches', body: 'When a like becomes mutual' },
  { key: 'messages', title: 'Messages', body: 'Texts, voice notes and treats' },
  { key: 'likes', title: 'Likes', body: 'When someone likes your profile' },
  { key: 'reminders', title: 'Gentle reminders', body: 'When it’s your turn to reply' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="labelSm" color="tertiary" uppercase style={{ paddingHorizontal: spacing.xs }}>
        {title}
      </Text>
      <Card rounded="card" padding="none" style={{ paddingHorizontal: spacing.md }}>
        {children}
      </Card>
    </View>
  );
}

/** Account, notifications, privacy, safety and legal. */
export default function Settings() {
  const { draft, reset } = useOnboarding();
  const social = useSocial();
  const [pausing, setPausing] = useState(false);

  const togglePause = async (paused: boolean) => {
    setPausing(true);
    try {
      await social.setPaused(paused);
    } finally {
      setPausing(false);
    }
  };

  const logOut = async () => {
    haptic.medium();
    if (isBackendConfigured) await supabase.auth.signOut().catch(() => {});
    await clearPersisted([ME_KEY, SOCIAL_KEY]);
    reset();
    social.reset();
    router.dismissAll();
    router.replace('/phone');
  };

  const phone = draft.phone ? draft.phone.replace(/^\+233(\d{2})(\d{3})(\d{4})$/, '+233 $1 $2 $3') : 'Not set';

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: colors.surface }} contentContainerStyle={{ padding: spacing.margin, paddingBottom: spacing.xl, gap: spacing.lg, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}>
      <Section title="Account">
        <ListRow icon="phone_iphone" title="Phone number" body={phone} />
        <ListRow
          icon="pause_circle"
          title="Pause my profile"
          body={social.state.paused ? 'Hidden from Discover. Your chats still work.' : 'Take a break without deleting anything'}
          trailing={<Toggle value={social.state.paused} onChange={(v) => !pausing && togglePause(v)} label="Pause my profile" />}
        />
        <ListRow icon="person_edit" title="Edit profile" onPress={() => router.push('/edit-profile')} last />
      </Section>

      <Section title="Notifications">
        {NOTIFS.map((n, i) => (
          <ListRow
            key={n.key}
            icon={i === 0 ? 'favorite' : i === 1 ? 'chat_bubble' : i === 2 ? 'auto_awesome' : 'notifications'}
            title={n.title}
            body={n.body}
            last={i === NOTIFS.length - 1}
            trailing={<Toggle value={social.state.notifications[n.key]} onChange={(v) => social.setNotification(n.key, v)} label={n.title} />}
          />
        ))}
      </Section>

      <Section title="Privacy & safety">
        <ListRow icon="visibility_off" title="Privacy & Incognito" body="Who can see you" onPress={() => router.push('/settings/privacy')} />
        <ListRow icon="shield_person" title="Safety centre" body="Date tips, scams to avoid, emergency numbers" onPress={() => router.push('/safety')} />
        <ListRow icon="block" title="Blocked people" body={social.state.blocked.length ? `${social.state.blocked.length} blocked` : 'No one blocked'} onPress={() => router.push('/settings/blocked')} last />
      </Section>

      <Section title="About">
        <ListRow icon="handshake" title="Community pledge" onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'pledge' } })} />
        <ListRow icon="description" title="Terms of service" onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'terms' } })} />
        <ListRow icon="policy" title="Privacy policy" onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'privacy' } })} />
        <ListRow icon="support_agent" title="Help & feedback" body="We read everything" onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'help' } })} last />
      </Section>

      <Section title="Leave">
        <ListRow icon="logout" title="Log out" body={isBackendConfigured ? undefined : 'Demo: also resets the demo data'} onPress={logOut} />
        <ListRow icon="delete_forever" title="Delete account" body="Permanently remove your profile and data" tone="danger" onPress={() => router.push('/settings/delete-account')} last />
      </Section>

      <Text variant="labelSm" color="tertiary" center>
        Makoma {Constants.expoConfig?.version ?? ''} · Made with care in Accra
      </Text>
    </ScrollView>
  );
}
