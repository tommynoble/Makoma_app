import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { pullMyProfile } from '@/features/backend/profile-sync';
import { useSession } from '@/features/backend/session';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { isBackendConfigured } from '@/lib/supabase';

/**
 * Returning users go straight to Discover; new users start at sign-in.
 * With Supabase configured, a signed-in session is required, and a profile
 * already saved on the server is restored (new phone, or an interrupted save).
 */
export default function Index() {
  const { draft, update } = useOnboarding();
  const { session, ready } = useSession();
  const needsRestore = isBackendConfigured && !!session && !draft.onboarded;
  const [restore, setRestore] = useState<'idle' | 'done'>('idle');

  useEffect(() => {
    if (!needsRestore) return;
    let alive = true;
    pullMyProfile()
      .then((saved) => {
        if (alive && saved) update(saved);
      })
      .catch(() => {})
      .finally(() => alive && setRestore('done'));
    return () => {
      alive = false;
    };
  }, [needsRestore, update]);

  if (!ready) return null;
  if (isBackendConfigured && !session) return <Redirect href="/phone" />;
  if (needsRestore && restore === 'idle') return null;
  if (isBackendConfigured && !draft.onboarded) return <Redirect href="/pledge" />;
  return <Redirect href={draft.onboarded ? '/discover' : '/phone'} />;
}
