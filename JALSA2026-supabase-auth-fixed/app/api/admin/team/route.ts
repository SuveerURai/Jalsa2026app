import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin, isAuthResponse, requireRole } from '@/lib/admin-auth';
import { createAuditLog } from '@/lib/db';

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'SCANNER'] as const;
type TeamRole = typeof ROLES[number];

async function findAuthUserByEmail(email: string) {
  let page = 1;
  while (page <= 20) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user = data.users.find((u) => (u.email || '').toLowerCase() === email);
    if (user) return user;
    if (data.users.length < 1000) break;
    page += 1;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (isAuthResponse(admin)) return admin;
  const forbidden = requireRole(admin, ['SUPER_ADMIN']);
  if (forbidden) return forbidden;

  const { data, error } = await supabaseAdmin
    .from('admin_roles')
    .select('id, user_id, email, full_name, role, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Team list error:', error);
    return NextResponse.json({ error: 'Failed to load team members.' }, { status: 500 });
  }
  return NextResponse.json({ team: data || [] });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (isAuthResponse(admin)) return admin;
  const forbidden = requireRole(admin, ['SUPER_ADMIN']);
  if (forbidden) return forbidden;

  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const fullName = String(body.full_name || '').trim();
    const role = String(body.role || '').toUpperCase() as TeamRole;

    if (!email || !fullName || !ROLES.includes(role)) {
      return NextResponse.json({ error: 'Email, full name and a valid role are required.' }, { status: 400 });
    }

    const authUser = await findAuthUserByEmail(email);
    if (!authUser) {
      return NextResponse.json({
        error: 'No Supabase Auth user exists for this email. Create the account in Supabase Authentication first.'
      }, { status: 404 });
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from('admin_roles').select('id').eq('user_id', authUser.id).maybeSingle();
    if (existingError) throw existingError;
    if (existing) return NextResponse.json({ error: 'This user is already in the admin team.' }, { status: 409 });

    const { data, error } = await supabaseAdmin
      .from('admin_roles')
      .insert({ user_id: authUser.id, email: authUser.email || email, full_name: fullName, role })
      .select('id, user_id, email, full_name, role, created_at').single();
    if (error) throw error;

    await createAuditLog({
      admin_id: admin.user.id,
      admin_email: admin.user.email || 'unknown-admin',
      action: 'ADMIN_TEAM_ADD',
      details: { target_user_id: authUser.id, target_email: authUser.email || email, target_name: fullName, role }
    });

    return NextResponse.json({ member: data }, { status: 201 });
  } catch (error: any) {
    console.error('Team add error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to add team member.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (isAuthResponse(admin)) return admin;
  const forbidden = requireRole(admin, ['SUPER_ADMIN']);
  if (forbidden) return forbidden;

  try {
    const body = await req.json();
    const id = String(body.id || '');
    const role = String(body.role || '').toUpperCase() as TeamRole;
    const fullName = body.full_name !== undefined ? String(body.full_name).trim() : undefined;
    if (!id || !ROLES.includes(role)) return NextResponse.json({ error: 'Member ID and valid role are required.' }, { status: 400 });

    const { data: target, error: targetError } = await supabaseAdmin
      .from('admin_roles').select('id, user_id, email, full_name, role').eq('id', id).maybeSingle();
    if (targetError) throw targetError;
    if (!target) return NextResponse.json({ error: 'Team member not found.' }, { status: 404 });
    if (target.user_id === admin.user.id && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'You cannot downgrade your own Super Admin account.' }, { status: 400 });
    }

    const updates: Record<string, string> = { role };
    if (fullName) updates.full_name = fullName;
    const { data, error } = await supabaseAdmin.from('admin_roles').update(updates).eq('id', id)
      .select('id, user_id, email, full_name, role, created_at').single();
    if (error) throw error;

    await createAuditLog({
      admin_id: admin.user.id,
      admin_email: admin.user.email || 'unknown-admin',
      action: 'ADMIN_TEAM_ROLE_CHANGE',
      details: { target_user_id: target.user_id, target_email: target.email, from_role: target.role, to_role: role }
    });
    return NextResponse.json({ member: data });
  } catch (error: any) {
    console.error('Team update error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update team member.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (isAuthResponse(admin)) return admin;
  const forbidden = requireRole(admin, ['SUPER_ADMIN']);
  if (forbidden) return forbidden;

  try {
    const body = await req.json();
    const id = String(body.id || '');
    if (!id) return NextResponse.json({ error: 'Member ID is required.' }, { status: 400 });

    const { data: target, error: targetError } = await supabaseAdmin
      .from('admin_roles').select('id, user_id, email, full_name, role').eq('id', id).maybeSingle();
    if (targetError) throw targetError;
    if (!target) return NextResponse.json({ error: 'Team member not found.' }, { status: 404 });
    if (target.user_id === admin.user.id) return NextResponse.json({ error: 'You cannot remove your own Super Admin account.' }, { status: 400 });

    const { error } = await supabaseAdmin.from('admin_roles').delete().eq('id', id);
    if (error) throw error;

    await createAuditLog({
      admin_id: admin.user.id,
      admin_email: admin.user.email || 'unknown-admin',
      action: 'ADMIN_TEAM_REMOVE',
      details: { target_user_id: target.user_id, target_email: target.email, target_name: target.full_name, previous_role: target.role }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Team delete error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to remove team member.' }, { status: 500 });
  }
}
