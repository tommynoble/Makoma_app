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
  /** Remote URL, or a bundled asset (require) for demo data. */
  source: string | number;
  caption?: string;
  position: number;
}

/** A recorded answer to a prompt, shown as a player on the profile. */
export interface VoicePrompt {
  promptText: string;
  audioUrl?: string;
  durationMs: number;
  /** Short written teaser of what is said. */
  transcript?: string;
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
  /** One-line self description shown under the name. */
  headline?: string;
  industry?: string;
  lifeGoals?: string;
  church?: string; // optional faith community, a strong social signal in Ghana
  drinks?: 'never' | 'socially' | 'regularly';
  /** Hometown / family roots, e.g. "Kumasi • Accra". */
  heritage?: string;
  /** Show only the neighbourhood, never an exact distance. */
  hideExactDistance?: boolean;

  // Social proof
  institutionIds: string[]; // universities, SHS (alumni networks matter)
  neighborhood?: string;
  city: string;

  languages: LanguageId[];
  prompts: ProfilePrompt[];
  photos: Photo[];
  voicePrompt?: VoicePrompt;

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

/** Demo only: this person has already liked the user (drives the Likes tab and instant matches). */
export interface IncomingLike {
  at: string;
  promptId?: string;
  comment?: string;
  rose?: boolean;
  /** What they liked, shown on the Likes card. */
  liked: 'photo' | 'voice' | 'prompt';
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
  voiceNotes: number;
  voiceNotesRequired: number;
  /** Both people have sent at least one voice note. */
  bothSent: boolean;
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
