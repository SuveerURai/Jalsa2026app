import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthResponse, requireRole } from '@/lib/admin-auth';
import { verifyPayment, getEventSettings } from '@/lib/db';
import { sendEmailNotification } from '@/lib/email';

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (isAuthResponse(admin)) return admin;

  const forbidden = requireRole(admin, ['SUPER_ADMIN', 'ADMIN']);
  if (forbidden) return forbidden;

  try {
    const body = await req.json();
    const { registrationId, action, note } = body;
    const adminEmail = admin.user.email || 'unknown-admin';

    if (!registrationId || !['VERIFY', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Valid registrationId and action (VERIFY/REJECT) are required.' }, { status: 400 });
    }

    const updatedRegistration = await verifyPayment(
      registrationId,
      action as 'VERIFY' | 'REJECT',
      adminEmail,
      note || ''
    );

    const settings = await getEventSettings();

    // Send the transactional email after the database status has been updated.
    // Payment verification is retained even if the external email provider fails.
    let emailSent = false;
    let emailError = '';

    try {
      const result = await sendEmailNotification(
        action === 'VERIFY' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
        updatedRegistration,
        settings
      );
      emailSent = result.success === true;
    } catch (e) {
      emailError = e instanceof Error ? e.message : 'Email delivery failed.';
      console.error('Email error during verification (verification retained):', e);
    }

    return NextResponse.json({
      success: true,
      message: action === 'VERIFY' ? 'Payment verified & QR ticket activated.' : 'Payment rejected.',
      registration: updatedRegistration,
      email: { sent: emailSent, error: emailError || undefined }
    });

  } catch (error: any) {
    console.error('Verify payment route error:', error);
    return NextResponse.json({ error: error.message || 'Server error occurred.' }, { status: 500 });
  }
}
