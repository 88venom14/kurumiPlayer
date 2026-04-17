import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) { supabase.auth.signOut(); }
      else { setSession(session); }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' && !session) {
        supabase.auth.signOut();
        return;
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading };
}
