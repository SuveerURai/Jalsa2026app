import { NextRequest, NextResponse } from 'next/server';
import { createRegistration, getEventSettings, getRegistrationByIdOrToken } from '@/lib/db';
import { sendEmailNotification } from '@/lib/email';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const fullName = formData.get('full_name')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim().toLowerCase() || '';
    const phone = formData.get('phone')?.toString().trim() || '';
    const usn = formData.get('usn')?.toString().trim().toUpperCase() || '';
    const department = formData.get('department')?.toString().trim() || '';
    const semester = formData.get('semester')?.toString().trim() || '';
    const section = formData.get('section')?.toString().trim() || '';
    const dandiyaSticks = formData.get('dandiya_sticks')?.toString().trim() || '';
    const transactionId = formData.get('payment_transaction_id')?.toString().trim() || '';
    const screenshotFile = formData.get('payment_screenshot') as File | null;

    // 1. Server-side validation
    if (!fullName || !email || !phone || !usn || !department || !semester || !section || !dandiyaSticks || !transactionId) {
      return NextResponse.json({ error: 'All registration and payment fields are required.' }, { status: 400 });
    }

    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (phone.length < 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit phone number.' }, { status: 400 });
    }

    // 2. Process screenshot upload
    let screenshotPath = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80';

    if (screenshotFile && screenshotFile.size > 0) {
      // Validate file size (max 5MB)
      if (screenshotFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Payment screenshot file size must be less than 5MB.' }, { status: 400 });
      }

      if (isSupabaseConfigured()) {
        try {
          const fileExt = screenshotFile.name.split('.').pop() || 'png';
          const fileName = `${usn}_${Date.now()}.${fileExt}`;

          const arrayBuffer = await screenshotFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const { data, error } = await supabaseAdmin.storage
            .from('payment-screenshots')
            .upload(fileName, buffer, {
              contentType: screenshotFile.type || 'image/png',
              upsert: true
            });

          if (!error && data) {
            screenshotPath = data.path;
          }
        } catch (e) {
          console.error('Supabase screenshot upload error:', e);
        }
      }
    }

    // 3. Create Registration
    const settings = await getEventSettings();
    const registration = await createRegistration({
      full_name: fullName,
      email,
      phone,
      usn,
      department,
      semester,
      section,
      dandiya_sticks: dandiyaSticks,
      fee_amount: settings.registration_fee,
      payment_transaction_id: transactionId,
      payment_screenshot_path: screenshotPath
    });

    // 4. Send Confirmation Email (Async)
    try {
      await sendEmailNotification('REGISTRATION_RECEIVED', registration, settings);
    } catch (e) {
      console.error('Email error:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Registration submitted successfully.',
      registration
    });

  } catch (error: any) {
    console.error('Registration route error:', error);
    return NextResponse.json({ error: error.message || 'Server error occurred during registration.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || searchParams.get('id') || '';

    if (!query) {
      return NextResponse.json({ error: 'Query or ID is required.' }, { status: 400 });
    }

    const reg = await getRegistrationByIdOrToken(query);
    if (!reg) {
      return NextResponse.json({ error: 'Registration not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, registration: reg });
  } catch (error: any) {
    console.error('GET registration error:', error);
    return NextResponse.json({ error: error.message || 'Server error.' }, { status: 500 });
  }
}
