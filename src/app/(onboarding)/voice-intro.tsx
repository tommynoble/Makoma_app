import { router } from 'expo-router';
import { Body, Button, Gap, Screen, Title } from '@/components/ui';
import { useOnboarding } from '@/features/onboarding/OnboardingContext';
import { useVoiceRecorder, VOICE_INTRO_MAX_MS } from '@/features/voice/useVoiceRecorder';

/** A short voice intro on the profile lets people hear warmth, accent and humour before matching. */
export default function VoiceIntro() {
  const { draft, update } = useOnboarding();
  const rec = useVoiceRecorder(VOICE_INTRO_MAX_MS);

  const toggle = async () => {
    if (rec.isRecording) {
      const clip = await rec.stop();
      if (clip) update({ voiceIntro: clip });
    } else {
      await rec.start();
    }
  };

  return (
    <Screen>
      <Title>Say hello</Title>
      <Body muted>Record up to 30 seconds. Any language you like: English, Twi, Ga, Ewe, Pidgin…</Body>
      <Gap />
      <Button label={rec.isRecording ? 'Stop' : draft.voiceIntro ? 'Re-record' : 'Start recording'} onPress={toggle} />
      {draft.voiceIntro ? <Body>Recorded {Math.round(draft.voiceIntro.durationMs / 1000)}s ✓</Body> : null}
      {rec.error ? <Body muted>{rec.error}</Body> : null}
      <Gap />
      <Button label="Continue" onPress={() => router.push('/verify')} />
      <Button label="Skip for now" variant="secondary" onPress={() => router.push('/verify')} />
    </Screen>
  );
}
