import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Icon, IconBadge, Text } from '@/components';
import { normalizeGhanaPhone } from '@/constants/ghana';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { isBackendConfigured, supabase } from '@/lib/supabase';
import { colors, fonts, maxContentWidth, radius, spacing } from '@/theme';

/**
 * Phone sign-in (SMS code). Phone numbers are SIM-registered in Ghana, which
 * deters throwaway accounts.
 */
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

  const inputStyle = { flex: 1, fontFamily: fonts.sansMedium, fontSize: 18, color: colors.onSurface, paddingVertical: 14 } as const;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: insets.top + spacing.xl, paddingHorizontal: spacing.margin, paddingBottom: insets.bottom + spacing.md }}>
      <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', flex: 1, gap: spacing.xl }}>
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <IconBadge icon="verified_user" size={72} iconSize={32} bg="surfaceContainerHigh" color="primary" />
          <Text variant="headlineXl" color="primary" accessibilityRole="header">
            Makoma
          </Text>
          <Text color="tertiary" center style={{ maxWidth: 320 }}>
            Intentional Ghanaian connections, grounded in mutual respect and heritage.
          </Text>
        </View>

        <Card rounded="xl" padding="lg" shadow="md" style={{ gap: spacing.md }}>
          <Text variant="labelLg">{sent ? 'Enter your 6-digit code' : 'Phone number'}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              backgroundColor: colors.surfaceContainerLow,
              borderRadius: radius.full,
              paddingHorizontal: spacing.margin,
            }}
          >
            {sent ? (
              <TextInput
                accessibilityLabel="Verification code"
                style={[inputStyle, { letterSpacing: 6 }]}
                keyboardType="number-pad"
                placeholder="••••••"
                placeholderTextColor={colors.tertiaryContainer}
                value={code}
                onChangeText={(t) => setCode(t.replace(/\D/g, ''))}
                maxLength={6}
                autoFocus
              />
            ) : (
              <>
                <Text variant="labelLg" numberOfLines={1} style={{ flexShrink: 0 }}>
                  🇬🇭 +233
                </Text>
                <View style={{ width: 1, height: 24, backgroundColor: colors.outlineVariant }} />
                <TextInput
                  accessibilityLabel="Phone number"
                  style={inputStyle}
                  keyboardType="phone-pad"
                  placeholder="24 123 4567"
                  placeholderTextColor={colors.tertiaryContainer}
                  value={input}
                  onChangeText={setInput}
                />
              </>
            )}
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' }}>
            <Icon name="lock" size={16} color="tertiary" style={{ marginTop: 2 }} />
            <Text variant="labelMd" color="tertiary" style={{ flex: 1 }}>
              {sent ? `We sent a code to ${phone}.` : 'We’ll send a secure 6-digit code via SMS for verification.'}
            </Text>
          </View>
          {error ? (
            <Text variant="labelMd" color="error" selectable>
              {error}
            </Text>
          ) : null}
          {sent ? (
            <Button title="Verify & continue" variant="strong" icon="arrow_forward" disabled={code.length < 6} loading={busy} onPress={verify} />
          ) : (
            <Button title="Continue with Phone" variant="strong" icon="arrow_forward" disabled={!phone} loading={busy} onPress={sendCode} />
          )}
          {sent ? <Button title="Use a different number" variant="tonal" size="md" onPress={() => setSent(false)} /> : null}
        </Card>

        <Text variant="labelSm" color="tertiary" center>
          By continuing, you agree to Makoma’s Terms and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}
