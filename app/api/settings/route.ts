import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthResponse, requireRole } from '@/lib/admin-auth';
import { getEventSettings, updateEventSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = await getEventSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching settings.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (isAuthResponse(admin)) return admin;

  const forbidden = requireRole(admin, ['SUPER_ADMIN', 'ADMIN']);
  if (forbidden) return forbidden;

  try {
    const body = await req.json();
    const { settings } = body;
    const adminEmail = admin.user.email || 'unknown-admin';
    const updated = await updateEventSettings(settings, adminEmail);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating settings.' }, { status: 500 });
  }
}
