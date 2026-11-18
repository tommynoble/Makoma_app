import { Redirect } from 'expo-router';
import { useOnboarding } from '@/features/onboarding/onboarding-context';

/** Returning users go straight to Discover; new users start at sign-in. */
export default function Index() {
  const { draft } = useOnboarding();
  return <Redirect href={draft.onboarded ? '/discover' : '/phone'} />;
}
