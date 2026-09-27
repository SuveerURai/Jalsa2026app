import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthResponse } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (isAuthResponse(admin)) return admin;

  return NextResponse.json({
    authenticated: true,
    user: admin.user,
    role: admin.role,
    full_name: admin.full_name,
  });
}
