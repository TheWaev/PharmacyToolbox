import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Supabase auth client. The URL + anon key are public (anon key is designed to
// be shipped to the browser). They are provided at build time via Vite env vars;
// see .env.example. If they are missing the client is null and the app treats
// auth as "not configured" (the gate stays closed in production).
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

/**
 * DEV-only escape hatch so the app can be worked on without standing up auth.
 * Never honoured in a production build.
 */
export const authDevBypass =
  import.meta.env.DEV && import.meta.env.VITE_AUTH_DEV_BYPASS === 'true';
