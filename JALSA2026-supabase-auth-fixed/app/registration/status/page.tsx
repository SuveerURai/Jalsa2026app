'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  Download,
  Mail,
  User,
  GraduationCap,
  Calendar,
  MapPin,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import { Registration, EventSettings } from '@/lib/types';

function StatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('query') || searchParams.get('id') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailStatus, setEmailStatus] = useState('');

  const fetchStatus = async (queryToFetch: string) => {
    if (!queryToFetch.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setSearched(true);
    setRegistration(null);

    try {
      // 1. Fetch Event Settings
      const settingsRes = await fetch('/api/settings');
      if (settingsRes.ok) {
        setSettings(await settingsRes.json());
      }

      // 2. Fetch Registration details from DB
      const res = await fetch(`/api/register?query=${encodeURIComponent(queryToFetch.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.registration) {
        throw new Error(data.error || 'No registration found matching your Registration ID, Email, or USN.');
      }

      const reg: Registration = data.registration;
      setRegistration(reg);

      // 3. Render QR Code Data URL if ticket is verified & active
      if (reg.payment_status === 'VERIFIED' && reg.qr_token) {
        const qrCanvasUrl = await QRCode.toDataURL(reg.qr_token, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrDataUrl(qrCanvasUrl);
      }
    } catch (err: any) {
      console.error('Status check error:', err);
      setErrorMsg(err.message || 'Could not find registration record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchStatus(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/registration/status?query=${encodeURIComponent(searchQuery.trim())}`);
      fetchStatus(searchQuery);
    }
  };

  const handleResendTicket = async () => {
    if (!registration) return;
    setEmailStatus('Sending ticket to your email...');
    try {
      const res = await fetch('/api/ticket-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: registration.registration_id })
      });
      if (res.ok) {
        setEmailStatus('✓ Ticket sent successfully to ' + registration.email);
      } else {
        setEmailStatus('Failed to send email. Please try again.');
      }
    } catch (e) {
      setEmailStatus('Email service currently unavailable.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title Header */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-400 bg-brand-950/60 border border-brand-900 px-3 py-1 rounded-full">
          Live Status Verification
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Check Registration & Ticket
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto">
          Enter your Registration ID (e.g. JALSA26-0001), Email, or USN to view pass status.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex items-center gap-2">
        <div className="relative flex-grow">
          <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            placeholder="Enter Registration ID, Email, or USN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-dark-card border border-dark-border rounded-2xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors shadow-lg"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-brand-500 to-amber-500 text-black font-extrabold rounded-2xl shadow-gold-glow hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2 flex-shrink-0"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Loader */}
      {loading && (
        <div className="text-center py-12 space-y-3">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
          <p className="text-xs text-zinc-400">Searching database records...</p>
        </div>
      )}

      {/* Error Message */}
      {!loading && errorMsg && searched && (
        <div className="bg-red-950/80 border border-red-800 text-red-200 p-6 rounded-3xl text-center space-y-3 max-w-xl mx-auto">
          <XCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Registration Not Found</h3>
          <p className="text-xs text-red-300 leading-relaxed">{errorMsg}</p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-block px-5 py-2.5 bg-brand-500 text-black font-bold rounded-xl text-xs shadow-gold-glow"
            >
              Submit New Registration
            </Link>
          </div>
        </div>
      )}

      {/* REGISTRATION STATUS CARD RESULT */}
      {!loading && registration && (
        <div className="bg-dark-card border border-dark-border rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl relative overflow-hidden">
          
          {/* Top Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div>
              <span className="text-xs text-zinc-400 font-mono">Registration ID</span>
              <h2 className="text-2xl font-black text-amber-400 font-mono">{registration.registration_id}</h2>
              <p className="text-xs text-zinc-400">Submitted on: {new Date(registration.created_at).toLocaleString()}</p>
            </div>

            {/* Status Badges */}
            <div>
              {registration.payment_status === 'VERIFIED' && (
                <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-700/80 px-4 py-2 rounded-2xl text-emerald-400 font-bold text-sm shadow-green-glow">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>PAYMENT VERIFIED & TICKET ACTIVE</span>
                </div>
              )}

              {registration.payment_status === 'PENDING' && (
                <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-700/80 px-4 py-2 rounded-2xl text-amber-400 font-bold text-sm shadow-gold-glow">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>PAYMENT PENDING VERIFICATION</span>
                </div>
              )}

              {registration.payment_status === 'REJECTED' && (
                <div className="flex items-center gap-2 bg-red-950/80 border border-red-700/80 px-4 py-2 rounded-2xl text-red-400 font-bold text-sm shadow-red-glow">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span>PAYMENT REJECTED</span>
                </div>
              )}
            </div>
          </div>

          {/* MAIN STATUS DETAILS & TICKET PREVIEW */}
          {registration.payment_status === 'VERIFIED' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800">
              {/* QR Code Digital Ticket Preview */}
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl text-black space-y-3 shadow-2xl border-2 border-brand-500">
                <div className="text-center">
                  <h4 className="font-extrabold text-lg text-black">JALSA '26 ADMIT ONE</h4>
                  <span className="text-[10px] uppercase font-mono text-zinc-600 block">Unique Gate Verification QR</span>
                </div>

                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Official Gate QR Code" className="w-48 h-48 rounded-lg" />
                ) : (
                  <div className="w-48 h-48 bg-zinc-100 flex items-center justify-center text-xs text-zinc-500">
                    Loading QR...
                  </div>
                )}

                <div className="text-center font-mono text-xs">
                  <span className="font-bold text-black block">{registration.registration_id}</span>
                  <span className="text-[11px] text-zinc-600">{registration.full_name} ({registration.usn})</span>
                </div>
              </div>

              {/* Verified Ticket Info */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">Entry Ticket Confirmed</span>
                  <h3 className="text-2xl font-bold text-white">Ready for Event Entry</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Your QR code is active! Show this ticket on your mobile screen or carry a printed copy along with your official College Student ID card.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-zinc-300 bg-dark-bg p-4 rounded-xl border border-dark-border">
                  <p><strong className="text-white">Venue:</strong> {settings?.event_venue || 'Main Campus'}</p>
                  <p><strong className="text-white">Date & Time:</strong> {settings?.event_date} ({settings?.event_time})</p>
                  <p><strong className="text-white">Dandiya Sticks:</strong> {registration.dandiya_sticks}</p>
                  <p><strong className="text-white">Entry Gate Status:</strong> <span className={registration.entry_status === 'ENTERED' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>{registration.entry_status}</span></p>
                </div>

                {/* Ticket CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href={`/ticket/${registration.registration_id}`}
                    className="px-5 py-2.5 bg-emerald-500 text-black font-extrabold text-xs rounded-xl shadow-green-glow hover:bg-emerald-400 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> View Full Printable Ticket
                  </Link>

                  <button
                    onClick={handleResendTicket}
                    className="px-4 py-2.5 bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Mail className="w-4 h-4 text-brand-400" /> Resend Ticket to Email
                  </button>
                </div>

                {emailStatus && (
                  <p className="text-xs font-semibold text-amber-400">{emailStatus}</p>
                )}
              </div>
            </div>
          )}

          {registration.payment_status === 'PENDING' && (
            <div className="bg-amber-950/40 border border-amber-800/80 p-6 rounded-2xl space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white">Payment Verification in Progress</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Our organizing team is reviewing your UPI transaction (UTR: <code className="bg-zinc-900 px-2 py-0.5 rounded text-amber-300 font-mono">{registration.payment_transaction_id}</code>) and attached screenshot.
                  </p>
                  <p className="text-xs text-zinc-400">
                    Verification usually completes within 1-4 hours. Refresh this page or check back shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {registration.payment_status === 'REJECTED' && (
            <div className="bg-red-950/40 border border-red-800/80 p-6 rounded-2xl space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white">Payment Verification Unsuccessful</h4>
                  <p className="text-xs text-red-200 leading-relaxed">
                    <strong>Admin Verification Note:</strong> {registration.verification_note || 'Uploaded screenshot or UTR number could not be matched.'}
                  </p>
                  <p className="text-xs text-zinc-400">
                    Please submit a new registration with the correct 12-digit UTR and clear screenshot, or contact event support desk.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/register"
                      className="inline-block px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs shadow-red-glow"
                    >
                      Re-submit Registration with Proof
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Student Info Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-zinc-300 border-t border-zinc-800 pt-6">
            <div>
              <span className="text-zinc-500 block">Student Name</span>
              <span className="font-semibold text-white">{registration.full_name}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">USN / ID</span>
              <span className="font-semibold text-white font-mono">{registration.usn}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Department</span>
              <span className="font-semibold text-white">{registration.department}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Semester & Section</span>
              <span className="font-semibold text-white">{registration.semester} ({registration.section})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-400">Loading registration status...</div>}>
      <StatusContent />
    </Suspense>
  );
}
