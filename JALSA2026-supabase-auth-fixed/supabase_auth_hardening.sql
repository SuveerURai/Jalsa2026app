-- JALSA 2026 follow-up hardening
-- Run this AFTER the main database schema has been created.

-- ------------------------------------------------------------
-- 1. Fix registration ID generation so the sequence increments once.
-- ------------------------------------------------------------

create or replace function public.set_registration_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.seq_num is null then
    new.seq_num := nextval('public.registration_id_seq');
  end if;

  if new.registration_id is null or btrim(new.registration_id) = '' then
    new.registration_id := 'JALSA26-' || lpad(new.seq_num::text, 4, '0');
  end if;

  return new;
end;
$$;

alter table public.registrations
  alter column registration_id drop default;

drop trigger if exists trg_set_registration_identity
on public.registrations;

create trigger trg_set_registration_identity
before insert on public.registrations
for each row
execute function public.set_registration_identity();


-- ------------------------------------------------------------
-- 2. Do not expose the QR-entry RPC directly to anonymous users.
-- The Next.js server calls it using the server secret.
-- ------------------------------------------------------------

revoke execute on function public.record_qr_entry(text, text, text)
from public, anon, authenticated;

-- service_role bypasses RLS and is used by the server-side client.


-- ------------------------------------------------------------
-- 3. Ensure the admin role table is protected.
-- ------------------------------------------------------------

alter table public.admin_roles enable row level security;

drop policy if exists "Admins can view their own admin role"
on public.admin_roles;

create policy "Admins can view their own admin role"
on public.admin_roles
for select
to authenticated
using (user_id = auth.uid());


-- ------------------------------------------------------------
-- 4. Keep audit logs private.
-- ------------------------------------------------------------

alter table public.audit_logs enable row level security;

drop policy if exists "Admins can view audit logs"
on public.audit_logs;

create policy "Admins can view audit logs"
on public.audit_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_roles ar
    where ar.user_id = auth.uid()
  )
);
