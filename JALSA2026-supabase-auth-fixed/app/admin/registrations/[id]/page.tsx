'use client';

import React, { useState, useEffect } from 'react';
import { adminFetch, downloadAdminFile } from '@/lib/admin-client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  IdCard,
  GraduationCap,
  Sparkles,
  IndianRupee,
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  RotateCw,
  Ban,
  ShieldCheck,
  Eye,
  Loader2,
  AlertTriangle,
  Send
} from 'lucide-react';
import QRCode from 'qrcode';
import { Registration } from '@/lib/types';

export default function RegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionNotice, setActionNotice] = useState('');
  const [processing, setProcessing] = useState(false);

  // Lightbox
  const [showScreenshot, setShowScreenshot] = useState(false);

  const loadRegistration = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminFetch(`/api/admin/registrations/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok || !data.registration) {
        throw new Error('Registration record not found.');
      }
      const reg: Registration = data.registration;
      setRegistration(reg);

      if (reg.qr_token) {
        const url = await QRCode.toDataURL(reg.qr_token, { width: 280, margin: 2 });
        setQrDataUrl(url);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Error loading registration details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistration();
  }, [id]);

  const handleQrAction = async (action: 'REGENERATE' | 'REVOKE' | 'MANUAL_ENTRY') => {
    if (!registration) return;
    if (action === 'REVOKE' && !confirm('Are you sure you want to REVOKE this ticket?')) return;
    if (action === 'MANUAL_ENTRY' && !confirm('Mark this participant as ENTERED manually?')) return;

    setProcessing(true);
    setActionNotice('');
    try {
      const res = await adminFetch('/api/manage-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: registration.registration_id,
          action,
          reason: `Admin action: ${action}`
        })
      });
      const data = await res.json();
      if (res.ok && data.registration) {
        setRegistration(data.registration);
        setActionNotice(`Action ${action} executed successfully.`);
        if (data.registration.qr_token) {
          const url = await QRCode.toDataURL(data.registration.qr_token, { width: 280, margin: 2 });
          setQrDataUrl(url);
        }
      } else {
        throw new Error(data.error || 'Action failed.');
      }
    } catch (e: any) {
      setActionNotice(e.message || 'Error performing action.');
    } finally {
      setProcessing(false);
    }
  };

  const handleResendEmail = async () => {
    if (!registration) return;
    setProcessing(true);
    setActionNotice('Resending ticket email...');
    try {
      const res = await adminFetch('/api/ticket-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: registration.registration_id })
      });
      if (res.ok) {
        setActionNotice('✓ Ticket email dispatched successfully.');
      } else {
        setActionNotice('Email dispatch failed.');
      }
    } catch (e) {
      setActionNotice('Email API error.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <p className="text-zinc-400 text-sm">Loading Registration Inspector...</p>
      </div>
    );
  }

  if (errorMsg || !registration) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Record Not Found</h3>
        <p className="text-xs text-zinc-400">{errorMsg}</p>
        <Link href="/admin/registrations" className="inline-block px-5 py-2.5 bg-zinc-800 text-white rounded-xl text-xs font-bold">
          Back to Registrations
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Table
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 font-mono">Registration ID:</span>
          <span className="text-2xl font-black text-amber-400 font-mono">{registration.registration_id}</span>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-amber-950/80 border border-amber-800 text-amber-200 p-4 rounded-2xl text-xs font-semibold text-center">
          {actionNotice}
        </div>
      )}

      {/* INSPECTOR MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Participant & Payment details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Participant Info Card */}
          <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-zinc-800 pb-3">
              <User className="w-5 h-5 text-brand-400" /> Participant Details
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs text-zinc-300">
              <div>
                <span className="text-zinc-500 block">Full Name</span>
                <span className="font-bold text-white text-sm">{registration.full_name}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">USN / Student ID</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{registration.usn}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Email Address</span>
                <span className="text-zinc-200">{registration.email}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Phone Number</span>
                <span className="text-zinc-200">{registration.phone}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Department & Semester</span>
                <span>{registration.department} ({registration.semester})</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Section</span>
                <span className="font-bold text-white">{registration.section}</span>
              </div>
              <div className="col-span-2">
                <span className="text-zinc-500 block">Dandiya Sticks Choice</span>
                <span className="font-semibold text-purple-300">{registration.dandiya_sticks}</span>
              </div>
            </div>
          </div>

          {/* Payment Inspection Card */}
          <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-zinc-800 pb-3">
              <IndianRupee className="w-5 h-5 text-amber-400" /> Payment & Verification Audit
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs text-zinc-300">
              <div>
                <span className="text-zinc-500 block">Payment Status</span>
                <span className={`font-bold text-xs px-2.5 py-1 rounded-full border inline-block ${
                  registration.payment_status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                  registration.payment_status === 'PENDING' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                  'bg-red-950 text-red-400 border-red-800'
                }`}>
                  {registration.payment_status}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 block">Pass Fee Amount</span>
                <span className="font-bold text-white text-sm">₹{registration.fee_amount}</span>
              </div>

              <div className="col-span-2 bg-dark-bg p-3 rounded-xl border border-dark-border space-y-1">
                <span className="text-[10px] text-zinc-500 font-mono block">Transaction UTR / Ref ID</span>
                <code className="text-sm font-bold text-amber-300 font-mono select-all block">{registration.payment_transaction_id}</code>
              </div>

              {registration.verified_by && (
                <div className="col-span-2 text-xs text-zinc-400">
                  <p>Verified By: <strong className="text-white">{registration.verified_by}</strong> on {new Date(registration.verified_at || '').toLocaleString()}</p>
                </div>
              )}

              {/* Screenshot Preview */}
              <div className="col-span-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScreenshot(true)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <Eye className="w-4 h-4 text-brand-400" /> Inspect Payment Screenshot Proof
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Status, Gate Scan & Admin Actions */}
        <div className="space-y-6">
          
          {/* Ticket QR Card */}
          <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-4 shadow-xl text-center">
            <h3 className="font-extrabold text-white text-sm">Gate Entry QR Token</h3>
            
            {qrDataUrl ? (
              <div className="flex flex-col items-center p-4 bg-white rounded-2xl text-black space-y-2 border-2 border-black">
                <img src={qrDataUrl} alt="Gate QR" className="w-44 h-44" />
                <span className="text-[10px] font-mono text-zinc-700 truncate max-w-[180px]">{registration.qr_token}</span>
              </div>
            ) : (
              <div className="p-8 bg-zinc-900 rounded-2xl text-xs text-zinc-500">
                QR Token Not Generated (Payment Status: {registration.payment_status})
              </div>
            )}

            <div className="space-y-1 text-xs text-zinc-400 border-t border-zinc-800 pt-4">
              <p>QR Status: <strong className="text-white font-mono">{registration.qr_status}</strong></p>
              <p>Gate Status: <strong className={registration.entry_status === 'ENTERED' ? 'text-amber-400' : 'text-emerald-400'}>{registration.entry_status}</strong></p>
              {registration.entry_time && (
                <p className="text-[11px] text-zinc-500">Entered: {new Date(registration.entry_time).toLocaleString()} at {registration.entry_gate}</p>
              )}
            </div>
          </div>

          {/* ADMIN OVERRIDE CONTROLS (#43, #44) */}
          <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-3 shadow-xl">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Administrative Actions</h4>
            
            <button
              onClick={handleResendEmail}
              disabled={processing}
              className="w-full py-2.5 bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-brand-400" /> Resend Digital Ticket Email
            </button>

            <button
              onClick={() => handleQrAction('REGENERATE')}
              disabled={processing || registration.payment_status !== 'VERIFIED'}
              className="w-full py-2.5 bg-amber-950/60 border border-amber-800 text-amber-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-amber-900/60 disabled:opacity-40"
            >
              <RotateCw className="w-4 h-4" /> Regenerate QR Token
            </button>

            <button
              onClick={() => handleQrAction('MANUAL_ENTRY')}
              disabled={processing || registration.entry_status === 'ENTERED'}
              className="w-full py-2.5 bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-900/60 disabled:opacity-40"
            >
              <CheckCircle2 className="w-4 h-4" /> Manual Gate Entry Override
            </button>

            <button
              onClick={() => handleQrAction('REVOKE')}
              disabled={processing || registration.qr_status === 'REVOKED'}
              className="w-full py-2.5 bg-red-950/60 border border-red-800 text-red-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-red-900/60 disabled:opacity-40"
            >
              <Ban className="w-4 h-4 text-red-400" /> Revoke Ticket Pass
            </button>
          </div>
        </div>
      </div>

      {/* SCREENSHOT LIGHTBOX */}
      {showScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-dark-card border border-dark-border p-4 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Payment Screenshot Proof Inspection</h4>
              <button onClick={() => setShowScreenshot(false)} className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-800">
                ✕
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-2xl border border-zinc-800">
              <img src={registration.payment_screenshot_url || registration.payment_screenshot_path} alt="Payment Proof" className="w-full h-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
