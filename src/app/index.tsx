import { Redirect } from 'expo-router';
import { useSession } from '@/features/backend/session';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { isBackendConfigured } from '@/lib/supabase';

/**
 * Returning users go straight to Discover; new users start at sign-in.
 * With Supabase configured, a signed-in session is also required.
 */
export default function Index() {
  const { draft } = useOnboarding();
  const { session, ready } = useSession();
  if (!ready) return null;
  if (isBackendConfigured && !session) return <Redirect href="/phone" />;
  if (isBackendConfigured && !draft.onboarded) return <Redirect href="/pledge" />;
  return <Redirect href={draft.onboarded ? '/discover' : '/phone'} />;
}
