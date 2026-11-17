import { useState } from 'react';
import { TextInput } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, Gap, Screen, Title } from '@/components/ui';
import { normalizeGhanaPhone } from '@/constants/ghana';
import { useOnboarding } from '@/features/onboarding/OnboardingContext';
import { isBackendConfigured, supabase } from '@/lib/supabase';
import { colors, radius, spacing } from '@/theme/tokens';

/** Phone-number sign-in (SMS OTP). Phone numbers are SIM-registered in Ghana, which deters throwaway accounts. */
export default function Phone() {
  const { update } = useOnboarding();
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const phone = normalizeGhanaPhone(input);

  const sendCode = async () => {
    if (!phone) return;
    setError(null);
    if (isBackendConfigured) {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) return setError(error.message);
    }
    update({ phone });
    setSent(true);
  };

  const verify = async () => {
    if (isBackendConfigured && phone) {
      const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' });
      if (error) return setError(error.message);
    }
    router.replace('/intent');
  };

  const inputStyle = { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, fontSize: 18 };

  return (
    <Screen>
      <Title>{sent ? 'Enter your code' : 'Your phone number'}</Title>
      {!sent ? (
        <>
          <TextInput style={inputStyle} keyboardType="phone-pad" placeholder="024 123 4567" value={input} onChangeText={setInput} />
          <Gap />
          <Button label="Send code" disabled={!phone} onPress={sendCode} />
        </>
      ) : (
        <>
          <TextInput style={inputStyle} keyboardType="number-pad" placeholder="123456" value={code} onChangeText={setCode} maxLength={6} />
          <Gap />
          <Button label="Verify" disabled={code.length < 6} onPress={verify} />
        </>
      )}
      {error ? <Body muted>{error}</Body> : null}
    </Screen>
  );
}
