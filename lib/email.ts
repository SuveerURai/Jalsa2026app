import { Registration, EventSettings } from './types';

const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || 'brevo').toLowerCase();
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'JALSA 2026 <onboarding@resend.dev>';
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || '';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'JALSA 2026';

export const sendEmailNotification = async (
  type: 'REGISTRATION_RECEIVED' | 'PAYMENT_VERIFIED' | 'PAYMENT_REJECTED',
  registration: Registration,
  settings: EventSettings,
  appUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
) => {
  const ticketUrl = `${appUrl}/ticket/${registration.registration_id}`;
  const statusUrl = `${appUrl}/registration/status?query=${registration.registration_id}`;

  let subject = '';
  let htmlContent = '';

  if (type === 'REGISTRATION_RECEIVED') {
    subject = `JALSA 2026 Registration Received — ${registration.registration_id}`;
    htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #0c0c0e; color: #ffffff; padding: 30px; max-width: 600px; margin: auto; border: 1px solid #27272a; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #f59e0b; font-size: 28px; margin: 0;">JALSA '26</h1>
          <p style="color: #a1a1aa; font-size: 14px; margin-top: 4px;">Annual Cultural & Dandiya Night</p>
        </div>
        <div style="background-color: #18181b; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <h2 style="color: #ffffff; margin-top: 0; font-size: 20px;">Registration Submitted</h2>
          <p>Hi <strong>${registration.full_name}</strong>,</p>
          <p>Your registration for JALSA 2026 has been received and is currently <strong>PENDING PAYMENT VERIFICATION</strong>.</p>
        </div>
        <div style="margin: 25px 0;">
          <table style="width: 100%; border-collapse: collapse; color: #d4d4d8;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #27272a;">Registration ID:</td><td style="text-align: right; font-weight: bold; color: #f59e0b;">${registration.registration_id}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #27272a;">USN / Student ID:</td><td style="text-align: right; font-weight: bold; color: #ffffff;">${registration.usn}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #27272a;">Department & Sem:</td><td style="text-align: right; color: #ffffff;">${registration.department} (${registration.semester})</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #27272a;">Transaction ID / UTR:</td><td style="text-align: right; color: #ffffff;">${registration.payment_transaction_id}</td></tr>
            <tr><td style="padding: 8px 0;">Amount Paid:</td><td style="text-align: right; color: #10b981; font-weight: bold;">₹${registration.fee_amount}</td></tr>
          </table>
        </div>
        <p style="color: #a1a1aa; font-size: 14px;">Once our team verifies your transaction screenshot, your official QR Ticket will be generated and emailed to you.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${statusUrl}" style="background-color: #f59e0b; color: #000000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Check Registration Status</a>
        </div>
      </div>
    `;
  } else if (type === 'PAYMENT_VERIFIED') {
    subject = `JALSA 2026 Registration Confirmed — ${registration.registration_id}`;
    htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #0c0c0e; color: #ffffff; padding: 30px; max-width: 600px; margin: auto; border: 1px solid #10b981; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #f59e0b; font-size: 28px; margin: 0;">JALSA '26</h1>
          <p style="color: #10b981; font-size: 14px; font-weight: bold; margin-top: 4px;">✓ OFFICIAL ENTRY TICKET</p>
        </div>
        <div style="background-color: #064e3b; padding: 20px; border-radius: 8px; text-align: center;">
          <h2 style="color: #34d399; margin: 0; font-size: 22px;">Payment Verified & Confirmed!</h2>
          <p style="color: #a7f3d0; margin-top: 6px;">Your spot for JALSA 2026 is secured.</p>
        </div>
        <div style="margin: 25px 0;">
          <p>Hi <strong>${registration.full_name}</strong>,</p>
          <p>Your payment (UTR: ${registration.payment_transaction_id}) has been verified. Present your digital QR ticket at the entry gate on event day.</p>
          <table style="width: 100%; border-collapse: collapse; color: #d4d4d8; margin-top: 15px;">
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #27272a;">Registration ID:</td><td style="text-align: right; font-weight: bold; color: #f59e0b;">${registration.registration_id}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #27272a;">Name:</td><td style="text-align: right; color: #ffffff;">${registration.full_name}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #27272a;">USN:</td><td style="text-align: right; color: #ffffff;">${registration.usn}</td></tr>
            <tr><td style="padding: 8px 0; border-bottom: 1px solid #27272a;">Date & Time:</td><td style="text-align: right; color: #ffffff;">${settings.event_date} (${settings.event_time})</td></tr>
            <tr><td style="padding: 8px 0;">Venue:</td><td style="text-align: right; color: #ffffff;">${settings.event_venue}</td></tr>
          </table>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${ticketUrl}" style="background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block; font-size: 16px;">View & Download Digital Ticket</a>
        </div>
      </div>
    `;
  } else if (type === 'PAYMENT_REJECTED') {
    subject = `JALSA 2026 Payment Verification Required — ${registration.registration_id}`;
    htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #0c0c0e; color: #ffffff; padding: 30px; max-width: 600px; margin: auto; border: 1px solid #ef4444; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #ef4444; font-size: 28px; margin: 0;">JALSA '26</h1>
          <p style="color: #fca5a5; font-size: 14px; margin-top: 4px;">Payment Verification Notice</p>
        </div>
        <div style="background-color: #7f1d1d; padding: 20px; border-radius: 8px;">
          <h2 style="color: #fca5a5; margin-top: 0; font-size: 20px;">Payment Action Required</h2>
          <p>Hi <strong>${registration.full_name}</strong>,</p>
          <p>We were unable to verify your payment for registration ID <strong>${registration.registration_id}</strong>.</p>
          <p style="color: #ffffff; background: #991b1b; padding: 10px; border-radius: 4px;"><strong>Reason:</strong> ${registration.verification_note || 'Transaction ID or screenshot could not be validated.'}</p>
        </div>
        <p style="color: #a1a1aa; font-size: 14px; margin-top: 20px;">Please check your registration status online or reach out to the organizing team with proof of payment to re-verify.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${statusUrl}" style="background-color: #ef4444; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">View Registration Status</a>
        </div>
      </div>
    `;
  }

  // Primary provider: Brevo REST API. This allows a verified sender address
  // such as a newly-created Gmail account without requiring a custom domain.
  if (EMAIL_PROVIDER === 'brevo') {
    if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
      throw new Error('Email is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL.');
    }

    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { email: BREVO_SENDER_EMAIL, name: BREVO_SENDER_NAME },
          to: [{ email: registration.email, name: registration.full_name }],
          subject,
          htmlContent
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Brevo API error:', errText);
        throw new Error(`Brevo email send failed (${res.status}).`);
      }

      const result = await res.json().catch(() => ({}));
      console.log(`Email successfully sent to ${registration.email} [Subject: ${subject}]`, result.messageId || '');
      return { success: true, provider: 'brevo', messageId: result.messageId };
    } catch (e) {
      console.error('Brevo email sending exception:', e);
      throw e instanceof Error ? e : new Error('Email sending failed.');
    }
  }

  // Optional Resend provider. Use this only with a verified custom domain
  // for production recipients; onboarding@resend.dev is restricted to testing.
  if (EMAIL_PROVIDER === 'resend') {
    if (!RESEND_API_KEY) {
      throw new Error('Email is not configured. Set RESEND_API_KEY.');
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [registration.email],
          subject,
          html: htmlContent
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Resend API error:', errText);
        throw new Error(`Resend email send failed (${res.status}).`);
      }

      const result = await res.json().catch(() => ({}));
      console.log(`Email successfully sent to ${registration.email} [Subject: ${subject}]`, result.id || '');
      return { success: true, provider: 'resend', messageId: result.id };
    } catch (e) {
      console.error('Resend email sending exception:', e);
      throw e instanceof Error ? e : new Error('Email sending failed.');
    }
  }

  throw new Error(`Unsupported EMAIL_PROVIDER: ${EMAIL_PROVIDER}`);
};
