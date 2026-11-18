import { useRef, useState } from 'react';
import { View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { Button, Card, Heading, Icon, IconBadge, Pill, Screen, Text } from '@/components';
import { submitSelfieVerification } from '@/features/api';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { isBackendConfigured } from '@/lib/supabase';
import { alpha, colors, shadows, spacing } from '@/theme';

// A random pose makes it much harder to pass with a reused photo or video.
const POSES = ['touch your nose with your right hand', 'give a thumbs up next to your face', 'hold up a peace sign next to your face'];

const corner = (d: string) => (
  <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
    <Path d={d} stroke={colors.primary} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

export default function Selfie() {
  const { draft, update } = useOnboarding();
  const [permission, requestPermission] = useCameraPermissions();
  const [pose] = useState(() => POSES[Math.floor(Math.random() * POSES.length)]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const camera = useRef<CameraView>(null);
  const live = !!permission?.granted && !draft.selfieSubmitted;

  const onPrimary = async () => {
    setError(null);
    if (draft.selfieSubmitted) return router.push('/prompts');
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) setError('Camera access is needed to verify you. You can enable it in Settings.');
      return;
    }
    try {
      setBusy(true);
      const photo = await camera.current?.takePictureAsync({ quality: 0.7 });
      if (!photo) throw new Error('Could not take the photo. Please try again.');
      if (isBackendConfigured) await submitSelfieVerification(photo.uri, pose);
      update({ selfieSubmitted: true });
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const status = draft.selfieSubmitted ? 'Submitted for review' : live ? 'Camera ready' : 'Camera off';

  return (
    <Screen
      step={4}
      footer={
        <>
          <Button
            title={draft.selfieSubmitted ? 'Continue' : live ? 'Take Live Selfie' : 'Turn on camera'}
            variant="strong"
            iconLeft={draft.selfieSubmitted ? undefined : 'photo_camera'}
            icon={draft.selfieSubmitted ? 'arrow_forward' : undefined}
            iconFilled
            loading={busy}
            onPress={onPrimary}
          />
          {!draft.selfieSubmitted ? <Button title="Skip for now" variant="tonal" size="md" onPress={() => router.push('/prompts')} /> : null}
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <Heading
          center
          eyebrow={<Pill label="Trust & Safety" icon="security" iconFilled iconColor="primary" uppercase style={{ alignSelf: 'center' }} />}
          title="Quick safety check."
          subtitle="We match a live selfie to your profile photos to unlock your Verified Shield. It is never shown on your profile."
        />
        <Pill label="Verified profiles are shown first" icon="verified_user" iconFilled color="primary" bg={alpha(colors.primary, 0.1)} size="md" style={{ alignSelf: 'center' }} />
      </View>

      <View style={{ alignItems: 'center', marginVertical: spacing.sm }}>
        <View
          style={{
            width: 256,
            height: 256,
            borderRadius: 128,
            backgroundColor: colors.surfaceContainerLow,
            boxShadow: shadows.halo,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={256} height={256} viewBox="0 0 256 256" style={{ position: 'absolute' }}>
            <Circle cx={128} cy={128} r={118} fill="none" stroke={alpha(colors.outlineVariant, 0.6)} strokeWidth={1.5} strokeDasharray="6 8" />
          </Svg>
          <View style={{ position: 'absolute', inset: 16, justifyContent: 'space-between' }} pointerEvents="none">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {corner('M1 9V5C1 2.79086 2.79086 1 5 1H9')}
              {corner('M21 9V5C21 2.79086 19.2091 1 17 1H13')}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {corner('M1 13V17C1 19.2091 2.79086 21 5 21H9')}
              {corner('M21 13V17C21 19.2091 19.2091 21 17 21H13')}
            </View>
          </View>
          <View style={{ width: 208, height: 208, borderRadius: 104, overflow: 'hidden', backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' }}>
            {live ? (
              <CameraView ref={camera} facing="front" style={{ width: 208, height: 208 }} />
            ) : draft.selfieSubmitted ? (
              <View style={{ flex: 1, alignSelf: 'stretch', backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.onPrimary, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={36} color="primary" />
                </View>
                <Text variant="labelMd" color="onPrimary" uppercase>
                  Selfie sent
                </Text>
              </View>
            ) : (
              <Svg width={112} height={144} viewBox="0 0 120 160" fill="none">
                <Path
                  d="M60 16C37.9 16 20 35.7 20 60C20 83.2 34.7 103.7 55.5 107.5C57 107.8 58.5 109.1 58.5 110.7V118C58.5 119.7 59.8 121 61.5 121C63.2 121 64.5 119.7 64.5 118V110.7C64.5 109.1 66 107.8 67.5 107.5C85.3 103.7 100 83.2 100 60C100 35.7 82.1 16 60 16Z"
                  stroke={alpha(colors.primary, 0.45)}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                <Path d="M42 58H48M72 58H78" stroke={alpha(colors.primary, 0.45)} strokeWidth={2.5} strokeLinecap="round" />
                <Path d="M54 84C57.5 86 62.5 86 66 84" stroke={alpha(colors.primary, 0.45)} strokeWidth={2} strokeLinecap="round" />
                <Path d="M12 152C16 138 34 130 60 130C86 130 104 138 108 152" stroke={alpha(colors.primary, 0.45)} strokeWidth={1.8} strokeDasharray="3 3" strokeLinecap="round" />
              </Svg>
            )}
          </View>
          <View
            style={{
              position: 'absolute',
              bottom: -10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: colors.surface,
              boxShadow: shadows.md,
            }}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: live || draft.selfieSubmitted ? colors.primary : colors.outlineVariant }} />
            <Text variant="labelSm">{status}</Text>
          </View>
        </View>
      </View>

      <Card bg="surfaceContainerLow" style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
        <IconBadge icon="face_retouching_natural" size={40} iconSize={22} bg="surfaceContainerHighest" color="secondary" />
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text variant="labelLg">Framing tips</Text>
          <Text color="onSurfaceVariant">
            Position your face in the circle and {pose}. Keep clear, natural lighting.
          </Text>
        </View>
      </Card>

      {error ? (
        <Text variant="labelMd" color="error" center selectable>
          {error}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="lock" size={16} color="tertiary" />
          <Text variant="labelSm" color="tertiary">
            Stored privately
          </Text>
        </View>
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="visibility_off" size={16} color="tertiary" />
          <Text variant="labelSm" color="tertiary">
            Never on your profile
          </Text>
        </View>
      </View>
    </Screen>
  );
}
