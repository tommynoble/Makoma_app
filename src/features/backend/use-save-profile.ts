import { useCallback } from 'react';
import { useOnboarding, type OnboardingDraft } from '@/features/onboarding/onboarding-context';
import { isBackendConfigured } from '@/lib/supabase';
import { pushMyProfile } from './profile-sync';

/**
 * Apply changes to the user's profile locally and, when Supabase is
 * configured, save them to the server. Throws if the server save fails
 * (the local copy is kept, so nothing typed is lost).
 */
export function useSaveProfile() {
  const { draft, update } = useOnboarding();
  return useCallback(
    async (patch: Partial<OnboardingDraft> = {}) => {
      update(patch);
      if (!isBackendConfigured) return;
      const result = await pushMyProfile({ ...draft, ...patch }, update);
      update(result);
    },
    [draft, update],
  );
}
