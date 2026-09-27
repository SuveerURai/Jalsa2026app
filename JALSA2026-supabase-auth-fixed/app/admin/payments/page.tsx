'use client';

import React, { useState, useEffect } from 'react';
import { adminFetch, downloadAdminFile } from '@/lib/admin-client';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ExternalLink,
  ShieldCheck,
  Search,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { Registration } from '@/lib/types';

export default function PaymentVerificationPage() {
  const [pendingList, setPendingList] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Lightbox Modal for Screenshot
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  // Rejection Modal
  const [rejectingReg, setRejectingReg] = useState<Registration | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  // Processing Action State
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPendingPayments = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/settings'); // warm
      const listRes = await adminFetch('/api/register'); // fallback list endpoint or filter
      // Search with paymentStatus = PENDING
      const dataRes = await adminFetch(`/api/export-csv?mode=json`); // query
      const listData = await adminFetch('/api/analytics');
      
      // Let's call list API
      const req = await adminFetch(`/api/scan-qr`); // dummy
      const searchRes = await adminFetch(`/api/register?query=`); 
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Dedicated query fetch for PENDING registrations
  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/settings`);
      // We can fetch registrations by status using search query or direct list
      // Let's create helper query on frontend
      const statusRes = await adminFetch('/api/analytics');
      const data = await statusRes.json();
      // Let's fetch registrations list
      const r = await adminFetch(`/api/export-csv?mode=json`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Unified list fetch for PENDING status
  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch registrations with pending payment
      const res = await adminFetch('/api/analytics');
      const data = await res.json();
      // Let's get pending list from analytics payload or fallback memory
      // We can query directly
      const rRes = await adminFetch('/api/settings');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const res = await adminFetch('/api/admin/registrations?paymentStatus=PENDING&limit=100');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load pending payments.');
        setPendingList(data.data || []);
      } catch (error) {
        console.error('Failed to load pending payments:', error);
        setPendingList([]);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  const handleVerify = async (regId: string) => {
    setProcessingId(regId);
    try {
      const res = await adminFetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: regId,
          action: 'VERIFY',
          note: 'Payment screenshot & UTR verified.'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to verify payment.');
      }

      // Remove verified item from pending list
      setPendingList((prev) => prev.filter((r) => r.registration_id !== regId));
    } catch (e: any) {
      alert(e.message || 'Error verifying payment.');
    } font: {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReg) return;
    setProcessingId(rejectingReg.registration_id);

    try {
      const res = await adminFetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: rejectingReg.registration_id,
          action: 'REJECT',
          note: rejectNote || 'Payment UTR or screenshot invalid.'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to reject payment.');
      }

      setPendingList((prev) => prev.filter((r) => r.registration_id !== rejectingReg.registration_id));
      setRejectingReg(null);
      setRejectNote('');
    } catch (e: any) {
      alert(e.message || 'Error rejecting payment.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white">Payment Verification Desk</h1>
            <span className="bg-amber-950 text-amber-400 border border-amber-800 text-xs font-bold px-3 py-1 rounded-full">
              {pendingList.length} Pending Approval
            </span>
          </div>
          <p className="text-xs text-zinc-400">Inspect submitted UPI transaction IDs (UTRs) & screenshots to issue QR tickets.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs text-zinc-400">Loading pending payment submissions...</p>
        </div>
      ) : pendingList.length === 0 ? (
        <div className="bg-dark-card border border-dark-border p-12 rounded-3xl text-center space-y-3 max-w-lg mx-auto">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">All Clear! No Pending Payments</h3>
          <p className="text-xs text-zinc-400">All submitted student registration payments have been verified and processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingList.map((reg) => (
            <div key={reg.registration_id} className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-6 shadow-xl relative flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono block">Registration ID</span>
                    <span className="text-xl font-black text-amber-400 font-mono">{reg.registration_id}</span>
                  </div>
                  <span className="bg-amber-950 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-800">
                    ₹{reg.fee_amount} PENDING
                  </span>
                </div>

                {/* Participant info */}
                <div className="grid grid-cols-2 gap-3 text-xs text-zinc-300">
                  <div>
                    <span className="text-zinc-500 block">Name</span>
                    <span className="font-bold text-white">{reg.full_name}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">USN</span>
                    <span className="font-bold text-white font-mono">{reg.usn}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Department</span>
                    <span>{reg.department}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Sem & Section</span>
                    <span>{reg.semester} ({reg.section})</span>
                  </div>
                </div>

                {/* Payment UTR Box */}
                <div className="bg-dark-bg p-3.5 rounded-xl border border-dark-border space-y-1">
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase block">Transaction UTR / Ref ID</span>
                  <code className="text-sm font-bold text-amber-300 font-mono select-all block">{reg.payment_transaction_id}</code>
                  <span className="text-[10px] text-zinc-500 block">Submitted: {new Date(reg.created_at).toLocaleString()}</span>
                </div>

                {/* Screenshot Thumbnail Preview */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-zinc-400 block">Payment Screenshot Proof</span>
                  <div
                    onClick={() => setSelectedScreenshot(reg.payment_screenshot_url || reg.payment_screenshot_path)}
                    className="relative w-full h-40 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-brand-500 cursor-pointer group transition-all"
                  >
                    <img
                      src={reg.payment_screenshot_url || reg.payment_screenshot_path}
                      alt="Payment Proof"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white font-bold text-xs transition-opacity">
                      <Eye className="w-4 h-4" /> Click to Inspect Screenshot
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex items-center gap-3">
                <button
                  onClick={() => setRejectingReg(reg)}
                  disabled={processingId === reg.registration_id}
                  className="flex-1 py-3 bg-red-950/80 border border-red-800 text-red-300 hover:bg-red-900 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Reject Payment
                </button>

                <button
                  onClick={() => handleVerify(reg.registration_id)}
                  disabled={processingId === reg.registration_id}
                  className="flex-1 py-3 bg-emerald-500 text-black font-extrabold text-xs rounded-xl shadow-green-glow hover:bg-emerald-400 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {processingId === reg.registration_id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-black" />
                  )}
                  <span>VERIFY & ISSUE TICKET</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SCREENSHOT LIGHTBOX MODAL */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-dark-card border border-dark-border p-4 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Payment Screenshot Proof Inspection</h4>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-2xl border border-zinc-800">
              <img src={selectedScreenshot} alt="Full Screenshot" className="w-full h-auto" />
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingReg && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleRejectSubmit} className="max-w-md w-full bg-dark-card border border-red-900/80 p-6 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-white text-base">Reject Payment — {rejectingReg.registration_id}</h3>
              <button type="button" onClick={() => setRejectingReg(null)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">Reason for Rejection *</label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Transaction UTR does not match bank statement, or screenshot is blurry."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="w-full p-3 bg-dark-bg border border-dark-border rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingReg(null)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow-red-glow"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
