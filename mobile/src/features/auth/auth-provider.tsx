import type { Session } from '@supabase/supabase-js';
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { UserProfile } from '@/domain/types';
import { isSupabaseConfigured, requireSupabase, supabase } from '@/services/supabase/client';

type AuthStatus = 'loading' | 'config_required' | 'onboarding_required' | 'ready' | 'error';

type AuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  profile: UserProfile | null;
  errorMessage: string | null;
  retry: () => Promise<void>;
  setDisplayName: (displayName: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type UserRow = {
  id: string;
  display_name: string | null;
  points_total: number;
  current_streak: number;
  last_qualified_rescue_at: string | null;
  created_at: string;
};

function mapProfile(row: UserRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name ?? '',
    pointsTotal: row.points_total,
    currentStreak: row.current_streak,
    lastQualifiedRescueAt: row.last_qualified_rescue_at,
    createdAt: row.created_at,
  };
}

function unwrapProfile(data: unknown) {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Supabase did not return a user profile.');
  return mapProfile(row as UserRow);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>(
    isSupabaseConfigured ? 'loading' : 'config_required',
  );
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const client = requireSupabase();
    const { data, error } = await client.from('users').select('*').eq('id', userId).single();

    if (error) throw error;

    const nextProfile = unwrapProfile(data);
    setProfile(nextProfile);
    setStatus(nextProfile.displayName.trim() ? 'ready' : 'onboarding_required');
  }, []);

  const bootstrap = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setStatus('config_required');
      return;
    }

    try {
      setStatus('loading');
      setErrorMessage(null);
      const client = requireSupabase();
      let { data, error } = await client.auth.getSession();

      if (error) throw error;

      if (!data.session) {
        const anonymousResult = await client.auth.signInAnonymously();
        if (anonymousResult.error) throw anonymousResult.error;
        data = { session: anonymousResult.data.session };
      }

      setSession(data.session);
      if (!data.session?.user) throw new Error('Anonymous sign-in did not return a user.');
      await loadProfile(data.session.user.id);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to start PorsiPas.');
      setStatus('error');
    }
  }, [loadProfile]);

  useEffect(() => {
    void bootstrap();

    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, [bootstrap]);

  const setDisplayName = useCallback(async (displayName: string) => {
    const cleanedName = displayName.trim();
    if (cleanedName.length < 2 || cleanedName.length > 40) {
      throw new Error('Use a display name between 2 and 40 characters.');
    }

    const client = requireSupabase();
    const { data, error } = await client.rpc('set_display_name', {
      p_display_name: cleanedName,
    });
    if (error) throw error;

    const nextProfile = unwrapProfile(data);
    setProfile(nextProfile);
    setStatus('ready');
  }, []);

  const value = useMemo(
    () => ({ status, session, profile, errorMessage, retry: bootstrap, setDisplayName }),
    [bootstrap, errorMessage, profile, session, setDisplayName, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
