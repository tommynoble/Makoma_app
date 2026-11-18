import { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, CodeInput, Enter, Eyebrow, IconBadge, Text } from '@/components';
import { normalizeGhanaPhone } from '@/constants/ghana';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { haptic } from '@/lib/motion';
import { isBackendConfigured, supabase } from '@/lib/supabase';
import { colors, fonts, maxContentWidth, radius, shadows, spacing } from '@/theme';

/** "241234567" -> "24 123 4567" (Ghana mobile, without the leading 0). */
function formatLocal(digits: string) {
  const d = digits.slice(0, 9);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 9)].filter(Boolean).join(' ');
}

const RESEND_SECONDS = 30;

/** Phone sign-in (SMS code). SIM-registered numbers deter throwaway accounts. */
export default function Phone() {
  const insets = useSafeAreaInsets();
  const { draft, update } = useOnboarding();
  const [digits, setDigits] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const phone = digits.length === 9 ? normalizeGhanaPhone(`0${digits}`) : null;
  const invalid = digits.length === 9 && !phone;

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

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
    setCode('');
    setResendIn(RESEND_SECONDS);
  };

  const verify = async (token = code) => {
    if (token.length < 6 || busy) return;
    setError(null);
    setBusy(true);
    if (isBackendConfigured && phone) {
      const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
      if (error) {
        setBusy(false);
        haptic.light();
        return setError('That code didn’t work. Check it and try again.');
      }
    }
    haptic.success();
    setBusy(false);
    router.replace(draft.onboarded ? '/discover' : '/pledge');
  };

  const field = { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.hairline, paddingHorizontal: spacing.md, minHeight: 58, justifyContent: 'center' } as const;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: insets.top + 56, paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.md }}>
      <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', alignItems: 'center' }}>
        <Enter index={0} style={{ alignItems: 'center' }}>
          <View style={{ boxShadow: shadows.warm, borderRadius: 40, marginBottom: spacing.xl }}>
            <IconBadge icon="shield" size={80} iconSize={36} bg="surfaceContainerLowest" color="primary" filled={false} />
          </View>
          <Text variant="headlineXl" accessibilityRole="header" style={{ marginBottom: spacing.md }}>
            Makoma
          </Text>
          <Text color="tertiary" center style={{ maxWidth: 300, marginBottom: 44 }}>
            Intentional Ghanaian connections, grounded in mutual respect and heritage.
          </Text>
        </Enter>

        <Enter index={2} style={{ alignSelf: 'stretch' }}>
          <Card rounded="card" padding="lg" shadow="warm" style={{ gap: spacing.md }}>
            {sent ? (
              <>
                <Eyebrow>Enter the 6-digit code</Eyebrow>
                <Text variant="labelMd" color="tertiary" style={{ fontFamily: fonts.sansMedium, fontSize: 14 }}>
                  Sent to +233 {formatLocal(digits)}.{' '}
                  <Text variant="labelMd" color="primary" onPress={() => setSent(false)} style={{ fontFamily: fonts.sansBold, fontSize: 14 }} accessibilityRole="link">
                    Change
                  </Text>
                </Text>
                <CodeInput
                  value={code}
                  error={!!error}
                  onChange={(v) => {
                    setError(null);
                    setCode(v);
                    if (v.length === 6) verify(v);
                  }}
                />
                {error ? (
                  <Text variant="labelMd" color="error" selectable>
                    {error}
                  </Text>
                ) : !isBackendConfigured ? (
                  <Text variant="labelSm" color="tertiary">
                    Demo mode: any 6 digits will work.
                  </Text>
                ) : null}
                <Button title="Verify & continue" haptics="none" disabled={code.length < 6} loading={busy} onPress={() => verify()} />
                <Pressable accessibilityRole="button" disabled={resendIn > 0} onPress={sendCode} hitSlop={10} style={{ alignSelf: 'center', minHeight: 36, justifyContent: 'center' }}>
                  <Text variant="labelMd" color={resendIn > 0 ? 'tertiary' : 'primary'} style={{ fontFamily: fonts.sansBold }}>
                    {resendIn > 0 ? `Resend code in 0:${String(resendIn).padStart(2, '0')}` : 'Resend code'}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Eyebrow>Phone number</Eyebrow>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={[field, { flexDirection: 'row', alignItems: 'center' }]}>
                    <Text variant="labelLg" numberOfLines={1}>
                      🇬🇭 +233
                    </Text>
                  </View>
                  <View style={[field, { flex: 1, borderColor: invalid ? colors.error : colors.hairline }]}>
                    <TextInput
                      accessibilityLabel="Phone number"
                      style={{ fontFamily: fonts.sansSemiBold, fontSize: 18, letterSpacing: 0.5, color: colors.onSurface, paddingVertical: 14 }}
                      keyboardType="phone-pad"
                      textContentType="telephoneNumber"
                      autoComplete="tel"
                      placeholder="24 123 4567"
                      placeholderTextColor={colors.tertiaryContainer}
                      value={formatLocal(digits)}
                      onChangeText={(t) => {
                        // Accept pasted numbers in any format: +233..., 0..., or local.
                        let d = t.replace(/\D/g, '');
                        if (d.startsWith('233')) d = d.slice(3);
                        if (d.startsWith('0')) d = d.slice(1);
                        setDigits(d.slice(0, 9));
                      }}
                      maxLength={11}
                      autoFocus
                    />
                  </View>
                </View>
                <Text variant="labelMd" color={invalid ? 'error' : 'tertiary'} style={{ fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20 }}>
                  {invalid ? 'That doesn’t look like a Ghana mobile number. Check the first digits.' : 'We’ll send a secure 6-digit code via SMS.'}
                </Text>
                {error ? (
                  <Text variant="labelMd" color="error" selectable>
                    {error}
                  </Text>
                ) : null}
                <Button title="Continue with Phone" disabled={!phone} loading={busy} onPress={sendCode} />
              </>
            )}
          </Card>
        </Enter>

        <Text variant="labelSm" color="tertiary" center style={{ marginTop: spacing.lg, fontFamily: fonts.sansMedium }}>
          By continuing, you agree to Makoma’s Terms and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}
