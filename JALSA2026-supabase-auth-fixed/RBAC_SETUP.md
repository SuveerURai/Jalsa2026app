# JALSA 2026 — Admin & Volunteer Roles

Roles now enforced server-side:

- SUPER_ADMIN: full access + team management
- ADMIN: registrations, payments, analytics, exports, settings, audit logs and QR management
- SCANNER: QR scanner / entry only

## Add a volunteer
1. Supabase Dashboard → Authentication → Users → Add user.
2. Confirm the account.
3. Sign in as SUPER_ADMIN.
4. Open `/admin/team`.
5. Enter the exact Auth email, name and role.

The JALSA app never stores the volunteer's password.

## Important
Role restrictions are enforced in the API, not only by hiding UI links.
