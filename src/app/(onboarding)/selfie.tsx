import { useRef, useState } from 'react';
import { View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Heading, Icon, Screen, Text } from '@/components';
import { submitSelfieVerification } from '@/features/api';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { haptic } from '@/lib/motion';
import { isBackendConfigured } from '@/lib/supabase';
import { colors, fonts, radius, spacing } from '@/theme';

// A random pose makes it much harder to pass with a reused photo or video.
const POSES = ['hold up a peace sign next to your face', 'touch your nose with your right hand', 'give a thumbs up next to your face'];

const bracket = (pos: object) => (
  <View style={[{ position: 'absolute', width: 32, height: 32, borderColor: colors.primary }, pos]} pointerEvents="none" />
);

export default function Selfie() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromProfile = from === 'profile';
  const next = () => (fromProfile ? router.back() : router.push('/voice'));
  const { draft, update } = useOnboarding();
  const [permission, requestPermission] = useCameraPermissions();
  const [pose] = useState(() => POSES[Math.floor(Math.random() * POSES.length)]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const camera = useRef<CameraView>(null);
  const live = !!permission?.granted && !draft.selfieSubmitted;

  const onPrimary = async () => {
    setError(null);
    if (draft.selfieSubmitted) return next();
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
      haptic.success();
      update({ selfieSubmitted: true });
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const status = draft.selfieSubmitted ? 'Sent for review' : live ? 'Camera ready' : 'Camera off';

  return (
    <Screen
      step={fromProfile ? undefined : 4}
      footer={
        <>
          <Button
            title={draft.selfieSubmitted ? (fromProfile ? 'Done' : 'Continue') : live ? 'Take Live Selfie' : 'Turn on camera'}
            iconLeft={draft.selfieSubmitted ? undefined : 'photo_camera'}
            loading={busy}
            onPress={onPrimary}
          />
          {!draft.selfieSubmitted ? <Button title="Skip for now" variant="tonal" size="md" onPress={next} /> : null}
        </>
      }
    >
      <Heading title="Quick safety check." subtitle="Verification builds trust in the Makoma community. Your selfie is never shown on your profile." />

      <View style={{ alignItems: 'center', paddingVertical: spacing.sm }}>
        <View style={{ width: 256, height: 256, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', inset: 0, borderRadius: 128, borderWidth: 2, borderColor: colors.hairline }} />
          <View style={{ width: 236, height: 236, borderRadius: 118, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainerLow }}>
            {live ? (
              <CameraView ref={camera} facing="front" style={{ width: 236, height: 236 }} />
            ) : draft.selfieSubmitted ? (
              <View style={{ flex: 1, alignSelf: 'stretch', backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check_circle" size={72} color="primaryFixed" />
              </View>
            ) : (
              <Icon name="face" size={110} color="outlineVariant" filled={false} />
            )}
          </View>
          {bracket({ top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 })}
          {bracket({ top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 })}
          {bracket({ bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 })}
          {bracket({ bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 })}
          <View style={{ position: 'absolute', bottom: -12, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.primaryFixed }}>
            <Text variant="labelSm" color="primary" uppercase>
              {status}
            </Text>
          </View>
        </View>
      </View>

      <Card rounded="card" padding="margin" shadow="none" bg="surfaceContainerLow" style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', marginTop: spacing.sm }}>
        <Icon name="lightbulb" size={22} color="secondary" filled={false} style={{ marginTop: 1 }} />
        <Text variant="labelMd" color="secondary" style={{ flex: 1, fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 21 }}>
          <Text variant="labelMd" color="secondary" style={{ fontFamily: fonts.sansBold, fontSize: 14 }}>
            FRAMING TIP:{' '}
          </Text>
          Please {pose} to show you’re taking this live.
        </Text>
      </Card>

      {error ? (
        <Text variant="labelMd" color="error" center selectable>
          {error}
        </Text>
      ) : null}
    </Screen>
  );
}
