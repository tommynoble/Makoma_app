import { router } from 'expo-router';
import { Body, Button, Screen, Title } from '@/components/ui';

export default function MyProfile() {
  return (
    <Screen>
      <Title>My profile</Title>
      <Body muted>Edit photos, prompts, voice intro and verification here.</Body>
      <Button label="My treats" variant="secondary" onPress={() => router.push('/treats')} />
      <Button label="Privacy & Incognito" variant="secondary" onPress={() => router.push('/settings/privacy')} />
    </Screen>
  );
}
