// Sign-up is restricted to these email domains. This is enforced both here
// (client-side, for a friendly error) and server-side by a Supabase trigger
// (the real gate — see supabase/allowed-domains.sql). Keep the two in sync.
export const ALLOWED_EMAIL_DOMAINS = ['nhs.net', 'abtrace.co'] as const;

/** Human-readable list, e.g. "@nhs.net or @abtrace.co". */
export const ALLOWED_DOMAINS_LABEL = ALLOWED_EMAIL_DOMAINS.map((d) => `@${d}`).join(' or ');

export function emailDomain(email: string): string {
  return email.trim().toLowerCase().split('@')[1] ?? '';
}

export function isAllowedEmailDomain(email: string): boolean {
  return (ALLOWED_EMAIL_DOMAINS as readonly string[]).includes(emailDomain(email));
}
