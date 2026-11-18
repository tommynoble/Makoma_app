import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isBackendConfigured, supabase } from '@/lib/supabase';

/** The Supabase session (always "ready" with no session in demo mode). */
export function useSession() {
  const [state, setState] = useState<{ session: Session | null; ready: boolean }>({ session: null, ready: !isBackendConfigured });
  useEffect(() => {
    if (!isBackendConfigured) return;
    let alive = true;
    supabase.auth.getSession().then(({ data }) => alive && setState({ session: data.session, ready: true }));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setState({ session, ready: true }));
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);
  return state;
}

export async function myUserId() {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error('You’re signed out. Please sign in again.');
  return id;
}
