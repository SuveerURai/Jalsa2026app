import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';

export const isSupabaseConfigured = () => {
  return (
    !!supabaseUrl &&
    !!supabasePublishableKey &&
    !!supabaseSecretKey &&
    !supabaseUrl.includes('placeholder.supabase.co') &&
    !supabasePublishableKey.includes('placeholder') &&
    !supabaseSecretKey.includes('placeholder')
  );
};

// Browser/client Supabase client. Uses only the public publishable key.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabasePublishableKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// Server-only trusted client. Never expose this key to the browser.
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseSecretKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
