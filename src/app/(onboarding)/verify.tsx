import { useRef, useState } from 'react';
import { View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Body, Button, Gap, Screen, Title, VerifiedBadge } from '@/components/ui';
import { isBackendConfigured } from '@/lib/supabase';
import { submitSelfieVerification } from '@/features/api';

const POSES = ['Touch your nose with your right hand', 'Give a thumbs up with your left hand', 'Peace sign next to your face'];

/**
 * Selfie verification with a random pose (blocks reused photos). Reviewed by
 * moderators or a face-match service; verified users get a prestige card.
 */
export default function Verify() {
  const [permission, requestPermission] = useCameraPermissions();
  const [pose] = useState(() => POSES[Math.floor(Math.random() * POSES.length)]);
  const [submitted, setSubmitted] = useState(false);
  const camera = useRef<CameraView>(null);

  const capture = async () => {
    const photo = await camera.current?.takePictureAsync({ quality: 0.7 });
    if (!photo) return;
    if (isBackendConfigured) await submitSelfieVerification(photo.uri, pose);
    setSubmitted(true);
  };

  return (
    <Screen>
      <Title>Get verified</Title>
      <View style={{ flexDirection: 'row' }}>
        <VerifiedBadge />
      </View>
      <Body muted>Verified profiles get a gold card and appear first. It is how people know you are real.</Body>
      <Gap />
      {submitted ? (
        <Body>Submitted. We will review it shortly.</Body>
      ) : !permission?.granted ? (
        <Button label="Allow camera" onPress={requestPermission} />
      ) : (
        <>
          <Body>{pose}</Body>
          <CameraView ref={camera} facing="front" style={{ height: 360, borderRadius: 16 }} />
          <Button label="Take selfie" onPress={capture} />
        </>
      )}
      <Gap />
      <Button label={submitted ? 'Continue' : 'Skip for now'} variant={submitted ? 'primary' : 'secondary'} onPress={() => router.replace('/discover')} />
    </Screen>
  );
}
