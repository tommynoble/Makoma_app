import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Eyebrow, Field, FormScrollView, Icon, KeyboardDoneBar, ListRow, Text } from '@/components';
import { deleteMyAccount } from '@/features/api';
import { ME_KEY, useOnboarding } from '@/features/onboarding/onboarding-context';
import { SOCIAL_KEY, useSocial } from '@/features/social/social-store';
import { haptic } from '@/lib/motion';
import { clearPersisted } from '@/lib/persist';
import { isBackendConfigured } from '@/lib/supabase';
import { colors, fonts, maxContentWidth, spacing } from '@/theme';

/** Permanent account deletion (required by the App Store and Google Play). Pausing is offered first. */
export default function DeleteAccount() {
  const insets = useSafeAreaInsets();
  const { reset } = useOnboarding();
  const social = useSocial();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmed = typed.trim().toUpperCase() === 'DELETE';

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      if (isBackendConfigured) await deleteMyAccount();
      await clearPersisted([ME_KEY, SOCIAL_KEY]);
      reset();
      social.reset();
      haptic.medium();
      router.dismissAll();
      router.replace('/phone');
    } catch (e: any) {
      setBusy(false);
      setError(e?.message ?? 'Couldn’t delete your account. Try again, or contact support.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <FormScrollView keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.margin, gap: spacing.lg, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}>
        <Text variant="headlineXl" accessibilityRole="header">
          Delete your account?
        </Text>
        <Text color="tertiary">This can’t be undone. Your profile, photos, voice notes, matches and messages are removed for good.</Text>
        <Card padding="none" style={{ paddingHorizontal: spacing.md }}>
          <ListRow
            icon="pause_circle"
            title="Just need a break?"
            body={social.state.paused ? 'Your profile is already paused' : 'Pause instead: you’ll be hidden, nothing is lost'}
            onPress={
              social.state.paused
                ? undefined
                : async () => {
                    await social.setPaused(true).catch(() => {});
                    haptic.success();
                    router.back();
                  }
            }
            last
          />
        </Card>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Icon name="info" size={18} color="tertiary" filled={false} />
          <Text variant="labelMd" color="tertiary" style={{ flex: 1, fontFamily: fonts.sansMedium }}>
            Unused treat vouchers you received are lost. Payment records are kept without your name, as the law requires.
          </Text>
        </View>
        <View style={{ gap: spacing.sm }}>
          <Eyebrow>Type DELETE to confirm</Eyebrow>
          <Field accessibilityLabel="Type DELETE to confirm" placeholder="DELETE" value={typed} onChangeText={setTyped} autoCapitalize="characters" autoCorrect={false} />
        </View>
      </FormScrollView>
      <View style={{ paddingHorizontal: spacing.margin, paddingTop: spacing.sm, paddingBottom: Math.max(insets.bottom, spacing.md), gap: spacing.sm }}>
        {error ? (
          <Text variant="labelMd" color="error" center>
            {error}
          </Text>
        ) : null}
        <Button title={busy ? 'Deleting…' : 'Delete my account'} variant="warm" haptics="none" disabled={!confirmed || busy} onPress={remove} />
      </View>
      <KeyboardDoneBar />
    </View>
  );
}
