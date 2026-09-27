import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthResponse, requireRole } from '@/lib/admin-auth';
import { recordQrEntry } from '@/lib/db';

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (isAuthResponse(admin)) return admin;

  const forbidden = requireRole(admin, ['SUPER_ADMIN', 'ADMIN', 'SCANNER']);
  if (forbidden) return forbidden;

  try {
    const body = await req.json();
    const { qrToken, gate, scannerId } = body;

    if (!qrToken) {
      return NextResponse.json({ error: 'QR Token is required.' }, { status: 400 });
    }

    const result = await recordQrEntry(
      qrToken,
      gate || 'Main Entrance',
      scannerId || admin.user.email || 'Scanner-Volunteer'
    );

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Scan QR route error:', error);
    return NextResponse.json({ error: error.message || 'Server error.' }, { status: 500 });
  }
}
