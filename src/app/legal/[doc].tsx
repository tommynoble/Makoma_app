import { Linking, ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Button, Card, Text } from '@/components';
import { colors, fonts, maxContentWidth, spacing } from '@/theme';

type Doc = { title: string; draft?: boolean; intro: string; sections: { h: string; p: string }[] };

// DRAFT legal copy: written in plain language for the prototype. Have a Ghanaian lawyer review
// before launch (Data Protection Act, 2012 (Act 843); Data Protection Commission registration).
const DOCS: Record<string, Doc> = {
  pledge: {
    title: 'Community pledge',
    intro: 'Makoma is for people who are serious about meeting someone. Everyone agrees to this when they join.',
    sections: [
      { h: 'Be who you say you are', p: 'Real name, real age, recent photos of you. No catfishing, no pretending.' },
      { h: 'Be clear about what you want', p: 'Marriage, something serious or friendship: say it, and respect what others say.' },
      { h: 'Respect, always', p: 'No insults, pressure or unwanted sexual messages. A polite “no thank you” is enough.' },
      { h: 'Never ask for money', p: 'No MoMo requests, no “emergencies”, no gifts on demand. Treats are offered, never asked for.' },
      { h: 'Keep others safe', p: 'Report anything that feels wrong. Reports are confidential.' },
    ],
  },
  terms: {
    title: 'Terms of service',
    draft: true,
    intro: 'These terms are a draft for the Makoma prototype and will be finalised before launch.',
    sections: [
      { h: 'Who can use Makoma', p: 'You must be 18 or older and able to form a binding contract in Ghana. One account per person.' },
      { h: 'Your content', p: 'You own your photos, prompts and voice notes. You let Makoma show them to other members to run the service.' },
      { h: 'Conduct', p: 'You agree to the Community pledge. We may remove content or accounts that break it, without notice for serious cases.' },
      { h: 'Treats and passes', p: 'Treats are vouchers redeemable at partner businesses, not cash. Passes (like Incognito) run for the time shown. Payments are processed by Paystack.' },
      { h: 'Safety', p: 'We verify and moderate, but we can’t run background checks on everyone. Use the Safety centre advice when meeting people.' },
      { h: 'Ending your account', p: 'You can pause or delete your account at any time from Settings.' },
    ],
  },
  privacy: {
    title: 'Privacy policy',
    draft: true,
    intro: 'A plain-language draft of how Makoma handles your data. It will be finalised before launch.',
    sections: [
      { h: 'What we collect', p: 'Your phone number, profile details, photos, voice notes, messages, likes and matches, the selfie you send for verification, and basic device information.' },
      { h: 'What others see', p: 'Your profile shows your first name, age (never your birthday), neighbourhood (never your exact location), photos, prompts and voice intro. Your phone number is never shown.' },
      { h: 'Selfies', p: 'Verification selfies are seen only by our review team and are not shown on your profile.' },
      { h: 'Where it’s stored', p: 'On secure servers run by our provider (Supabase), with access limited by strict rules. Photos and voice notes are private files.' },
      { h: 'Your rights', p: 'You can see, correct and delete your data. Deleting your account removes your profile, photos, voice notes and messages. Payment records are kept without your name.' },
      { h: 'Contact', p: 'Questions about your data: privacy@makoma.app' },
    ],
  },
  help: {
    title: 'Help & feedback',
    intro: 'Something not working, or an idea to make Makoma better? We read every message.',
    sections: [
      { h: 'Safety concern', p: 'Use “Report or block” in the chat or on their profile. It’s the fastest way to reach our team.' },
      { h: 'Account or payment', p: 'Email support@makoma.app with your phone number and what happened.' },
      { h: 'Ideas', p: 'Tell us what would make Makoma better for you. This app is being built with its first members.' },
    ],
  },
};

/** Static info pages: pledge, terms, privacy, help. */
export default function LegalDoc() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const d = DOCS[doc] ?? DOCS.help;
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: colors.surface }} contentContainerStyle={{ padding: spacing.margin, paddingBottom: spacing.xl, gap: spacing.lg, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}>
      <Stack.Screen options={{ title: d.title }} />
      <Text variant="headlineXl" accessibilityRole="header">
        {d.title}
      </Text>
      {d.draft ? (
        <Card bg="secondaryFixed" shadow="none" padding="md">
          <Text variant="labelMd" color="onSecondaryFixed" style={{ fontFamily: fonts.sansSemiBold }}>
            Draft for the prototype. Not yet reviewed by a lawyer.
          </Text>
        </Card>
      ) : null}
      <Text color="tertiary">{d.intro}</Text>
      {d.sections.map((s) => (
        <View key={s.h} style={{ gap: spacing.xs }}>
          <Text variant="headlineMd" style={{ fontSize: 20 }}>
            {s.h}
          </Text>
          <Text>{s.p}</Text>
        </View>
      ))}
      {doc === 'help' ? <Button title="Email support" icon="mail" variant="tonal" onPress={() => Linking.openURL('mailto:support@makoma.app?subject=Makoma%20feedback').catch(() => {})} /> : null}
    </ScrollView>
  );
}
