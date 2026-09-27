import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthResponse, requireRole } from '@/lib/admin-auth';
import { listRegistrations, getAnalyticsMatrix } from '@/lib/db';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (isAuthResponse(admin)) return admin;

  const forbidden = requireRole(admin, ['SUPER_ADMIN', 'ADMIN']);
  if (forbidden) return forbidden;

  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'registrations';

    if (mode === 'analytics') {
      const matrix = await getAnalyticsMatrix();
      const headers = ['Department', 'Semester', 'Section', 'Total Registrations', 'Verified', 'Entered', 'Pending', 'Rejected'];
      const rows = matrix.map((item) => [
        `"${item.department}"`,
        `"${item.semester}"`,
        `"${item.section}"`,
        item.total,
        item.verified,
        item.entered,
        item.pending,
        item.rejected
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="JALSA2026_Analytics_Matrix_${Date.now()}.csv"`
        }
      });
    }

    // Default: Registrations Export
    const { data } = await listRegistrations({ limit: 10000 });

    const headers = [
      'Registration ID',
      'Full Name',
      'Email',
      'Phone',
      'USN',
      'Department',
      'Semester',
      'Section',
      'Dandiya Sticks',
      'Fee Amount',
      'Transaction ID (UTR)',
      'Payment Status',
      'Verification Note',
      'Verified By',
      'Verified At',
      'QR Status',
      'Entry Status',
      'Entry Time',
      'Entry Gate',
      'Created At'
    ];

    const rows = data.map((r) => [
      `"${r.registration_id}"`,
      `"${r.full_name.replace(/"/g, '""')}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.usn}"`,
      `"${r.department}"`,
      `"${r.semester}"`,
      `"${r.section}"`,
      `"${r.dandiya_sticks}"`,
      r.fee_amount,
      `"${r.payment_transaction_id}"`,
      `"${r.payment_status}"`,
      `"${(r.verification_note || '').replace(/"/g, '""')}"`,
      `"${r.verified_by || ''}"`,
      `"${r.verified_at || ''}"`,
      `"${r.qr_status}"`,
      `"${r.entry_status}"`,
      `"${r.entry_time || ''}"`,
      `"${r.entry_gate || ''}"`,
      `"${r.created_at}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="JALSA2026_Registrations_${Date.now()}.csv"`
      }
    });

  } catch (error: any) {
    console.error('Export CSV error:', error);
    return NextResponse.json({ error: error.message || 'CSV generation failed.' }, { status: 500 });
  }
}
