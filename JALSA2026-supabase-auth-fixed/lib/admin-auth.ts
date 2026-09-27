import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export type AuthenticatedAdmin = {
  user: {
    id: string;
    email?: string | null;
  };
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SCANNER';
  full_name: string;
};

export async function requireAdmin(req: NextRequest): Promise<AuthenticatedAdmin | NextResponse> {
  const authorization = req.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : '';

  if (!token) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Invalid or expired authentication session.' }, { status: 401 });
  }

  const { data: admin, error: adminError } = await supabaseAdmin
    .from('admin_roles')
    .select('user_id, email, full_name, role')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (adminError) {
    console.error('Admin role lookup failed:', adminError);
    return NextResponse.json({ error: 'Unable to verify administrator access.' }, { status: 500 });
  }

  if (!admin) {
    return NextResponse.json({ error: 'Your account is not authorized for the JALSA admin console.' }, { status: 403 });
  }

  return {
    user: {
      id: userData.user.id,
      email: userData.user.email,
    },
    role: admin.role,
    full_name: admin.full_name,
  };
}

export function isAuthResponse(value: AuthenticatedAdmin | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}


export function requireRole(
  admin: AuthenticatedAdmin,
  allowedRoles: AuthenticatedAdmin['role'][]
) {
  if (!allowedRoles.includes(admin.role)) {
    return NextResponse.json(
      { error: 'You do not have permission to perform this action.' },
      { status: 403 }
    );
  }

  return null;
}
