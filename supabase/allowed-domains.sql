-- Restrict sign-ups to approved email domains, enforced server-side.
--
-- The client also checks this for a friendly error (src/auth/allowedDomains.ts),
-- but THIS trigger is the real gate — it blocks the insert in Supabase Auth so
-- it can't be bypassed from the browser. Run it once in the Supabase SQL editor.
-- Keep the domain list in sync with src/auth/allowedDomains.ts.

create or replace function public.enforce_allowed_email_domains()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed text[] := array['nhs.net', 'abtrace.co'];
  domain  text := lower(split_part(new.email, '@', 2));
begin
  if not (domain = any (allowed)) then
    raise exception 'Sign-up is restricted to NHS or abtrace.co email addresses';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_allowed_email_domains on auth.users;

create trigger enforce_allowed_email_domains
  before insert on auth.users
  for each row
  execute function public.enforce_allowed_email_domains();
