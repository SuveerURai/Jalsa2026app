'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, ArrowRight, AlertCircle, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;

      const { data: admin } = await supabase
        .from('admin_roles')
        .select('user_id')
        .eq('user_id', data.session.user.id)
        .maybeSingle();

      if (admin) router.replace('/admin/dashboard');
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.user) {
        throw new Error(error?.message || 'Unable to sign in.');
      }

      const { data: admin, error: roleError } = await supabase
        .from('admin_roles')
        .select('role, full_name')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (roleError) throw roleError;

      if (!admin) {
        await supabase.auth.signOut();
        throw new Error('This account is not authorized for the JALSA admin console.');
      }

      router.replace('/admin/dashboard');
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-brand-500/60 text-brand-400 mx-auto flex items-center justify-center shadow-gold-glow">
          <ShieldCheck className="w-9 h-9 text-brand-400" />
        </div>
        <h1 className="text-3xl font-black text-white">Admin & Organizer Portal</h1>
        <p className="text-xs text-zinc-400">JALSA 2026 Management Console</p>
      </div>

      {errorMsg && (
        <div className="bg-red-950/80 border border-red-800 text-red-200 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-5 shadow-2xl">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-brand-400" /> Admin Email
          </label>
          <input
            type="email"
            required
            autoComplete="username"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-brand-400" /> Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="Enter your Supabase Auth password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-amber-400 via-brand-500 to-amber-500 text-black font-extrabold rounded-xl shadow-gold-glow hover:opacity-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <span>{loading ? 'Authenticating...' : 'Sign in to Admin Console'}</span>
          {!loading && <ArrowRight className="w-4 h-4 text-black" />}
        </button>
      </form>
    </div>
  );
}
