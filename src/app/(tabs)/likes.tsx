import { View } from 'react-native';
import { Card, Heading, IconBadge, Pill, Screen, Text } from '@/components';
import { spacing } from '@/theme';

// TODO: needs the Stitch "Likes You" design code and a decision on whether
// seeing who liked you is free or a paid sachet pass.
export default function Likes() {
  return (
    <Screen back={false} bottomInset={false}>
      <Heading title="Likes You" subtitle="Thoughtful connections from people who liked your voice notes and answers. Take your time." />
      <Pill label="Verified pool" icon="verified" color="primary" size="md" />
      <Card bg="surfaceContainerLow" rounded="xl" padding="lg" shadow="none" style={{ alignItems: 'center', gap: spacing.md }}>
        <IconBadge icon="favorite" bg="secondaryFixed" color="secondary" size={56} iconSize={28} />
        <View style={{ gap: spacing.xs }}>
          <Text variant="headlineMd" center>
            No likes yet.
          </Text>
          <Text color="tertiary" center>
            When someone likes a photo or answer on your profile, it shows up here with their note.
          </Text>
        </View>
      </Card>
    </Screen>
  );
}
