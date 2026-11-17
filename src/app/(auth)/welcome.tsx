import { router } from 'expo-router';
import { Body, Button, Gap, Screen, Title } from '@/components/ui';

export default function Welcome() {
  return (
    <Screen>
      <Gap size={80} />
      <Title>Makoma</Title>
      <Body>Intentional dating for people who mean it. Verified profiles, real voices, and respect first.</Body>
      <Gap size={40} />
      <Button label="Get started" onPress={() => router.push('/phone')} />
    </Screen>
  );
}
