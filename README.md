# JALSA 2026 — COMPLETE EVENT REGISTRATION, PAYMENT VERIFICATION & QR TICKETING SYSTEM

This repository contains the complete production-ready full-stack web application for **JALSA 2026**, a college student cultural festival & Dandiya Night.

---

## 🌟 CORE FEATURES

### 1. Student Registration & Validation
- **Custom Multi-Step Registration Form**: Collects Full Name, Email, Phone Number, USN / Student ID, Department, Semester, Section, and Dandiya Sticks Preference.
- **Client & Server Validation**: Prevents duplicate registrations by USN, Email, or Phone.
- **Configurable Academic Options**: Admin can customize available departments, semesters, and sections via Admin Settings.

### 2. Manual UPI Payment Verification Workflow
- **Dedicated Payment Page**: Displays ₹199 fee, official UPI ID, Payee Name, UPI QR, and instructions.
- **UTR & Screenshot Collection**: Students enter their 12-digit UPI Transaction ID / UTR and upload payment screenshots (JPG, PNG, WebP).
- **Sequential Registration ID Generation**: Atomic sequence generator produces IDs formatted as `JALSA26-0001`, `JALSA26-0002`, etc.

### 3. Payment Status & Digital QR Ticket
- **Status Check Page (`/registration/status`)**: Lookup ticket using Registration ID, Email, or USN.
- **Status States**:
  - `PENDING`: Payment being reviewed by organizers.
  - `VERIFIED`: Payment confirmed, active digital QR ticket unlocked with download/print & email options.
  - `REJECTED`: Shows admin rejection reason and re-submission guidance.
- **Printable Ticket Page (`/ticket/[registrationId]`)**: Event-ready digital ticket with JALSA '26 branding, participant details, QR code, and print stylesheet.

### 4. Cryptographic QR System & Mobile Camera Scanner
- **Secure Random QR Tokens**: Encodes secure random tokens (`JALSA26:<hash>`) without leaking sensitive PII.
- **Dedicated Camera Scanner (`/admin/scanner`)**: Real-time browser-compatible camera scanner with instant audio & visual feedback:
  - `ENTRY APPROVED` (Green banner + tone)
  - `ALREADY ENTERED` (Red warning + tone displaying original entry time and gate)
  - `PAYMENT NOT VERIFIED` / `TICKET REVOKED` / `INVALID QR`
- **Double Entry Prevention**: Database-level atomic `record_qr_entry` function locks record and prevents concurrent scan exploits.
- **Manual ID Lookup**: Backup option for volunteers.

### 5. Executive Admin Dashboard & Analytics
- **Dashboard (`/admin/dashboard`)**: Live stats for Total Registrations, Verified Passes, Pending Payments, Rejected Registrations, Verified Revenue, Gate Attendance, and Dandiya requirements.
- **Event Day Mode**: Single-click toggle prioritizing gate entry scanner & rapid entry feed.
- **Department x Semester x Section Analytics Matrix (`/admin/analytics`)**: Drill-down table answering exact registration counts per combination with CSV export.
- **Payment Verification Desk (`/admin/payments`)**: Inspection lightbox for payment screenshots with `VERIFY` and `REJECT` controls.
- **Master Registrations Table (`/admin/registrations`)**: Search, multi-filters (Dept, Sem, Sec, Payment Status, Entry Status, Dandiya preference), pagination, and inspection views.
- **Event Settings (`/admin/settings`)**: Dynamic configuration manager for Event Name, Fee, Venue, Registration Open/Close switch, UPI credentials, and Email templates.
- **Audit Logs (`/admin/audit-logs`)**: Complete audit trail for all admin actions.

---

## 🛠 TECH STACK

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React, Canvas Confetti
- **Backend & API**: Next.js Server Actions / API Routes, Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **Database & Storage**: Supabase PostgreSQL, Supabase Storage (`payment-screenshots` bucket)
- **QR Engine & Scanner**: `qrcode`, `html5-qrcode`
- **Email Service**: Brevo transactional email API (free tier) with optional Resend support

---

## 🚀 LOCAL DEVELOPMENT & SETUP

### 1. Environment Configuration
Copy `.env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

EMAIL_PROVIDER=brevo
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your-jalsa-gmail@gmail.com
BREVO_SENDER_NAME=JALSA 2026

# Optional if you later verify a custom domain in Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=JALSA 2026 <onboarding@resend.dev>

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Run Database Setup
1. Open your Supabase Dashboard -> SQL Editor.
2. Run the contents of `supabase_schema.sql`.
3. Ensure the storage bucket `payment-screenshots` is created.

### 3. Start Application
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🔐 ADMIN ACCESS CREDENTIALS
- Admin Portal: `/admin/login`
- Default Passcode: `admin123` or `jalsa2026`

---

## 📦 VERCEL DEPLOYMENT

1. Push this project repository to GitHub.
2. Import project in Vercel.
3. Add Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`).
4. Click **Deploy**.


### 📧 Automated Email Setup (No Custom Domain Required)

The application sends registration, payment-verified, and payment-rejected emails through Brevo when `EMAIL_PROVIDER=brevo`. Brevo's free plan currently allows 300 email sends per day.

1. Create a Brevo account.
2. Create a dedicated Gmail address for JALSA, for example `jalsa2026.notifications@gmail.com`.
3. In Brevo, go to **Settings → Senders, Domains & Dedicated IPs → Senders** and add the Gmail address.
4. Brevo will send a verification code to that Gmail address; verify it.
5. Create a Brevo API key.
6. Add these Vercel environment variables:

```env
EMAIL_PROVIDER=brevo
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=jalsa2026.notifications@gmail.com
BREVO_SENDER_NAME=JALSA 2026
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

The admin payment verification endpoint updates the payment status first and then sends the confirmation email. If email delivery fails, the payment verification is **not rolled back**; the API response reports the email failure so it can be retried.

> For production-scale sending, authenticate a custom domain. Free Gmail sender addresses are not the recommended long-term deliverability setup.
