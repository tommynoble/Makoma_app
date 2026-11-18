import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Card, Pill, Text } from '@/components';
import { formatCedis } from '@/constants/ghana';
import { fetchMyVouchers } from '@/features/api';
import { colors, fonts, maxContentWidth, radius, spacing } from '@/theme';
import type { Voucher } from '@/types/domain';

/** Treats you've received: show the QR or code at the partner's counter to redeem. */
export default function Treats() {
  const [vouchers, setVouchers] = useState<Voucher[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    fetchMyVouchers().then(setVouchers).catch(() => setFailed(true));
  }, []);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: colors.surface }} contentContainerStyle={{ padding: spacing.margin, paddingTop: spacing.lg, gap: spacing.section, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}>
      <Text color="tertiary">Show the QR code or code at the partner spot to redeem.</Text>
      {failed ? <Text color="error">We couldn’t load your treats. Pull down to try again.</Text> : null}
      {vouchers?.length === 0 ? <Text color="tertiary">No treats yet. When a match sends you one, it appears here.</Text> : null}
      {vouchers?.map((v) => (
        <Card key={v.id} rounded="xl" padding="lg" shadow="md" style={{ alignItems: 'center', gap: spacing.md }}>
          <Pill label={`From ${v.fromName}`} icon="redeem" iconColor="secondary" color="onSecondaryFixed" bg="secondaryFixed" size="md" style={{ alignSelf: 'center' }} />
          <View style={{ alignItems: 'center' }}>
            <Text variant="headlineLg">{v.offer.label}</Text>
            <Text color="tertiary">
              {v.offer.partnerName}, {v.offer.area} · worth {formatCedis(v.offer.pricePesewas)}
            </Text>
          </View>
          {v.status === 'issued' ? (
            <>
              <View style={{ padding: spacing.md, backgroundColor: colors.surfaceContainerLowest, borderRadius: radius.md, borderWidth: 1, borderColor: colors.surfaceContainerHighest }}>
                <QRCode value={v.code} size={168} color={colors.onSurface} backgroundColor={colors.surfaceContainerLowest} />
              </View>
              <Text selectable style={{ fontFamily: fonts.sansBold, fontSize: 20, letterSpacing: 2, color: colors.onSurface }}>
                {v.code}
              </Text>
              <Text variant="labelMd" color="tertiary">
                Valid until {new Date(v.expiresAt).toLocaleDateString()}
              </Text>
            </>
          ) : (
            <Pill label={v.status === 'redeemed' ? 'Redeemed' : 'Expired'} size="md" style={{ alignSelf: 'center' }} />
          )}
        </Card>
      ))}
    </ScrollView>
  );
}
