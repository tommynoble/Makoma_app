/**
 * Core domain model for Makoma. Mirrors supabase/migrations/0001_init.sql.
 * Keep these in sync with the database (or generate with `supabase gen types`).
 */

export type IntentId = 'serious' | 'marriage' | 'friendship_networking';

export type Gender = 'man' | 'woman';

export type LanguageId = 'en' | 'tw' | 'ga' | 'ee' | 'fat' | 'dag' | 'ha' | 'pcm';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

/** Who can see this profile in Discover. */
export type Visibility =
  | 'public' // everyone matching your filters
  | 'incognito'; // only people you have liked first (premium)

export interface ProfilePrompt {
  promptId: string;
  answer: string;
}

export interface Photo {
  id: string;
  url: string;
  position: number;
}

export interface Profile {
  id: string;
  firstName: string;
  birthDate: string; // ISO date
  gender: Gender;
  interestedIn: Gender[];
  intent: IntentId;

  // "Ambition & character" — not just looks
  occupation?: string;
  industry?: string;
  lifeGoals?: string;
  church?: string; // optional faith community, a strong social signal in Ghana

  // Social proof
  institutionIds: string[]; // universities, SHS (alumni networks matter)
  neighborhood?: string;
  city: string;

  languages: LanguageId[];
  prompts: ProfilePrompt[];
  photos: Photo[];
  voiceIntroUrl?: string;
  voiceIntroDurationMs?: number;

  verification: VerificationStatus;
  visibility: Visibility;
  createdAt: string;
}

/** What one profile has in common with another; shown in place of "mutual friends". */
export interface SharedGround {
  institutions: string[];
  languages: LanguageId[];
  sameNeighborhood: boolean;
  sameChurch: boolean;
  sameIntent: boolean;
}

export interface DiscoverCard {
  profile: Profile;
  shared: SharedGround;
  distanceKm?: number;
}

export interface Match {
  id: string;
  otherProfile: Profile;
  createdAt: string;
  lastMessage?: Message;
}

export type MessageKind = 'text' | 'voice' | 'gift';

interface MessageBase {
  id: string;
  matchId: string;
  senderId: string;
  createdAt: string;
  readAt?: string;
}

export interface TextMessage extends MessageBase {
  kind: 'text';
  body: string;
}

export interface VoiceMessage extends MessageBase {
  kind: 'voice';
  audioUrl: string;
  durationMs: number;
}

/** A treat sent in chat. The recipient gets a partner voucher, never cash. */
export interface GiftMessage extends MessageBase {
  kind: 'gift';
  giftId: string;
  offerId: string;
  note?: string;
}

export type Message = TextMessage | VoiceMessage | GiftMessage;

export type GiftStatus = 'pending' | 'paid' | 'failed' | 'refunded';

/** A treat sold by Makoma and redeemable at a partner spot (e.g. a juice bar in Osu). */
export interface GiftOffer {
  id: string;
  partnerName: string;
  area: string; // "Osu", "East Legon"
  label: string; // "Sobolo", "Coffee", "Kelewele"
  emoji: string;
  pricePesewas: number; // GHS × 100
}

export type VoucherStatus = 'issued' | 'redeemed' | 'expired';

/** What the recipient holds: a code / QR shown at the partner's counter. */
export interface Voucher {
  id: string;
  code: string; // MK-XXXX-XXXX
  offer: GiftOffer;
  fromName: string;
  status: VoucherStatus;
  expiresAt: string;
  redeemedAt?: string;
}

/** Anti-scam gift lock progress. Source of truth: gift_unlock_status() in the DB. */
export interface GiftUnlock {
  unlocked: boolean;
  messages: number;
  messagesRequired: number;
  voiceNotes: number;
  bothReplied: boolean;
}

/** Sachet pricing: small, short-duration passes instead of monthly subscriptions. */
export interface SachetPlan {
  id: string;
  feature: 'incognito' | 'boost' | 'see_likes';
  label: string;
  durationHours: number;
  pricePesewas: number;
}

export interface DiscoverFilters {
  intents: IntentId[];
  minAge: number;
  maxAge: number;
  verifiedOnly: boolean;
  languages: LanguageId[];
  institutionIds: string[];
  city?: string;
}
