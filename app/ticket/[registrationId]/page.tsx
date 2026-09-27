'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Printer,
  Mail,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  User,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  XCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import QRCode from 'qrcode';
import { Registration, EventSettings } from '@/lib/types';

export default function DigitalTicketPage() {
  const params = useParams();
  const router = useRouter();
  const registrationId = params.registrationId as string;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailNotice, setEmailNotice] = useState('');

  useEffect(() => {
    async function loadTicketData() {
      if (!registrationId) return;
      try {
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) setSettings(await settingsRes.json());

        const res = await fetch(`/api/register?query=${encodeURIComponent(registrationId)}`);
        const data = await res.json();

        if (!res.ok || !data.registration) {
          throw new Error('Ticket not found for this Registration ID.');
        }

        const reg: Registration = data.registration;
        setRegistration(reg);

        if (reg.qr_token) {
          const url = await QRCode.toDataURL(reg.qr_token, {
            width: 320,
            margin: 2,
            color: { dark: '#000000', light: '#FFFFFF' }
          });
          setQrDataUrl(url);
        }
      } catch (e: any) {
        console.error('Ticket load error:', e);
        setErrorMsg(e.message || 'Error rendering ticket.');
      } finally {
        setLoading(false);
      }
    }
    loadTicketData();
  }, [registrationId]);

  const handlePrint = () => {
    window.print();
  };

  const handleEmailTicket = async () => {
    if (!registration) return;
    setEmailNotice('Sending ticket email...');
    try {
      const res = await fetch('/api/ticket-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: registration.registration_id })
      });
      if (res.ok) {
        setEmailNotice('✓ Ticket emailed successfully to ' + registration.email);
      } else {
        setEmailNotice('Could not send email.');
      }
    } catch (e) {
      setEmailNotice('Email service unavailable.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
        <p className="text-zinc-400 text-sm">Rendering JALSA 2026 Digital Pass...</p>
      </div>
    );
  }

  if (errorMsg || !registration) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Ticket Not Found</h2>
        <p className="text-zinc-400 text-sm">{errorMsg || 'Invalid registration ID.'}</p>
        <Link href="/registration/status" className="inline-block px-5 py-2.5 bg-brand-500 text-black font-bold rounded-xl text-xs shadow-gold-glow">
          Back to Status Lookup
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Top Action Header (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print border-b border-dark-border pb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleEmailTicket}
            className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-200 hover:bg-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Mail className="w-4 h-4 text-brand-400" /> Email Ticket
          </button>
          
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-gradient-to-r from-amber-400 via-brand-500 to-amber-500 text-black font-extrabold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-black" /> Print / Save PDF
          </button>
        </div>
      </div>

      {emailNotice && (
        <p className="text-xs font-semibold text-center text-amber-400 no-print">{emailNotice}</p>
      )}

      {/* OFFICIAL TICKET CARD DESIGN */}
      <div className="print-only-card bg-dark-card border-2 border-brand-500/60 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
        
        {/* Decorative Ticket Stub Edges */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-400 via-brand-500 to-amber-400" />

        {/* Header Header Brand */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800 pb-6 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-black text-3xl tracking-wider text-amber-400">JALSA '26</span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-700">
                OFFICIAL ENTRY TICKET
              </span>
            </div>
            <p className="text-xs text-zinc-400">College Cultural Mega Festival & Dandiya Night</p>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-xs text-zinc-500 block">Registration ID</span>
            <span className="text-2xl font-black text-amber-400 font-mono tracking-wider">{registration.registration_id}</span>
          </div>
        </div>

        {/* Main Body Grid (QR + Details) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center bg-white p-5 rounded-2xl text-black space-y-2 border-2 border-black shadow-lg">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-800">Scan at Entry Gate</span>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Gate Entry QR Code" className="w-44 h-44 rounded" />
            ) : (
              <div className="w-44 h-44 bg-zinc-200 flex items-center justify-center text-xs text-zinc-500">QR Loading...</div>
            )}
            <span className="text-[10px] font-mono text-zinc-600 truncate max-w-[180px]">{registration.qr_token || registration.registration_id}</span>
            <div className="pt-1 text-center">
              <span className="text-xs font-bold text-black block">{registration.entry_status === 'ENTERED' ? '✓ ALREADY ENTERED' : 'VALUABLE PASS — ACTIVE'}</span>
            </div>
          </div>

          {/* Attendee Details Grid */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs text-zinc-300">
              <div className="bg-dark-bg p-3 rounded-xl border border-dark-border">
                <span className="text-zinc-500 block text-[11px]">Participant Name</span>
                <span className="font-bold text-white text-sm">{registration.full_name}</span>
              </div>

              <div className="bg-dark-bg p-3 rounded-xl border border-dark-border">
                <span className="text-zinc-500 block text-[11px]">USN / Student ID</span>
                <span className="font-bold text-white text-sm font-mono">{registration.usn}</span>
              </div>

              <div className="bg-dark-bg p-3 rounded-xl border border-dark-border">
                <span className="text-zinc-500 block text-[11px]">Department</span>
                <span className="font-semibold text-white">{registration.department}</span>
              </div>

              <div className="bg-dark-bg p-3 rounded-xl border border-dark-border">
                <span className="text-zinc-500 block text-[11px]">Semester & Section</span>
                <span className="font-semibold text-white">{registration.semester} ({registration.section})</span>
              </div>
            </div>

            {/* Event Info Details */}
            <div className="space-y-2 text-xs bg-amber-950/30 border border-amber-900/60 p-4 rounded-xl text-amber-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span><strong>Date:</strong> {settings?.event_date || 'October 18, 2026'} ({settings?.event_time || '5:00 PM'})</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span><strong>Venue:</strong> {settings?.event_venue || 'Main Campus'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span><strong>Dandiya Preference:</strong> {registration.dandiya_sticks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Instructions */}
        <div className="border-t border-zinc-800 pt-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-zinc-500 gap-2">
          <span>• Carry your physical College Student ID card along with this QR pass.</span>
          <span>• Valid for single entry only.</span>
        </div>
      </div>
    </div>
  );
}
