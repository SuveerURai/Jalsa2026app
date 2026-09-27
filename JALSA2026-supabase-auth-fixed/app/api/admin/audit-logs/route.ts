import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthResponse, requireRole } from '@/lib/admin-auth';
import { getAuditLogs } from '@/lib/db';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (isAuthResponse(admin)) return admin;

  const forbidden = requireRole(admin, ['SUPER_ADMIN', 'ADMIN']);
  if (forbidden) return forbidden;

  try {
    const logs = await getAuditLogs();
    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Audit logs route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load audit logs.' },
      { status: 500 }
    );
  }
}
