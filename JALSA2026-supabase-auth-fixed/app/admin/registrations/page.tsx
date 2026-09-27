'use client';

import React, { useState, useEffect } from 'react';
import { adminFetch, downloadAdminFile } from '@/lib/admin-client';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Registration } from '@/lib/types';

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [semFilter, setSemFilter] = useState('ALL');
  const [secFilter, setSecFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [entryStatusFilter, setEntryStatusFilter] = useState('ALL');
  const [dandiyaFilter, setDandiyaFilter] = useState('ALL');

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 20;

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
    loadData();
  }, [page, search, deptFilter, semFilter, secFilter, paymentStatusFilter, entryStatusFilter, dandiyaFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (search.trim()) params.set('search', search.trim());
      if (deptFilter !== 'ALL') params.set('department', deptFilter);
      if (semFilter !== 'ALL') params.set('semester', semFilter);
      if (secFilter !== 'ALL') params.set('section', secFilter);
      if (paymentStatusFilter !== 'ALL') params.set('paymentStatus', paymentStatusFilter);
      if (entryStatusFilter !== 'ALL') params.set('entryStatus', entryStatusFilter);
      if (dandiyaFilter !== 'ALL') params.set('dandiyaSticks', dandiyaFilter);

      const res = await adminFetch(`/api/admin/registrations?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load registrations.');
      }

      setRegistrations(data.data || []);
      setTotalCount(data.total || 0);
    } catch (error: any) {
      console.error('Failed to load registrations:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  // Server-side filtering and pagination are already applied.
  const filtered = registrations;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const paginated = filtered;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-white">Registrations Database</h1>
          <p className="text-xs text-zinc-400">Manage all student passes, filter by department, semester, section & status.</p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="px-5 py-2.5 bg-emerald-950/80 border border-emerald-700 text-emerald-300 hover:bg-emerald-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-green-glow transition-all w-fit"
        >
          <Download className="w-4 h-4" /> Export CSV Database
        </button>
      </div>

      {/* FILTER CONTROLS GRID */}
      <div className="bg-dark-card border border-dark-border p-5 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 border-b border-zinc-800 pb-3">
          <Filter className="w-4 h-4 text-brand-400" /> Multi-Filter Controls
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Global Search */}
          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold block">Search Query</label>
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ID, Name, USN, UTR..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Status Filter */}
          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold block">Payment Status</label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="PENDING">PENDING</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          {/* Entry Status Filter */}
          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold block">Gate Entry Status</label>
            <select
              value={entryStatusFilter}
              onChange={(e) => setEntryStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="ALL">All Entry Statuses</option>
              <option value="NOT_ENTERED">NOT ENTERED</option>
              <option value="ENTERED">ENTERED</option>
            </select>
          </div>

          {/* Dandiya Sticks Filter */}
          <div className="space-y-1">
            <label className="text-zinc-400 font-semibold block">Dandiya Sticks</label>
            <select
              value={dandiyaFilter}
              onChange={(e) => setDandiyaFilter(e.target.value)}
              className="w-full py-2 px-3 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="ALL">All Dandiya Choices</option>
              <option value="Required">Required</option>
              <option value="Not Required">Not Required</option>
            </select>
          </div>
        </div>
      </div>

      {/* MASTER DATA TABLE */}
      <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider text-[10px] font-extrabold border-b border-dark-border">
              <tr>
                <th className="py-4 px-4">Registration ID</th>
                <th className="py-4 px-4">Student Name</th>
                <th className="py-4 px-4">USN</th>
                <th className="py-4 px-4">Department & Sem</th>
                <th className="py-4 px-4">Sec</th>
                <th className="py-4 px-4">Dandiya</th>
                <th className="py-4 px-4">Payment Status</th>
                <th className="py-4 px-4">Gate Entry</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-400">
                    <Loader2 className="w-6 h-6 text-brand-400 animate-spin mx-auto mb-2" />
                    Loading registrations...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-400">
                    No registrations found matching the applied filters.
                  </td>
                </tr>
              ) : (
                paginated.map((reg) => (
                  <tr key={reg.registration_id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-amber-400">{reg.registration_id}</td>
                    <td className="py-4 px-4 font-semibold text-white">{reg.full_name}</td>
                    <td className="py-4 px-4 font-mono text-zinc-300">{reg.usn}</td>
                    <td className="py-4 px-4">{reg.department} ({reg.semester})</td>
                    <td className="py-4 px-4 font-bold text-zinc-300">{reg.section}</td>
                    <td className="py-4 px-4">
                      <span className="text-[11px] bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded">
                        {reg.dandiya_sticks.includes('Required') ? 'Sticks Required' : 'Own Sticks'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {reg.payment_status === 'VERIFIED' && (
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          VERIFIED
                        </span>
                      )}
                      {reg.payment_status === 'PENDING' && (
                        <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          PENDING
                        </span>
                      )}
                      {reg.payment_status === 'REJECTED' && (
                        <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          REJECTED
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${reg.entry_status === 'ENTERED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}>
                        {reg.entry_status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/admin/registrations/${reg.registration_id}`}
                        className="p-2 bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white rounded-lg inline-flex items-center gap-1 text-xs font-semibold hover:border-brand-500 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-400" /> Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="bg-zinc-900/60 p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>Showing {paginated.length} of {filtered.length} entries</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-dark-bg border border-dark-border rounded-lg disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-white">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 bg-dark-bg border border-dark-border rounded-lg disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
