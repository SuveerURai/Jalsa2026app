'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Clock, Search, ArrowRight, Loader2, Sparkles, User, ShieldCheck } from 'lucide-react';
import { Registration } from '@/lib/types';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const regId = searchParams.get('id') || '';

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safely trigger celebration confetti on client only
    if (typeof window !== 'undefined') {
      import('canvas-confetti')
        .then((module) => {
          const conf = module.default || module;
          if (typeof conf === 'function') {
            conf({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        })
        .catch(() => {});
    }

    if (regId) {
      fetch(`/api/register?id=${encodeURIComponent(regId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.registration) {
            setRegistration(data.registration);
          }
        })
        .catch((e) => console.error('Error loading registration:', e))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [regId]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 min-h-[70vh]">
      
      {/* Top Banner */}
      <div className="bg-dark-card border border-dark-border p-8 rounded-3xl text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-brand-500 to-amber-500" />
        
        <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-brand-500/60 text-brand-400 mx-auto flex items-center justify-center shadow-gold-glow">
          <CheckCircle2 className="w-10 h-10 text-brand-400" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Registration Submitted Successfully!
        </h1>

        <div className="inline-block px-5 py-2.5 rounded-xl bg-amber-950/60 border border-brand-500/40 text-brand-300 font-mono text-xl sm:text-2xl font-black tracking-wider shadow-gold-glow">
          {regId || registration?.registration_id || 'JALSA26-SUBMITTED'}
        </div>

        <p className="text-zinc-300 text-sm max-w-lg mx-auto leading-relaxed">
          Your registration and UPI payment details have been logged in the event system.
        </p>
      </div>

      {/* Important Notification Box */}
      <div className="bg-amber-950/50 border border-amber-800/80 p-5 rounded-2xl flex items-start gap-4 text-amber-200 text-sm shadow-lg">
        <Clock className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-300">Important Note on QR Ticket:</h4>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Your registration has been submitted successfully. Your ticket and QR code will be generated after payment verification by the organizing committee.
          </p>
        </div>
      </div>

      {/* Registration Details Summary */}
      <div className="bg-dark-card border border-dark-border p-6 sm:p-8 rounded-3xl space-y-5 shadow-xl">
        <h3 className="font-extrabold text-white text-base border-b border-zinc-800 pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-400" /> Registration & Payment Details
        </h3>

        {loading ? (
          <div className="py-6 text-center text-zinc-400 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
            <span>Loading registration summary...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-300">
            <div className="bg-dark-bg p-3.5 rounded-xl border border-dark-border">
              <span className="text-zinc-500 block text-[11px]">Registration ID</span>
              <span className="font-mono font-bold text-amber-400 text-base">{registration?.registration_id || regId}</span>
            </div>

            <div className="bg-dark-bg p-3.5 rounded-xl border border-dark-border">
              <span className="text-zinc-500 block text-[11px]">Payment Status</span>
              <span className="font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800 inline-block mt-0.5">
                PENDING VERIFICATION
              </span>
            </div>

            {registration && (
              <>
                <div className="bg-dark-bg p-3.5 rounded-xl border border-dark-border">
                  <span className="text-zinc-500 block text-[11px]">Participant Name</span>
                  <span className="font-bold text-white text-sm">{registration.full_name}</span>
                </div>

                <div className="bg-dark-bg p-3.5 rounded-xl border border-dark-border">
                  <span className="text-zinc-500 block text-[11px]">USN / Student ID</span>
                  <span className="font-mono font-bold text-white text-sm">{registration.usn}</span>
                </div>

                <div className="bg-dark-bg p-3.5 rounded-xl border border-dark-border">
                  <span className="text-zinc-500 block text-[11px]">Department & Semester</span>
                  <span className="font-semibold text-white">{registration.department} ({registration.semester})</span>
                </div>

                <div className="bg-dark-bg p-3.5 rounded-xl border border-dark-border">
                  <span className="text-zinc-500 block text-[11px]">Section</span>
                  <span className="font-semibold text-white">{registration.section}</span>
                </div>

                <div className="bg-dark-bg p-3.5 rounded-xl border border-dark-border">
                  <span className="text-zinc-500 block text-[11px]">UPI Transaction ID / UTR</span>
                  <code className="text-amber-300 font-mono font-bold">{registration.payment_transaction_id}</code>
                </div>
              </>
            )}

            <div className="bg-dark-bg p-3.5 rounded-xl border border-dark-border">
              <span className="text-zinc-500 block text-[11px]">Registration Fee</span>
              <span className="font-bold text-white text-sm">₹{registration?.fee_amount || 200} INR</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <Link
          href={`/registration/status?query=${encodeURIComponent(regId || registration?.registration_id || '')}`}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 via-brand-500 to-amber-500 text-black font-extrabold rounded-xl shadow-gold-glow hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5 text-black" />
          <span>Check Registration Status</span>
          <ArrowRight className="w-4 h-4 text-black" />
        </Link>

        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold rounded-xl hover:bg-zinc-800 transition-colors text-center"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        <p className="text-zinc-400 text-xs">Loading registration confirmation...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
