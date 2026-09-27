# JALSA 2026 — New Supabase setup

## 1. Supabase credentials

In the new Supabase project, open **Settings → API** and copy:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- Publishable key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Secret key → `SUPABASE_SECRET_KEY`

The secret key is server-only. Never commit it or expose it through a `NEXT_PUBLIC_*` variable.

## 2. Database

Open **SQL Editor** and run:

`supabase_schema.sql`

If you already ran an older JALSA schema in this same fresh project, run `supabase_schema.sql` again. It removes the old public registration/storage policies and fixes registration ID generation.

## 3. Admin Auth

Create the administrator in:

**Authentication → Users → Add user**

The JALSA app expects the admin to exist in both:

- `auth.users`
- `public.admin_roles`

For the current administrator, the role should be `SUPER_ADMIN`.

## 4. Local environment

Copy `.env.example` to `.env.local` and fill in the three Supabase values.

Keep:

```env
NEXT_PUBLIC_APP_URL=http://localhost:5000
```

for local development.

## 5. Start

```bash
npm install
npm run dev
```

Then open:

`http://localhost:5000/admin/login`

Sign in with the Supabase Auth email/password account.

## What changed in this version

- Removed hard-coded admin PIN/password authentication.
- Removed `localStorage` as an admin authentication mechanism.
- Added Supabase Auth session checks for `/admin/*`.
- Added server-side verification of the Supabase access token.
- Server verifies that the authenticated user has an `admin_roles` record.
- Admin API routes now reject unauthenticated requests.
- Admin actions use the authenticated user's email rather than trusting `adminEmail` sent by the browser.
- Registration admin list now reads real database records instead of only demo records.
- Audit log page now reads real audit logs.
- Admin CSV downloads send authenticated requests.
- Payment screenshot Storage bucket is private.
- QR-entry RPC is not executable by anonymous/authenticated clients.
- Fixed the registration ID sequence so IDs do not skip numbers.
