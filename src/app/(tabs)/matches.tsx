import { router } from 'expo-router';
import { Body, Button, Screen, Title } from '@/components/ui';

// TODO: list matches from the `matches` table with last-message previews.
export default function Matches() {
  return (
    <Screen>
      <Title>Matches</Title>
      <Body muted>Your matches and conversations will appear here.</Body>
      <Button label="Open demo chat" variant="secondary" onPress={() => router.push('/chat/demo')} />
    </Screen>
  );
}
