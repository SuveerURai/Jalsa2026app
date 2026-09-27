'use client';

import React, { useState, useEffect } from 'react';
import { adminFetch, downloadAdminFile } from '@/lib/admin-client';
import { ShieldCheck, Clock, User, FileText, Loader2 } from 'lucide-react';
import { AuditLog } from '@/lib/types';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await adminFetch('/api/admin/audit-logs');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load audit logs.');
        setLogs(data.logs || []);
      } catch (e) {
        console.error('Failed to load audit logs:', e);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-dark-border pb-6">
        <h1 className="text-3xl font-black text-white">System Audit Trail</h1>
        <p className="text-xs text-zinc-400">Accountability log tracking all administrative payment verifications, QR actions & gate entries.</p>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-3xl p-6 shadow-2xl space-y-4">
        {loading ? (
          <div className="text-center py-12 text-zinc-400">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
            Loading audit history...
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-dark-bg p-4 rounded-2xl border border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-400 uppercase font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800">
                      {log.action}
                    </span>
                    {log.registration_id && (
                      <span className="font-mono text-white font-bold">{log.registration_id}</span>
                    )}
                  </div>
                  <p className="text-zinc-400">Admin: <strong className="text-zinc-200">{log.admin_email}</strong></p>
                  {log.details && (
                    <p className="text-[11px] text-zinc-500 font-mono">{JSON.stringify(log.details)}</p>
                  )}
                </div>
                <div className="text-zinc-500 font-mono text-[11px] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
