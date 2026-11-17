import type { GiftUnlock, Message } from '@/types/domain';

/**
 * Anti-scam gift lock. Treats only unlock once a conversation is real:
 *   - at least GIFT_UNLOCK_MESSAGES messages, with BOTH people having replied, or
 *   - a voice note has been sent.
 * Mirrors gift_unlock_status() in supabase/migrations/0001_init.sql, which is
 * what the server actually enforces. This copy only drives the progress UI.
 *
 * Product rule: there is never a "request a gift" action anywhere in the app.
 */
export const GIFT_UNLOCK_MESSAGES = 5;

export function computeGiftUnlock(messages: Message[]): GiftUnlock {
  const convo = messages.filter((m) => m.kind === 'text' || m.kind === 'voice');
  const voiceNotes = convo.filter((m) => m.kind === 'voice').length;
  const bothReplied = new Set(convo.map((m) => m.senderId)).size >= 2;
  return {
    messages: convo.length,
    messagesRequired: GIFT_UNLOCK_MESSAGES,
    voiceNotes,
    bothReplied,
    unlocked: (convo.length >= GIFT_UNLOCK_MESSAGES && bothReplied) || voiceNotes >= 1,
  };
}

/** 0..1 for the progress indicator on the locked gift button. */
export function giftUnlockProgress(u: GiftUnlock): number {
  if (u.unlocked) return 1;
  // Cap at just under 1 if the count is met but the other person hasn't replied yet.
  return Math.min(u.messages / u.messagesRequired, u.bothReplied ? 1 : 0.9);
}

export function giftLockHint(u: GiftUnlock): string {
  if (u.unlocked) return 'Send a treat';
  const left = Math.max(u.messagesRequired - u.messages, 0);
  if (left === 0 && !u.bothReplied) return 'Treats unlock once they reply';
  return `Treats unlock after ${left} more message${left === 1 ? '' : 's'}, or one voice note`;
}
