'use client';

import React, { useState, useEffect, useRef } from 'react';
import { adminFetch, downloadAdminFile } from '@/lib/admin-client';
import Link from 'next/link';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RotateCcw,
  Search,
  Zap,
  Volume2,
  History,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Registration } from '@/lib/types';

interface ScanHistoryItem {
  id: string;
  registration_id: string;
  full_name: string;
  usn: string;
  status: 'APPROVED' | 'ALREADY_ENTERED' | 'UNVERIFIED' | 'INVALID';
  time: string;
}

export default function QrScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [processing, setProcessing] = useState(false);

  // Scan Result State
  const [scanResult, setScanResult] = useState<{
    code: 'ENTRY_APPROVED' | 'ALREADY_ENTERED' | 'UNVERIFIED_PAYMENT' | 'TICKET_REVOKED' | 'INVALID_QR' | null;
    message: string;
    registration?: Registration;
    entry_time?: string;
    entry_gate?: string;
  }>({ code: null, message: '' });

  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    // Initialize html5-qrcode camera instance if available
    const qrRegionId = 'html5qr-code-full-region';
    
    async function startScanner() {
      try {
        const html5QrCode = new Html5Qrcode(qrRegionId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            handleScanToken(decodedText);
          },
          () => {}
        );
        setScanning(true);
      } catch (err) {
        console.warn('Camera access error:', err);
      }
    }

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const playFeedbackSound = (type: 'APPROVED' | 'DENIED') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'APPROVED') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.1); // E3
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {}
  };

  const handleScanToken = async (qrToken: string) => {
    if (processing) return;
    setProcessing(true);

    try {
      const res = await adminFetch('/api/scan-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken,
          gate: 'Main Entry Gate',
          scannerId: 'Volunteer-Gate-1'
        })
      });

      const data = await res.json();
      const registration =
        data.registration ??
        data.result?.registration ??
        data.data?.registration;

      if (data.code === 'ENTRY_APPROVED') {
        playFeedbackSound('APPROVED');
        setScanResult({
          code: 'ENTRY_APPROVED',
          message: 'ENTRY APPROVED!',
          registration
        });

        // Add to scan history
        setHistory((prev) => [
          {
            id: Date.now().toString(),
            registration_id: data.registration.registration_id,
            full_name: data.registration.full_name,
            usn: data.registration.usn,
            status: 'APPROVED',
            time: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
      } else if (data.code === 'ALREADY_ENTERED') {
        playFeedbackSound('DENIED');
        setScanResult({
          code: 'ALREADY_ENTERED',
          message: 'ALREADY ENTERED AT GATE!',
          registration,
          entry_time: data.entry_time,
          entry_gate: data.entry_gate
        });

        setHistory((prev) => [
          {
            id: Date.now().toString(),
            registration_id: registration?.registration_id || 'UNKNOWN',
            full_name: registration?.full_name || 'Unknown Student',
            usn: registration?.usn || 'UNKNOWN',
            status: 'ALREADY_ENTERED',
            time: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
      } else {
        playFeedbackSound('DENIED');
        setScanResult({
          code: data.code || 'INVALID_QR',
          message: data.message || 'INVALID TICKET PASS!',
          registration: data.registration
        });
      }
    } catch (e) {
      playFeedbackSound('DENIED');
      setScanResult({
        code: 'INVALID_QR',
        message: 'ERROR READING QR PASS.'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScanToken(manualInput.trim());
    }
  };

  const resetScannerResult = () => {
    setScanResult({ code: null, message: '' });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Mobile Header */}
      <div className="flex items-center justify-between border-b border-dark-border pb-4">
        <Link href="/admin/dashboard" className="flex items-center gap-1 text-zinc-400 text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h1 className="text-lg font-black text-white">Entry Gate Scanner</h1>
        </div>
      </div>

      {/* RESULT BANNER (#19, #20, #21) */}
      {scanResult.code && (
        <div className={`p-6 rounded-3xl space-y-4 shadow-2xl text-center border-2 animate-bounce-short ${
          scanResult.code === 'ENTRY_APPROVED' ? 'bg-emerald-950 border-emerald-500 text-emerald-100 shadow-green-glow' :
          scanResult.code === 'ALREADY_ENTERED' ? 'bg-red-950 border-red-500 text-red-100 shadow-red-glow' :
          'bg-amber-950 border-amber-500 text-amber-100 shadow-gold-glow'
        }`}>
          <div className="flex flex-col items-center space-y-2">
            {scanResult.code === 'ENTRY_APPROVED' && <CheckCircle2 className="w-16 h-16 text-emerald-400" />}
            {scanResult.code === 'ALREADY_ENTERED' && <XCircle className="w-16 h-16 text-red-500" />}
            {scanResult.code !== 'ENTRY_APPROVED' && scanResult.code !== 'ALREADY_ENTERED' && <AlertTriangle className="w-16 h-16 text-amber-400" />}

            <h2 className="text-3xl font-black uppercase tracking-wider">{scanResult.message}</h2>
          </div>

          {scanResult.registration && (
            <div className="bg-black/40 p-4 rounded-2xl text-xs space-y-1 text-left border border-white/10">
              <p><strong className="text-white">Name:</strong> {scanResult.registration.full_name}</p>
              <p><strong className="text-white">Registration ID:</strong> <span className="font-mono text-amber-400">{scanResult.registration.registration_id}</span></p>
              <p><strong className="text-white">USN:</strong> <span className="font-mono">{scanResult.registration.usn}</span></p>
              <p><strong className="text-white">Department:</strong> {scanResult.registration.department}</p>
              <p><strong className="text-white">Sem & Sec:</strong> {scanResult.registration.semester} ({scanResult.registration.section})</p>
              {scanResult.entry_time && (
                <p className="text-red-400 font-bold pt-1">Previously Entered: {new Date(scanResult.entry_time).toLocaleTimeString()} at {scanResult.entry_gate}</p>
              )}
            </div>
          )}

          <button
            onClick={resetScannerResult}
            className="w-full py-3.5 bg-white text-black font-black text-sm rounded-xl shadow-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-black" /> Ready for Next Scan
          </button>
        </div>
      )}

      {/* CAMERA SCANNER AREA (#22 UX) */}
      <div className="bg-dark-card border border-dark-border p-4 rounded-3xl space-y-4 shadow-xl">
        <div className="text-center space-y-1">
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">Point Phone Camera at Attendee QR Pass</span>
        </div>

        {/* Html5Qrcode render region */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-brand-500/60 bg-black min-h-[260px] flex items-center justify-center">
          <div id="html5qr-code-full-region" className="w-full h-full" />
          
          {processing && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-amber-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-xs font-bold">Verifying Token...</span>
            </div>
          )}
        </div>

        {/* Manual Registration ID Search Backup */}
        <form onSubmit={handleManualSubmit} className="pt-2 flex items-center gap-2">
          <input
            type="text"
            placeholder="Manual ID / QR Token lookup..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="flex-grow px-4 py-3 bg-dark-bg border border-dark-border rounded-xl text-xs text-white focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-3 bg-brand-500 text-black font-bold text-xs rounded-xl shadow-gold-glow flex-shrink-0"
          >
            Verify ID
          </button>
        </form>
      </div>

      {/* RECENT SCAN HISTORY FEED */}
      {history.length > 0 && (
        <div className="bg-dark-card border border-dark-border p-5 rounded-3xl space-y-3">
          <h4 className="text-xs font-extrabold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-brand-400" /> Gate Scan History
          </h4>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between bg-dark-bg p-3 rounded-xl border border-dark-border">
                <div>
                  <span className="font-bold text-white block">{h.full_name} ({h.usn})</span>
                  <span className="font-mono text-[10px] text-amber-400">{h.registration_id}</span>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    h.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-red-950 text-red-400 border-red-800'
                  }`}>
                    {h.status}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">{h.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
