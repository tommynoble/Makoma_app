import { INSTITUTIONS, LANGUAGES } from '@/constants/ghana';
import { promptById } from '@/constants/prompts';
import { computeSharedGround } from '@/features/discover/shared-ground';
import type { Profile } from '@/types/domain';

/**
 * Openers built from what two people share and what the other person wrote.
 * Specific beats "Hey": these are suggestions, tapped into the message box.
 */
export function conversationStarters(me: Profile, them: Profile): string[] {
  const shared = computeSharedGround(me, them);
  const out: string[] = [];
  const school = shared.institutions[0] ? INSTITUTIONS.find((i) => i.id === shared.institutions[0])?.label : undefined;
  if (school) out.push(`Another ${school} person! What was your favourite spot on campus?`);
  const lang = shared.languages.find((l) => l !== 'en');
  if (lang) out.push(`I see you speak ${LANGUAGES.find((l) => l.id === lang)?.label}. Should we switch? 😄`);
  if (shared.sameNeighborhood && them.neighborhood) out.push(`Fellow ${them.neighborhood} resident. Where do you go for the best food around there?`);
  const prompt = them.prompts[0];
  if (prompt) {
    const q = promptById(prompt.promptId)?.text;
    if (q) out.push(`Your answer to “${q}” made me smile. Tell me more?`);
  }
  if (them.voicePrompt) out.push('I listened to your voice intro. Now I have to ask you about it…');
  if (them.occupation) out.push(`How did you get into ${them.occupation.toLowerCase()}?`);
  out.push('What does a perfect Saturday in Accra look like for you?');
  return [...new Set(out)].slice(0, 3);
}
