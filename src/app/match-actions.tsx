import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ListRow, Text } from '@/components';
import { useSocial } from '@/features/social/social-store';
import { haptic } from '@/lib/motion';
import { colors, spacing } from '@/theme';

/** "More" sheet for a conversation: profile, date safety, unmatch, report/block. */
export default function MatchActions() {
  const insets = useSafeAreaInsets();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const social = useSocial();
  const match = social.state.matches[matchId];
  const person = social.profile(match?.profileId);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!match || !person) return null;

  const doUnmatch = async () => {
    setBusy(true);
    setError(null);
    try {
      await social.unmatch(matchId);
      haptic.medium();
      router.dismissTo('/matches');
    } catch (e: any) {
      setBusy(false);
      setError(e?.message ?? 'Couldn’t unmatch. Try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: Math.max(insets.bottom, spacing.md) }}>
      {confirm ? (
        <View style={{ gap: spacing.md }}>
          <Text variant="headlineLg" accessibilityRole="header">
            Unmatch {person.firstName}?
          </Text>
          <Text color="tertiary">The conversation disappears for both of you and can’t be restored. {person.firstName} won’t be told why.</Text>
          {error ? (
            <Text variant="labelMd" color="error">
              {error}
            </Text>
          ) : null}
          <Button title={busy ? 'Unmatching…' : 'Unmatch'} variant="warm" haptics="none" disabled={busy} onPress={doUnmatch} />
          <Button title="Keep the conversation" variant="tonal" onPress={() => setConfirm(false)} />
        </View>
      ) : (
        <View>
          <Text variant="labelSm" color="tertiary" uppercase style={{ marginBottom: spacing.xs }}>
            {person.firstName}
          </Text>
          <ListRow icon="person_search" title="View profile" onPress={() => router.replace(`/person/${person.id}`)} />
          <ListRow icon="edit_calendar" title="Plan a date safely" body="Share where and when with someone you trust" onPress={() => router.replace({ pathname: '/date-plan', params: { matchId } })} />
          <ListRow icon="heart_broken" title="Unmatch" body="End this conversation quietly" onPress={() => setConfirm(true)} />
          <ListRow icon="flag" title="Report or block" body="Confidential. They won’t know it was you." tone="danger" last onPress={() => router.replace({ pathname: '/report', params: { profileId: person.id } })} />
        </View>
      )}
    </View>
  );
}
