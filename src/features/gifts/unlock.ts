import type { GiftUnlock, Message } from '@/types/domain';

/**
 * Anti-scam treat lock. Treats unlock once GIFT_UNLOCK_VOICE_NOTES voice notes
 * have been exchanged, with BOTH people having sent at least one. Voice is
 * hard to fake at scale, so this keeps instant-gift scammers out.
 *
 * Mirrors gift_unlock_status() in supabase/migrations/0001_init.sql, which is
 * what the server enforces. This copy only drives the progress UI.
 *
 * Product rule: there is never a "request a gift" action anywhere in the app.
 */
export const GIFT_UNLOCK_VOICE_NOTES = 3;

export function computeGiftUnlock(messages: Message[]): GiftUnlock {
  const voice = messages.filter((m) => m.kind === 'voice');
  const bothSent = new Set(voice.map((m) => m.senderId)).size >= 2;
  return {
    voiceNotes: voice.length,
    voiceNotesRequired: GIFT_UNLOCK_VOICE_NOTES,
    bothSent,
    unlocked: voice.length >= GIFT_UNLOCK_VOICE_NOTES && bothSent,
  };
}

/** How many dots to fill on the progress indicator (never shows full while locked). */
export function giftUnlockSteps(u: GiftUnlock): number {
  if (u.unlocked) return u.voiceNotesRequired;
  return Math.min(u.voiceNotes, u.voiceNotesRequired - (u.bothSent ? 0 : 1));
}

export function giftLockHint(u: GiftUnlock): string {
  if (u.unlocked) return 'Treats unlocked';
  if (u.voiceNotes >= u.voiceNotesRequired && !u.bothSent) return 'Treats unlock once you have both sent a voice note';
  return `${Math.min(u.voiceNotes, u.voiceNotesRequired)} of ${u.voiceNotesRequired} voice notes exchanged`;
}
