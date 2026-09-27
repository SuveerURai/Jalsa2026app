-- JALSA 2026 — CLEAN SUPABASE SCHEMA
-- Intended for the fresh Supabase project.
-- Server-side Next.js code uses SUPABASE_SECRET_KEY for trusted writes.

create extension if not exists pgcrypto;

create sequence if not exists public.registration_id_seq
  start with 1 increment by 1;

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  seq_num bigint not null default nextval('public.registration_id_seq'),
  registration_id text unique not null,
  full_name text not null,
  email text not null,
  phone text not null,
  usn text not null,
  department text not null,
  semester text not null,
  section text not null,
  dandiya_sticks text not null,
  fee_amount numeric(10,2) not null default 200.00,
  payment_transaction_id text not null,
  payment_screenshot_path text not null,
  payment_status text not null default 'PENDING'
    check (payment_status in ('PENDING','VERIFIED','REJECTED')),
  verification_note text,
  verified_by text,
  verified_at timestamptz,
  qr_token text unique,
  qr_generated_at timestamptz,
  qr_status text not null default 'NOT_GENERATED'
    check (qr_status in ('NOT_GENERATED','ACTIVE','USED','REVOKED')),
  entry_status text not null default 'NOT_ENTERED'
    check (entry_status in ('NOT_ENTERED','ENTERED')),
  entry_time timestamptz,
  entry_gate text,
  scanner_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
for each row execute function public.set_registration_identity();

create index if not exists idx_registrations_registration_id
  on public.registrations(registration_id);
create index if not exists idx_registrations_usn
  on public.registrations(usn);
create index if not exists idx_registrations_email
  on public.registrations(email);
create index if not exists idx_registrations_phone
  on public.registrations(phone);
create index if not exists idx_registrations_payment_status
  on public.registrations(payment_status);
create index if not exists idx_registrations_qr_token
  on public.registrations(qr_token);
create index if not exists idx_registrations_dept_sem_sec
  on public.registrations(department, semester, section);

create unique index if not exists idx_unique_active_usn
  on public.registrations(usn)
  where payment_status in ('PENDING','VERIFIED');


create table if not exists public.event_settings (
  id text primary key default 'main',
  event_name text not null default 'JALSA 2026',
  event_date text not null default 'October 18, 2026',
  event_time text not null default '5:00 PM onwards',
  event_venue text not null default 'Canteen Ground',
  event_description text not null default 'The flagship annual college cultural mega festival & Dandiya Night of 2026.',
  registration_fee numeric(10,2) not null default 200.00,
  registration_open boolean not null default true,
  upi_id text not null default 'jalsa2026@upi',
  payee_name text not null default 'JALSA 2026 Organizing Committee',
  upi_qr_url text default '',
  payment_instructions text not null default 'Scan the UPI QR code using GPay, PhonePe, Paytm, or another UPI app. Pay ₹200 and enter the transaction ID / UTR and upload the payment screenshot.',
  departments jsonb not null default '["Computer Science & Eng (CSE)","Information Science (ISE)","Electronics & Comm (ECE)","Electrical & Electronics (EEE)","Mechanical Eng (ME)","Civil Eng (CIVIL)","Artificial Intelligence (AIML)","Data Science (AIDS)"]'::jsonb,
  semesters jsonb not null default '["1st Sem","2nd Sem","3rd Sem","4th Sem","5th Sem","6th Sem","7th Sem","8th Sem"]'::jsonb,
  sections jsonb not null default '["Section A","Section B","Section C","Section D","Section E"]'::jsonb,
  dandiya_options jsonb not null default '["Required (Provided at venue)","Not Required (Bringing own sticks)"]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.event_settings (id)
values ('main')
on conflict (id) do nothing;


create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  role text not null default 'ADMIN'
    check (role in ('SUPER_ADMIN','ADMIN','SCANNER')),
  created_at timestamptz not null default now()
);


create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id text not null,
  admin_email text not null,
  action text not null,
  registration_id text,
  details jsonb default '{}'::jsonb,
  timestamp timestamptz not null default now()
);

create index if not exists idx_audit_logs_timestamp
  on public.audit_logs(timestamp desc);
create index if not exists idx_audit_logs_registration
  on public.audit_logs(registration_id);


create or replace function public.record_qr_entry(
  p_qr_token text,
  p_gate text default 'Main Gate',
  p_scanner_id text default 'Scanner'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reg public.registrations%rowtype;
begin
  select * into v_reg
  from public.registrations
  where qr_token = p_qr_token
  for update;

  if not found then
    return jsonb_build_object(
      'success', false,
      'code', 'INVALID_QR',
      'message', 'Invalid QR code. No registration record found.'
    );
  end if;

  if v_reg.payment_status <> 'VERIFIED' then
    return jsonb_build_object(
      'success', false,
      'code', 'UNVERIFIED_PAYMENT',
      'message', 'Payment has not been verified for this registration.'
    );
  end if;

  if v_reg.qr_status = 'REVOKED' then
    return jsonb_build_object(
      'success', false,
      'code', 'TICKET_REVOKED',
      'message', 'This ticket has been revoked by event administration.'
    );
  end if;

  if v_reg.entry_status = 'ENTERED' then
    return jsonb_build_object(
      'success', false,
      'code', 'ALREADY_ENTERED',
      'message', 'Participant has already entered the venue.',
      'entry_time', v_reg.entry_time,
      'entry_gate', v_reg.entry_gate,
      'scanner_id', v_reg.scanner_id
    );
  end if;

  update public.registrations
  set
    entry_status = 'ENTERED',
    entry_time = now(),
    entry_gate = p_gate,
    scanner_id = p_scanner_id,
    qr_status = 'USED',
    updated_at = now()
  where id = v_reg.id;

  select * into v_reg
  from public.registrations
  where id = v_reg.id;

  return jsonb_build_object(
    'success', true,
    'code', 'ENTRY_APPROVED',
    'message', 'Entry approved successfully.',
    'registration', row_to_json(v_reg)
  );
end;
$$;

revoke execute on function public.record_qr_entry(text,text,text)
from public, anon, authenticated;


insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'payment-screenshots',
  'payment-screenshots',
  false,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];


alter table public.registrations enable row level security;
alter table public.event_settings enable row level security;
alter table public.admin_roles enable row level security;
alter table public.audit_logs enable row level security;

-- Remove policies from older/insecure versions if they exist.
drop policy if exists "Public can submit registrations" on public.registrations;
drop policy if exists "Public can view registration by ID or email" on public.registrations;
drop policy if exists "Public upload payment screenshots" on storage.objects;
drop policy if exists "Admin read payment screenshots" on storage.objects;

drop policy if exists "Public can view event settings" on public.event_settings;
create policy "Public can view event settings"
on public.event_settings
for select
to anon, authenticated
using (true);


-- No public INSERT/SELECT policies on registrations.
-- The Next.js server performs registration writes and protected reads
-- using the server-side secret key.


drop policy if exists "Admins can view their own admin role" on public.admin_roles;
create policy "Admins can view their own admin role"
on public.admin_roles
for select
to authenticated
using (user_id = auth.uid());


drop policy if exists "Admins can view audit logs" on public.audit_logs;
create policy "Admins can view audit logs"
on public.audit_logs
for select
to authenticated
using (
  exists (
    select 1 from public.admin_roles ar
    where ar.user_id = auth.uid()
  )
);


-- Storage is private. Registration uploads and admin reads are performed
-- server-side with the Supabase secret key, so no public Storage policy
-- is required.
