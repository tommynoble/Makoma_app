import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Eyebrow, IconBadge, Text } from '@/components';
import { normalizeGhanaPhone } from '@/constants/ghana';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { isBackendConfigured, supabase } from '@/lib/supabase';
import { colors, fonts, maxContentWidth, radius, shadows, spacing } from '@/theme';

/** Phone sign-in (SMS code). SIM-registered numbers deter throwaway accounts. */
export default function Phone() {
  const insets = useSafeAreaInsets();
  const { update } = useOnboarding();
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const phone = normalizeGhanaPhone(input.startsWith('+') || input.startsWith('0') ? input : `0${input}`);

  const sendCode = async () => {
    if (!phone) return;
    setError(null);
    setBusy(true);
    if (isBackendConfigured) {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) {
        setBusy(false);
        return setError(error.message);
      }
    }
    update({ phone });
    setBusy(false);
    setSent(true);
  };

  const verify = async () => {
    setError(null);
    setBusy(true);
    if (isBackendConfigured && phone) {
      const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' });
      if (error) {
        setBusy(false);
        return setError(error.message);
      }
    }
    setBusy(false);
    router.replace('/pledge');
  };

  const field = {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    justifyContent: 'center',
  } as const;
  const inputText = { fontFamily: fonts.sansMedium, fontSize: 18, color: colors.onSurface, paddingVertical: 14 } as const;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: insets.top + 64, paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.md }}>
      <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', alignItems: 'center' }}>
        <View style={{ boxShadow: shadows.warm, borderRadius: 40, marginBottom: spacing.xl }}>
          <IconBadge icon="shield" size={80} iconSize={36} bg="surfaceContainerLowest" color="primary" filled={false} />
        </View>
        <Text variant="headlineXl" accessibilityRole="header" style={{ marginBottom: spacing.md }}>
          Makoma
        </Text>
        <Text color="tertiary" center style={{ maxWidth: 300, marginBottom: 48 }}>
          Intentional Ghanaian connections, grounded in mutual respect and heritage.
        </Text>

        <Card rounded="card" padding="lg" shadow="warm" style={{ alignSelf: 'stretch', gap: spacing.md }}>
          <Eyebrow>{sent ? 'Verification code' : 'Phone number'}</Eyebrow>
          {sent ? (
            <View style={field}>
              <TextInput
                accessibilityLabel="Verification code"
                style={[inputText, { letterSpacing: 8 }]}
                keyboardType="number-pad"
                placeholder="••••••"
                placeholderTextColor={colors.tertiaryContainer}
                value={code}
                onChangeText={(t) => setCode(t.replace(/\D/g, ''))}
                maxLength={6}
                autoFocus
              />
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[field, { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }]}>
                <Text variant="labelLg" numberOfLines={1}>
                  🇬🇭 +233
                </Text>
              </View>
              <View style={[field, { flex: 1 }]}>
                <TextInput
                  accessibilityLabel="Phone number"
                  style={inputText}
                  keyboardType="phone-pad"
                  placeholder="24 123 4567"
                  placeholderTextColor={colors.tertiaryContainer}
                  value={input}
                  onChangeText={setInput}
                />
              </View>
            </View>
          )}
          <Text variant="labelMd" color="tertiary" style={{ fontFamily: fonts.sansMedium, marginBottom: spacing.sm }}>
            {sent ? `We sent a 6-digit code to ${phone}.` : 'We’ll send a secure 6-digit code via SMS to verify your account.'}
          </Text>
          {error ? (
            <Text variant="labelMd" color="error" selectable>
              {error}
            </Text>
          ) : null}
          {sent ? (
            <>
              <Button title="Verify & continue" disabled={code.length < 6} loading={busy} onPress={verify} />
              <Button title="Use a different number" variant="tonal" size="md" onPress={() => setSent(false)} />
            </>
          ) : (
            <Button title="Continue with Phone" disabled={!phone} loading={busy} onPress={sendCode} />
          )}
        </Card>

        <Text variant="labelSm" color="tertiary" center style={{ marginTop: spacing.lg, fontFamily: fonts.sansMedium }}>
          By continuing, you agree to Makoma’s Terms and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}
