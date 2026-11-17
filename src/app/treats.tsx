import { useEffect, useState } from 'react';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Body, Chip, Gap, Screen, Title } from '@/components/ui';
import { formatCedis } from '@/constants/ghana';
import { fetchMyVouchers } from '@/features/api';
import { colors, radius, spacing } from '@/theme/tokens';
import type { Voucher } from '@/types/domain';

/** Treats you've received: show the QR or code at the partner's counter to redeem. */
export default function Treats() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  useEffect(() => {
    fetchMyVouchers().then(setVouchers).catch(() => setVouchers([]));
  }, []);

  return (
    <Screen>
      <Title>My treats</Title>
      <Body muted>Show the QR code or code at the partner spot to redeem.</Body>
      <Gap />
      {vouchers.length === 0 ? <Body muted>No treats yet.</Body> : null}
      {vouchers.map((v) => (
        <View key={v.id} style={{ padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, gap: spacing.sm, alignItems: 'center' }}>
          <Body>
            {v.offer.emoji} {v.offer.label} from {v.fromName}
          </Body>
          <Body muted>
            {v.offer.partnerName}, {v.offer.area} · worth {formatCedis(v.offer.pricePesewas)}
          </Body>
          {v.status === 'issued' ? (
            <>
              <View style={{ padding: spacing.sm, backgroundColor: '#FFFFFF', borderRadius: radius.md }}>
                <QRCode value={v.code} size={160} />
              </View>
              <Body>{v.code}</Body>
              <Body muted>Valid until {new Date(v.expiresAt).toLocaleDateString()}</Body>
            </>
          ) : (
            <Chip label={v.status === 'redeemed' ? 'Redeemed' : 'Expired'} />
          )}
        </View>
      ))}
    </Screen>
  );
}
