# Scanner history fix

Updated the QR scanner to normalize the Supabase RPC response and, for already-entered scans, fetch the full registration by QR token so scan history reliably shows the student's name, USN, and registration ID.

Also changed configured Supabase QR scan failures to surface a database error instead of silently falling back to in-memory demo data.

Keep your existing `.env.local`.
