'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, ShieldCheck, Loader2, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getAdminProfile } from '@/lib/admin-client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const [checking, setChecking] = useState(!isLoginPage);
  const [adminName, setAdminName] = useState('');
  const [adminRole, setAdminRole] = useState('');

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    let active = true;

    const verify = async () => {
      try {
        const profile = await getAdminProfile();

        if (!active) return;

        if (!profile) {
          await supabase.auth.signOut();
          router.replace('/admin/login');
          return;
        }

        setAdminName(profile.full_name || profile.email || '');
        setAdminRole(profile.role || '');

        // Scanner accounts have a dedicated UI and should never land on the
        // executive/admin pages. Direct URL navigation is redirected too.
        if (profile.role === 'SCANNER' && pathname !== '/admin/scanner') {
          router.replace('/admin/scanner');
          return;
        }

        setChecking(false);
      } catch (error) {
        console.error('Admin session check failed:', error);
        if (active) router.replace('/admin/login');
      }
    };

    verify();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && active) router.replace('/admin/login');
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [isLoginPage, pathname, router]);

  if (isLoginPage) return <>{children}</>;

  if (checking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <span className="text-xs">Verifying admin session...</span>
        </div>
      </div>
    );
  }

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex justify-end items-center gap-2">
        {adminRole === 'SUPER_ADMIN' && (
          <button
            type="button"
            onClick={() => router.push('/admin/team')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dark-border bg-dark-card text-zinc-300 hover:text-white hover:border-zinc-600 text-xs font-semibold"
            title="Manage admin team"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            Team
          </button>
        )}
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dark-border bg-dark-card text-zinc-300 hover:text-white hover:border-zinc-600 text-xs font-semibold"
          title={adminName ? `Signed in as ${adminName}` : 'Sign out'}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          {adminName || 'Admin'}
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
      {children}
    </div>
  );
}
