import { useMemo } from 'react';
import { useResolvedSources } from '@/features/backend/media';
import { isBackendConfigured } from '@/lib/supabase';
import { MOCK_ME } from '@/features/mock-data';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import type { Profile } from '@/types/domain';

/** The user's profile: what they entered, falling back to the demo profile for anything missing. */
export function useMyProfile(): Profile {
  const { draft } = useOnboarding();
  const photoSources = useResolvedSources(draft.photos);
  const photoKey = photoSources.join('|');
  return useMemo(
    () => ({
      ...MOCK_ME,
      firstName: draft.firstName?.trim() || MOCK_ME.firstName,
      birthDate: draft.birthDate ?? MOCK_ME.birthDate,
      gender: draft.gender ?? MOCK_ME.gender,
      interestedIn: draft.interestedIn.length ? draft.interestedIn : MOCK_ME.interestedIn,
      occupation: draft.occupation?.trim() || MOCK_ME.occupation,
      lifeGoals: draft.lifeGoals?.trim() || undefined,
      intent: draft.intent ?? MOCK_ME.intent,
      city: draft.city,
      neighborhood: draft.neighborhood,
      hideExactDistance: draft.hideExactDistance,
      institutionIds: draft.institutionIds.length ? draft.institutionIds : MOCK_ME.institutionIds,
      languages: draft.languages.length > 1 || draft.languages[0] !== 'en' ? draft.languages : MOCK_ME.languages,
      church: draft.church?.trim() || MOCK_ME.church,
      drinks: draft.drinks,
      heritage: draft.heritage?.trim() || undefined,
      photos: draft.photos.length || isBackendConfigured ? photoSources.map((source, i) => ({ id: `p${i}`, source, position: i })) : MOCK_ME.photos,
      prompts: Object.values(draft.prompts).filter((p) => p.answer.trim()),
      verification: draft.selfieSubmitted ? 'pending' : draft.firstName?.trim() ? 'unverified' : MOCK_ME.verification,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draft, photoKey],
  );
}
