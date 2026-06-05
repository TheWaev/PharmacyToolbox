/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL (public). */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon/publishable key (safe to expose in the client). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** DEV-only: set to 'true' to bypass the auth gate while developing. */
  readonly VITE_AUTH_DEV_BYPASS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
