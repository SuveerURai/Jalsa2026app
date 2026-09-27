import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthResponse, requireRole } from '@/lib/admin-auth';
import { getRegistrationByIdOrToken } from '@/lib/db';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(req);
  if (isAuthResponse(admin)) return admin;

  const forbidden = requireRole(admin, ['SUPER_ADMIN', 'ADMIN']);
  if (forbidden) return forbidden;

  try {
    const registration = await getRegistrationByIdOrToken(params.id);
    if (!registration) {
      return NextResponse.json({ error: 'Registration record not found.' }, { status: 404 });
    }

    if (isSupabaseConfigured()) {
      const path = registration.payment_screenshot_path;
      if (path && !path.startsWith('http://') && !path.startsWith('https://')) {
        const { data: signed, error } = await supabaseAdmin.storage
          .from('payment-screenshots')
          .createSignedUrl(path, 300);

        if (error) {
          console.error('Failed to sign payment screenshot:', error);
        } else {
          return NextResponse.json({
            success: true,
            registration: { ...registration, payment_screenshot_url: signed.signedUrl },
          });
        }
      }
    }

    return NextResponse.json({ success: true, registration });
  } catch (error: any) {
    console.error('Admin registration detail route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load registration.' },
      { status: 500 }
    );
  }
}
