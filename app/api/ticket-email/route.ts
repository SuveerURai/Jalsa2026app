import { NextRequest, NextResponse } from 'next/server';
import { getRegistrationByIdOrToken, getEventSettings } from '@/lib/db';
import { sendEmailNotification } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registrationId } = body;

    if (!registrationId) {
      return NextResponse.json({ error: 'registrationId is required.' }, { status: 400 });
    }

    const reg = await getRegistrationByIdOrToken(registrationId);
    if (!reg) {
      return NextResponse.json({ error: 'Registration not found.' }, { status: 404 });
    }

    const settings = await getEventSettings();
    await sendEmailNotification('PAYMENT_VERIFIED', reg, settings);

    return NextResponse.json({ success: true, message: `Ticket re-sent to ${reg.email}` });
  } catch (error: any) {
    console.error('Ticket email route error:', error);
    return NextResponse.json({ error: error.message || 'Failed to dispatch email.' }, { status: 500 });
  }
}
