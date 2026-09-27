import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthResponse, requireRole } from '@/lib/admin-auth';
import { manageRegistrationQr } from '@/lib/db';

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (isAuthResponse(admin)) return admin;

  const forbidden = requireRole(admin, ['SUPER_ADMIN', 'ADMIN']);
  if (forbidden) return forbidden;

  try {
    const body = await req.json();
    const { registrationId, action, reason } = body;
    const adminEmail = admin.user.email || 'unknown-admin';

    if (!registrationId || !['REGENERATE', 'REVOKE', 'MANUAL_ENTRY'].includes(action)) {
      return NextResponse.json({ error: 'Valid registrationId and action are required.' }, { status: 400 });
    }

    const updated = await manageRegistrationQr(
      registrationId,
      action as 'REGENERATE' | 'REVOKE' | 'MANUAL_ENTRY',
      adminEmail,
      reason || ''
    );

    return NextResponse.json({
      success: true,
      registration: updated
    });
  } catch (error: any) {
    console.error('Manage QR route error:', error);
    return NextResponse.json({ error: error.message || 'Server error.' }, { status: 500 });
  }
}
