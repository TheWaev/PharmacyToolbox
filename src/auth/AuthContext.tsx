import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthResult {
  error: string | null;
  /** True when a sign-up needs the user to confirm their email before logging in. */
  needsEmailConfirmation?: boolean;
}

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  email: string | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      configured: isSupabaseConfigured,
      loading,
      session,
      email: session?.user?.email ?? null,

      async signIn(email, password) {
        if (!supabase) return { error: 'Authentication is not configured.' };
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },

      async signUp(email, password) {
        if (!supabase) return { error: 'Authentication is not configured.' };
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Send the confirmation link back to this deployment.
            emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
          },
        });
        if (error) return { error: error.message };
        // When email confirmation is on, a new sign-up returns a user with no
        // active session until they click the link.
        const needsEmailConfirmation = !data.session;
        return { error: null, needsEmailConfirmation };
      },

      async signOut() {
        await supabase?.auth.signOut();
      },
    };
  }, [loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
