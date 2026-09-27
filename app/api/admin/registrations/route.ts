import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthResponse, requireRole } from '@/lib/admin-auth';
import { listRegistrations } from '@/lib/db';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (isAuthResponse(admin)) return admin;

  const forbidden = requireRole(admin, ['SUPER_ADMIN', 'ADMIN']);
  if (forbidden) return forbidden;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || '20')));

    const result = await listRegistrations({
      search: searchParams.get('search') || undefined,
      department: searchParams.get('department') || undefined,
      semester: searchParams.get('semester') || undefined,
      section: searchParams.get('section') || undefined,
      paymentStatus: searchParams.get('paymentStatus') || undefined,
      entryStatus: searchParams.get('entryStatus') || undefined,
      dandiyaSticks: searchParams.get('dandiyaSticks') || undefined,
      page,
      limit,
    });

    // Payment screenshots live in a private Storage bucket. Never expose the
    // storage path directly to the browser; create short-lived signed URLs
    // only for authenticated admin requests.
    if (isSupabaseConfigured() && result.data.length > 0) {
      const data = await Promise.all(result.data.map(async (registration) => {
        const path = registration.payment_screenshot_path;
        if (!path || path.startsWith('http://') || path.startsWith('https://')) {
          return registration;
        }

        const { data: signed, error: signedError } = await supabaseAdmin.storage
          .from('payment-screenshots')
          .createSignedUrl(path, 300);

        if (signedError) {
          console.error(`Failed to sign payment screenshot for ${registration.registration_id}:`, signedError);
          return registration;
        }

        return { ...registration, payment_screenshot_url: signed.signedUrl };
      }));

      return NextResponse.json({ ...result, data });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Admin registrations route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load registrations.' },
      { status: 500 }
    );
  }
}
