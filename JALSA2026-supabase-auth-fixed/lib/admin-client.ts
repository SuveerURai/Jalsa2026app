'use client';

import { supabase } from '@/lib/supabase';

export async function getAdminSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getAdminProfile() {
  const session = await getAdminSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('admin_roles')
    .select('user_id, email, full_name, role')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const session = await getAdminSession();

  if (!session?.access_token) {
    if (typeof window !== 'undefined') {
      window.location.assign('/admin/login');
    }
    throw new Error('Admin session not found.');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${session.access_token}`);

  return fetch(input, {
    ...init,
    headers,
    cache: init.cache ?? 'no-store',
  });
}

export async function downloadAdminFile(url: string, filename: string) {
  const response = await adminFetch(url);

  if (!response.ok) {
    let message = 'Download failed.';
    try {
      const body = await response.json();
      message = body.error || message;
    } catch {}
    throw new Error(message);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
