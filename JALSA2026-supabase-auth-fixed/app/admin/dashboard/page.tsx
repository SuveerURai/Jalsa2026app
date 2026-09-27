'use client';

import React, { useState, useEffect } from 'react';
import { adminFetch, downloadAdminFile } from '@/lib/admin-client';
import Link from 'next/link';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  QrCode,
  Download,
  BarChart3,
  ShieldAlert,
  Sparkles,
  Zap,
  ArrowUpRight,
  Loader2,
  Check
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [eventDayMode, setEventDayMode] = useState(false);

  const loadStats = async () => {
    try {
      const res = await adminFetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Failed to load dashboard stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await downloadAdminFile(
        '/api/export-csv?mode=registrations',
        `JALSA2026_Registrations_${Date.now()}.csv`
      );
    } catch (error: any) {
      alert(error?.message || 'Failed to export registrations.');
    }
  };

  useEffect(() => {
    loadStats();
    // Auto-refresh every 60s to avoid unnecessary repeated database queries
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <p className="text-zinc-400 text-sm">Loading Executive Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Event-Day Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white">JALSA 2026 Dashboard</h1>
            {eventDayMode && (
              <span className="bg-red-950 text-red-400 border border-red-800 text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-red-400" /> EVENT DAY LIVE MODE
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400">Real-time registration, payment verification & entrance gate control desk.</p>
        </div>

        {/* Event Day Mode Switch & Export */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEventDayMode(!eventDayMode)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              eventDayMode
                ? 'bg-red-600 text-white border-red-500 shadow-red-glow'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            {eventDayMode ? 'Event Day Mode ON' : 'Enable Event Day Mode'}
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 bg-emerald-950/80 border border-emerald-700 text-emerald-300 hover:bg-emerald-900 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-green-glow transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* QUICK ACTIONS BAR (#45) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Link
          href="/admin/payments"
          className="bg-amber-950/40 border border-amber-800/80 p-4 rounded-2xl flex flex-col items-center justify-center space-y-1 hover:border-amber-500 transition-all text-center group"
        >
          <Clock className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="font-extrabold text-white text-xs">Verify Payments</span>
          <span className="text-[10px] text-amber-300 font-mono">({stats?.pending || 0} Pending)</span>
        </Link>

        <Link
          href="/admin/scanner"
          className="bg-emerald-950/40 border border-emerald-800/80 p-4 rounded-2xl flex flex-col items-center justify-center space-y-1 hover:border-emerald-500 transition-all text-center group shadow-green-glow"
        >
          <QrCode className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="font-extrabold text-white text-xs">Scan Entry QR</span>
          <span className="text-[10px] text-emerald-300 font-mono">Mobile Scanner</span>
        </Link>

        <Link
          href="/admin/registrations"
          className="bg-dark-card border border-dark-border p-4 rounded-2xl flex flex-col items-center justify-center space-y-1 hover:border-brand-500 transition-all text-center group"
        >
          <Users className="w-6 h-6 text-brand-400 group-hover:scale-110 transition-transform" />
          <span className="font-extrabold text-white text-xs">View Registrations</span>
          <span className="text-[10px] text-zinc-400 font-mono">Search & Filter</span>
        </Link>

        <Link
          href="/admin/analytics"
          className="bg-dark-card border border-dark-border p-4 rounded-2xl flex flex-col items-center justify-center space-y-1 hover:border-brand-500 transition-all text-center group"
        >
          <BarChart3 className="w-6 h-6 text-brand-400 group-hover:scale-110 transition-transform" />
          <span className="font-extrabold text-white text-xs">Analytics Matrix</span>
          <span className="text-[10px] text-zinc-400 font-mono">Dept × Sem × Sec</span>
        </Link>

        <Link
          href="/admin/settings"
          className="bg-dark-card border border-dark-border p-4 rounded-2xl flex flex-col items-center justify-center space-y-1 hover:border-brand-500 transition-all text-center group col-span-2 sm:col-span-1"
        >
          <Sparkles className="w-6 h-6 text-brand-400 group-hover:scale-110 transition-transform" />
          <span className="font-extrabold text-white text-xs">Event Settings</span>
          <span className="text-[10px] text-zinc-400 font-mono">Fees & UPI</span>
        </Link>
      </div>

      {/* EVENT DAY MODE HIGHLIGHT BANNER */}
      {eventDayMode && (
        <div className="bg-gradient-to-r from-red-950 via-dark-card to-red-950 border-2 border-red-600 p-6 rounded-3xl space-y-4 shadow-red-glow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-red-500 animate-bounce" />
              <div>
                <h3 className="text-xl font-extrabold text-white">Entry Gate Verification Operational</h3>
                <p className="text-xs text-red-200">Volunteers can use camera QR scanner directly from mobile browsers.</p>
              </div>
            </div>
            <Link
              href="/admin/scanner"
              className="px-6 py-3 bg-red-600 text-white font-extrabold rounded-xl shadow-lg hover:bg-red-500 transition-colors flex items-center gap-2 text-sm"
            >
              <QrCode className="w-5 h-5" /> Launch Camera Scanner
            </Link>
          </div>
        </div>
      )}

      {/* EXECUTIVE STATS GRID (#13) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Registrations */}
        <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase font-extrabold tracking-wider">Total Registrations</span>
            <Users className="w-5 h-5 text-brand-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats?.total || 0}</div>
          <span className="text-[11px] text-zinc-500 block">Registered Students</span>
        </div>

        {/* Verified Payments */}
        <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs uppercase font-extrabold tracking-wider">Verified Tickets</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{stats?.verified || 0}</div>
          <span className="text-[11px] text-emerald-300 block">Active QR Codes Issued</span>
        </div>

        {/* Pending Verification */}
        <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs uppercase font-extrabold tracking-wider">Pending Review</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{stats?.pending || 0}</div>
          <span className="text-[11px] text-amber-300 block">Awaiting Admin Check</span>
        </div>

        {/* Rejected Payments */}
        <div className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-xs uppercase font-extrabold tracking-wider">Rejected Payments</span>
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-black text-red-400">{stats?.rejected || 0}</div>
          <span className="text-[11px] text-red-300 block">Action Required</span>
        </div>
      </div>

      {/* SECONDARY STATS (REVENUE & ATTENDANCE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Box */}
        <div className="bg-gradient-to-tr from-amber-950/40 via-dark-card to-dark-card border border-brand-500/40 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-brand-400">
            <IndianRupee className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Revenue Overview</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-zinc-400">Verified Revenue:</span>
              <span className="font-black text-emerald-400 text-base">₹{stats?.totalVerifiedRevenue || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Total Expected Revenue:</span>
              <span className="font-bold text-zinc-200">₹{stats?.totalExpectedRevenue || 0}</span>
            </div>
          </div>
        </div>

        {/* Gate Attendance Box */}
        <div className="bg-gradient-to-tr from-emerald-950/40 via-dark-card to-dark-card border border-emerald-800/60 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <QrCode className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Gate Attendance</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-zinc-400">Entered Venue:</span>
              <span className="font-black text-emerald-400 text-base">{stats?.entered || 0} <span className="text-[10px] text-zinc-400 font-normal">Attendees</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Remaining Expected:</span>
              <span className="font-bold text-amber-300">{stats?.remaining || 0}</span>
            </div>
          </div>
        </div>

        {/* Dandiya Requirement Box */}
        <div className="bg-gradient-to-tr from-purple-950/40 via-dark-card to-dark-card border border-purple-800/60 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-purple-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Dandiya Sticks Count</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-zinc-400">Sticks Required:</span>
              <span className="font-black text-purple-300 text-base">{stats?.dandiyaRequired || 0} Pairs</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Bringing Own:</span>
              <span className="font-bold text-zinc-300">{stats?.dandiyaNotRequired || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
