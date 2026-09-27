'use client';

import React, { useState, useEffect } from 'react';
import { adminFetch, downloadAdminFile } from '@/lib/admin-client';
import {
  BarChart3,
  Download,
  Users,
  CheckCircle2,
  QrCode,
  Filter,
  Loader2,
  Layers,
  GraduationCap
} from 'lucide-react';
import { AnalyticsMatrixItem } from '@/lib/types';

export default function AdminAnalyticsPage() {
  const [matrix, setMatrix] = useState<AnalyticsMatrixItem[]>([]);
  const [departments, setDepartments] = useState<Record<string, number>>({});
  const [semesters, setSemesters] = useState<Record<string, number>>({});
  const [sections, setSections] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Filters for drill-down
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedSem, setSelectedSem] = useState('ALL');
  const [selectedSec, setSelectedSec] = useState('ALL');

  useEffect(() => {
    async function loadAnalyticsData() {
      try {
        const res = await adminFetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          setMatrix(data.matrix || []);
          setDepartments(data.departments || {});
          setSemesters(data.semesters || {});
          setSections(data.sections || {});
        }
      } catch (e) {
        console.error('Failed to load analytics:', e);
      } finally {
        setLoading(false);
      }
    }
    loadAnalyticsData();
  }, []);

  const handleExport = async () => {
    try {
      await downloadAdminFile(
        '/api/export-csv?mode=analytics',
        `JALSA2026_Analytics_Matrix_${Date.now()}.csv`
      );
    } catch (error: any) {
      alert(error?.message || 'Failed to export analytics.');
    }
  };

  const filteredMatrix = matrix.filter((item) => {
    if (selectedDept !== 'ALL' && item.department !== selectedDept) return false;
    if (selectedSem !== 'ALL' && item.semester !== selectedSem) return false;
    if (selectedSec !== 'ALL' && item.section !== selectedSec) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-white">Student & Gate Analytics Matrix</h1>
          <p className="text-xs text-zinc-400">Detailed breakdown by Department, Semester, Section and Attendance Rate.</p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="px-5 py-2.5 bg-emerald-950/80 border border-emerald-700 text-emerald-300 hover:bg-emerald-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-green-glow transition-all w-fit"
        >
          <Download className="w-4 h-4" /> Export Analytics Matrix CSV
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs text-zinc-400">Computing analytics matrix...</p>
        </div>
      ) : (
        <>
          {/* STATS BREAKDOWN SUMMARY CARDS (#24) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* By Department */}
            <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-4 shadow-xl">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2 border-b border-zinc-800 pb-3">
                <GraduationCap className="w-4 h-4 text-brand-400" /> Registrations by Department
              </h3>
              <div className="space-y-2 text-xs">
                {Object.entries(departments).length === 0 ? (
                  <p className="text-zinc-500">No data available.</p>
                ) : (
                  Object.entries(departments).map(([dept, count]) => (
                    <div key={dept} className="flex justify-between items-center bg-dark-bg p-2.5 rounded-xl border border-dark-border">
                      <span className="text-zinc-300 truncate max-w-[200px]">{dept}</span>
                      <span className="font-bold text-amber-400 font-mono">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* By Semester */}
            <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-4 shadow-xl">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Layers className="w-4 h-4 text-brand-400" /> Registrations by Semester
              </h3>
              <div className="space-y-2 text-xs">
                {Object.entries(semesters).length === 0 ? (
                  <p className="text-zinc-500">No data available.</p>
                ) : (
                  Object.entries(semesters).map(([sem, count]) => (
                    <div key={sem} className="flex justify-between items-center bg-dark-bg p-2.5 rounded-xl border border-dark-border">
                      <span className="text-zinc-300">{sem}</span>
                      <span className="font-bold text-amber-400 font-mono">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* By Section */}
            <div className="bg-dark-card border border-dark-border p-6 rounded-3xl space-y-4 shadow-xl">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Users className="w-4 h-4 text-brand-400" /> Registrations by Section
              </h3>
              <div className="space-y-2 text-xs">
                {Object.entries(sections).length === 0 ? (
                  <p className="text-zinc-500">No data available.</p>
                ) : (
                  Object.entries(sections).map(([sec, count]) => (
                    <div key={sec} className="flex justify-between items-center bg-dark-bg p-2.5 rounded-xl border border-dark-border">
                      <span className="text-zinc-300">{sec}</span>
                      <span className="font-bold text-amber-400 font-mono">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* REQUIRED MATRIX DRILL-DOWN TABLE (#23, #54) */}
          <div className="bg-dark-card border border-dark-border rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Department × Semester × Section Drill-Down Table</h3>
                <p className="text-xs text-zinc-400">Answer exact query: "How many students registered from which section of which semester?"</p>
              </div>

              {/* Matrix Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-3 py-1.5 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-brand-500"
                >
                  <option value="ALL">All Depts</option>
                  {Object.keys(departments).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <select
                  value={selectedSem}
                  onChange={(e) => setSelectedSem(e.target.value)}
                  className="px-3 py-1.5 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-brand-500"
                >
                  <option value="ALL">All Semesters</option>
                  {Object.keys(semesters).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={selectedSec}
                  onChange={(e) => setSelectedSec(e.target.value)}
                  className="px-3 py-1.5 bg-dark-bg border border-dark-border rounded-xl text-white focus:border-brand-500"
                >
                  <option value="ALL">All Sections</option>
                  {Object.keys(sections).map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900/80 text-zinc-400 uppercase tracking-wider text-[10px] font-extrabold border-b border-dark-border">
                  <tr>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4">Total Registered</th>
                    <th className="py-3 px-4">Verified</th>
                    <th className="py-3 px-4">Entered Venue</th>
                    <th className="py-3 px-4">Pending</th>
                    <th className="py-3 px-4">Rejected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredMatrix.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-zinc-500">
                        No department/semester/section combinations match criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredMatrix.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">{item.department}</td>
                        <td className="py-3 px-4 text-zinc-300">{item.semester}</td>
                        <td className="py-3 px-4 font-bold text-amber-400">{item.section}</td>
                        <td className="py-3 px-4 font-black text-white font-mono">{item.total}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400 font-mono">{item.verified}</td>
                        <td className="py-3 px-4 font-bold text-emerald-300 font-mono">{item.entered}</td>
                        <td className="py-3 px-4 font-semibold text-amber-400 font-mono">{item.pending}</td>
                        <td className="py-3 px-4 font-semibold text-red-400 font-mono">{item.rejected}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
