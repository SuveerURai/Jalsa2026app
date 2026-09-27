import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthResponse, requireRole } from '@/lib/admin-auth';
import { listRegistrations } from '@/lib/db';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (isAuthResponse(admin)) return admin;

  const forbidden = requireRole(admin, ['SUPER_ADMIN', 'ADMIN']);
  if (forbidden) return forbidden;

  try {
    // Fetch registrations only once. The previous implementation made three
    // full-table queries (stats, matrix, and registrations), which made the
    // dashboard unnecessarily slow and expensive as registrations grow.
    const { data: allRegs } = await listRegistrations({ limit: 10000 });

    const total = allRegs.length;
    const verified = allRegs.filter((r) => r.payment_status === 'VERIFIED').length;
    const pending = allRegs.filter((r) => r.payment_status === 'PENDING').length;
    const rejected = allRegs.filter((r) => r.payment_status === 'REJECTED').length;
    const entered = allRegs.filter((r) => r.entry_status === 'ENTERED').length;
    const remaining = Math.max(0, verified - entered);
    const totalExpectedRevenue = allRegs.reduce((sum, r) => sum + Number(r.fee_amount || 0), 0);
    const totalVerifiedRevenue = allRegs
      .filter((r) => r.payment_status === 'VERIFIED')
      .reduce((sum, r) => sum + Number(r.fee_amount || 0), 0);
    const dandiyaRequired = allRegs.filter((r) =>
      r.dandiya_sticks.toLowerCase().includes('required') &&
      !r.dandiya_sticks.toLowerCase().includes('not required')
    ).length;
    const dandiyaNotRequired = allRegs.filter((r) =>
      r.dandiya_sticks.toLowerCase().includes('not required')
    ).length;

    const stats = {
      total,
      verified,
      pending,
      rejected,
      entered,
      remaining,
      totalExpectedRevenue,
      totalVerifiedRevenue,
      dandiyaRequired,
      dandiyaNotRequired
    };

    const matrixMap: Record<string, {
      department: string;
      semester: string;
      section: string;
      total: number;
      verified: number;
      entered: number;
      pending: number;
      rejected: number;
    }> = {};

    const deptMap: Record<string, number> = {};
    const semMap: Record<string, number> = {};
    const secMap: Record<string, number> = {};
    const entryTimeline: Record<string, number> = {};

    for (const r of allRegs) {
      deptMap[r.department] = (deptMap[r.department] || 0) + 1;
      semMap[r.semester] = (semMap[r.semester] || 0) + 1;
      secMap[r.section] = (secMap[r.section] || 0) + 1;

      const key = `${r.department}__${r.semester}__${r.section}`;
      if (!matrixMap[key]) {
        matrixMap[key] = {
          department: r.department,
          semester: r.semester,
          section: r.section,
          total: 0,
          verified: 0,
          entered: 0,
          pending: 0,
          rejected: 0
        };
      }

      const item = matrixMap[key];
      item.total += 1;
      if (r.payment_status === 'VERIFIED') item.verified += 1;
      if (r.payment_status === 'PENDING') item.pending += 1;
      if (r.payment_status === 'REJECTED') item.rejected += 1;
      if (r.entry_status === 'ENTERED') item.entered += 1;

      if (r.entry_time) {
        const hour = new Date(r.entry_time).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });
        entryTimeline[hour] = (entryTimeline[hour] || 0) + 1;
      }
    }

    return NextResponse.json({
      stats,
      matrix: Object.values(matrixMap),
      departments: deptMap,
      semesters: semMap,
      sections: secMap,
      entryTimeline
    });
  } catch (error: any) {
    console.error('Analytics route error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load analytics.' },
      { status: 500 }
    );
  }
}
