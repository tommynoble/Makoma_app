/**
 * Lightweight, on-device checks for the patterns behind most dating scams in
 * Ghana: money/MoMo requests, moving off-app early, and "investment" pitches.
 * It never blocks a message; it only adds a gentle, visible nudge.
 */
export type ScamSignal = 'money' | 'contact' | 'invest';

const MONEY = /\b(momo|mobile money|send (me )?(some )?money|transfer|cash ?out|lend me|loan|school fees|hospital bill|transport (money|fare)|airtime|gift card|western union|send (it )?to (my|this) number|pin)\b|gh[₵c]\s?\d|\bcedis?\b/i;
const CONTACT = /(\+?233|\b0)[\s-]?[2-5]\d[\s-]?\d{3}[\s-]?\d{4}\b|\bwhats ?app\b|\btelegram\b|\bsnap(chat)?\b|\binsta(gram)?\b/i;
const INVEST = /\b(invest(ment)?|crypto|bitcoin|usdt|forex|trading (platform|account)|double your money|binary options)\b/i;

export function scamSignal(text: string): ScamSignal | null {
  if (MONEY.test(text)) return 'money';
  if (INVEST.test(text)) return 'invest';
  if (CONTACT.test(text)) return 'contact';
  return null;
}

/** Shown under a received message that matches a pattern. */
export const INCOMING_NUDGE: Record<ScamSignal, string> = {
  money: 'Careful: requests for money or MoMo are the most common scam. Never send money to someone you haven’t met.',
  invest: 'Careful: “investment” and crypto offers from matches are a known scam pattern.',
  contact: 'Moving to another app early means Makoma’s safety checks can’t help you. Take your time.',
};

/** Asked before sending a message that matches a pattern. */
export const OUTGOING_CHECK: Record<ScamSignal, { title: string; body: string }> = {
  money: { title: 'Talking about money?', body: 'Makoma never asks for money, and matches shouldn’t either. Treats are the safe way to be generous.' },
  invest: { title: 'Mentioning investments?', body: 'These messages are often reported as scams. Make sure this is what you mean to send.' },
  contact: { title: 'Sharing contact details?', body: 'There’s no rush. Many people wait until after a voice note or a first date.' },
};
