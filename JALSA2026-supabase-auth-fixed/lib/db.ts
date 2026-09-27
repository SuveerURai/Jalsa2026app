import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import { Registration, EventSettings, AuditLog, AnalyticsMatrixItem, PaymentStatus, QrStatus, EntryStatus } from './types';
import crypto from 'crypto';

// Default Event Settings
const DEFAULT_SETTINGS: EventSettings = {
  id: 'main',
  event_name: 'JALSA 2026',
  event_date: 'October 18, 2026',
  event_time: '5:00 PM onwards',
  event_venue: 'Canteen Ground',
  event_description: 'The flagship annual college cultural mega festival & Dandiya Night of 2026.',
  registration_fee: 200,
  registration_open: true,
  upi_id: 'jalsa2026@upi',
  payee_name: 'JALSA 2026 Organizing Committee',
  upi_qr_url: '',
  payment_instructions: 'Scan the UPI QR code using GPay, PhonePe, Paytm, or any UPI app. Pay ₹199 and enter the 12-digit Transaction ID / UTR and upload the payment screenshot.',
  departments: [
    'Computer Science & Eng (CSE)',
    'Information Science (ISE)',
    'Electronics & Comm (ECE)',
    'Electrical & Electronics (EEE)',
    'Mechanical Eng (ME)',
    'Civil Eng (CIVIL)',
    'Artificial Intelligence (AIML)',
    'Data Science (AIDS)'
  ],
  semesters: [
    '1st Sem',
    '2nd Sem',
    '3rd Sem',
    '4th Sem',
    '5th Sem',
    '6th Sem',
    '7th Sem',
    '8th Sem'
  ],
  sections: ['Section A', 'Section B', 'Section C', 'Section D', 'Section E'],
  dandiya_options: ['Required (Provided at venue)', 'Not Required (Bringing own sticks)'],
  updated_at: new Date().toISOString()
};

// In-Memory Storage for fallback/testing mode
let memoryRegistrations: Registration[] = [
  {
    id: 'demo-reg-1',
    registration_id: 'JALSA26-0001',
    full_name: 'Rohan Sharma',
    email: 'rohan.sharma@example.com',
    phone: '9876543210',
    usn: '1RV22CS101',
    department: 'Computer Science & Eng (CSE)',
    semester: '5th Sem',
    section: 'Section A',
    dandiya_sticks: 'Required (Provided at venue)',
    fee_amount: 200,
    payment_transaction_id: 'UTR98237410928',
    payment_screenshot_path: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    payment_status: 'VERIFIED',
    verified_by: 'Admin (System)',
    verified_at: new Date(Date.now() - 86400000).toISOString(),
    qr_token: 'JALSA26:VERIFIED-TOKEN-0001-DEMO',
    qr_generated_at: new Date(Date.now() - 86400000).toISOString(),
    qr_status: 'ACTIVE',
    entry_status: 'NOT_ENTERED',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'demo-reg-2',
    registration_id: 'JALSA26-0002',
    full_name: 'Ananya Rao',
    email: 'ananya.rao@example.com',
    phone: '9876543211',
    usn: '1RV22IS045',
    department: 'Information Science (ISE)',
    semester: '5th Sem',
    section: 'Section B',
    dandiya_sticks: 'Not Required (Bringing own sticks)',
    fee_amount: 200,
    payment_transaction_id: 'UTR88192301923',
    payment_screenshot_path: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    payment_status: 'PENDING',
    qr_status: 'NOT_GENERATED',
    entry_status: 'NOT_ENTERED',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

let memorySettings: EventSettings = { ...DEFAULT_SETTINGS };
let memoryAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    admin_id: 'system',
    admin_email: 'admin@jalsa2026.com',
    action: 'SYSTEM_INIT',
    details: { note: 'Initial event database initialized.' },
    timestamp: new Date().toISOString()
  }
];
let memorySeqCounter = memoryRegistrations.length + 1;

// Helper: Secure Random QR Token Generator
export const generateSecureQrToken = (): string => {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `JALSA26:${randomBytes}`;
};

// 1. GET EVENT SETTINGS
export const getEventSettings = async (): Promise<EventSettings> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from('event_settings')
        .select('*')
        .eq('id', 'main')
        .single();
      if (!error && data) return data as EventSettings;
    } catch (e) {
      console.error('Supabase fetch settings error:', e);
    }
  }
  return memorySettings;
};

// 2. UPDATE EVENT SETTINGS
export const updateEventSettings = async (settings: Partial<EventSettings>, adminEmail: string = 'admin@jalsa2026.com'): Promise<EventSettings> => {
  const updated = { ...memorySettings, ...settings, updated_at: new Date().toISOString() };
  memorySettings = updated;

  if (isSupabaseConfigured()) {
    try {
      await supabaseAdmin
        .from('event_settings')
        .upsert(updated);
    } catch (e) {
      console.error('Supabase update settings error:', e);
    }
  }

  await createAuditLog({
    admin_id: 'admin',
    admin_email: adminEmail,
    action: 'SETTINGS_UPDATED',
    details: settings
  });

  return updated;
};

// 3. CHECK DUPLICATE REGISTRATION
export const checkDuplicateRegistration = async (usn: string, email: string, phone: string) => {
  const cleanUsn = usn.trim().toUpperCase();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabaseAdmin
        .from('registrations')
        .select('registration_id, usn, email, phone, payment_status')
        .or(`usn.ilike.${cleanUsn},email.ilike.${cleanEmail},phone.eq.${cleanPhone}`)
        .in('payment_status', ['PENDING', 'VERIFIED']);

      if (data && data.length > 0) {
        const existing = data[0];
        if (existing.usn.toUpperCase() === cleanUsn) {
          return { isDuplicate: true, field: 'USN', registration_id: existing.registration_id };
        }
        if (existing.email.toLowerCase() === cleanEmail) {
          return { isDuplicate: true, field: 'Email Address', registration_id: existing.registration_id };
        }
        if (existing.phone === cleanPhone) {
          return { isDuplicate: true, field: 'Phone Number', registration_id: existing.registration_id };
        }
      }
    } catch (e) {
      console.error('Supabase check duplicate error:', e);
    }
  }

  // Fallback to memory check
  const existing = memoryRegistrations.find(
    (r) =>
      ['PENDING', 'VERIFIED'].includes(r.payment_status) &&
      (r.usn.toUpperCase() === cleanUsn ||
        r.email.toLowerCase() === cleanEmail ||
        r.phone === cleanPhone)
  );

  if (existing) {
    let field = 'USN';
    if (existing.email.toLowerCase() === cleanEmail) field = 'Email Address';
    if (existing.phone === cleanPhone) field = 'Phone Number';
    return { isDuplicate: true, field, registration_id: existing.registration_id };
  }

  return { isDuplicate: false };
};

// 4. CREATE REGISTRATION
export const createRegistration = async (
  payload: Omit<Registration, 'id' | 'registration_id' | 'payment_status' | 'qr_status' | 'entry_status' | 'created_at' | 'updated_at'>
): Promise<Registration> => {
  const settings = await getEventSettings();
  if (!settings.registration_open) {
    throw new Error('Registration is currently closed for JALSA 2026.');
  }

  const dupCheck = await checkDuplicateRegistration(payload.usn, payload.email, payload.phone);
  if (dupCheck.isDuplicate) {
    throw new Error(`A registration with this ${dupCheck.field} already exists (ID: ${dupCheck.registration_id}). Check status on the status lookup page.`);
  }

  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from('registrations')
        .insert({
          full_name: payload.full_name,
          email: payload.email,
          phone: payload.phone,
          usn: payload.usn.toUpperCase(),
          department: payload.department,
          semester: payload.semester,
          section: payload.section,
          dandiya_sticks: payload.dandiya_sticks,
          fee_amount: payload.fee_amount || settings.registration_fee,
          payment_transaction_id: payload.payment_transaction_id,
          payment_screenshot_path: payload.payment_screenshot_path,
          payment_status: 'PENDING',
          qr_status: 'NOT_GENERATED',
          entry_status: 'NOT_ENTERED',
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase create registration error:', error);
        throw new Error(`Database registration failed: ${error.message}`);
      }

      if (data) {
        return data as Registration;
      }

      throw new Error('Database registration failed: Supabase returned no registration record.');
    } catch (e) {
      console.error('Supabase create registration error:', e);
      if (e instanceof Error) throw e;
      throw new Error('Database registration failed.');
    }
  }

  throw new Error('Supabase is not configured on the server. Check .env.local and restart Next.js.');

  // Unreachable: Supabase must be configured for real registrations.

};

// 5. GET REGISTRATION BY ID OR TOKEN OR EMAIL
export const getRegistrationByIdOrToken = async (query: string): Promise<Registration | null> => {
  const cleanQuery = query.trim().toUpperCase();
  const cleanEmail = query.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .or(`registration_id.ilike.${cleanQuery},qr_token.eq.${query.trim()},email.ilike.${cleanEmail},usn.ilike.${cleanQuery}`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) return data[0] as Registration;
    } catch (e) {
      console.error('Supabase get registration error:', e);
    }
  }

  const found = memoryRegistrations.find(
    (r) =>
      r.registration_id.toUpperCase() === cleanQuery ||
      r.qr_token === query.trim() ||
      r.email.toLowerCase() === cleanEmail ||
      r.usn.toUpperCase() === cleanQuery
  );

  return found || null;
};

// 6. LIST ALL REGISTRATIONS WITH SEARCH, FILTERS & PAGINATION
export const listRegistrations = async (options: {
  search?: string;
  department?: string;
  semester?: string;
  section?: string;
  paymentStatus?: string;
  entryStatus?: string;
  dandiyaSticks?: string;
  page?: number;
  limit?: number;
}) => {
  const page = options.page || 1;
  const limit = options.limit || 50;

  if (isSupabaseConfigured()) {
    try {
      let query = supabaseAdmin.from('registrations').select('*', { count: 'exact' });

      if (options.search) {
        const s = `%${options.search.trim()}%`;
        query = query.or(`registration_id.ilike.${s},full_name.ilike.${s},usn.ilike.${s},email.ilike.${s},phone.ilike.${s},payment_transaction_id.ilike.${s}`);
      }
      if (options.department && options.department !== 'ALL') query = query.eq('department', options.department);
      if (options.semester && options.semester !== 'ALL') query = query.eq('semester', options.semester);
      if (options.section && options.section !== 'ALL') query = query.eq('section', options.section);
      if (options.paymentStatus && options.paymentStatus !== 'ALL') query = query.eq('payment_status', options.paymentStatus);
      if (options.entryStatus && options.entryStatus !== 'ALL') query = query.eq('entry_status', options.entryStatus);
      if (options.dandiyaSticks && options.dandiyaSticks !== 'ALL') query = query.eq('dandiya_sticks', options.dandiyaSticks);

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);

      if (!error && data) {
        return { data: data as Registration[], total: count || 0, page, limit };
      }
    } catch (e) {
      console.error('Supabase list registrations error:', e);
    }
  }

  // Memory filtering
  let filtered = [...memoryRegistrations];

  if (options.search) {
    const s = options.search.toLowerCase().trim();
    filtered = filtered.filter(
      (r) =>
        r.registration_id.toLowerCase().includes(s) ||
        r.full_name.toLowerCase().includes(s) ||
        r.usn.toLowerCase().includes(s) ||
        r.email.toLowerCase().includes(s) ||
        r.phone.includes(s) ||
        r.payment_transaction_id.toLowerCase().includes(s)
    );
  }

  if (options.department && options.department !== 'ALL') filtered = filtered.filter((r) => r.department === options.department);
  if (options.semester && options.semester !== 'ALL') filtered = filtered.filter((r) => r.semester === options.semester);
  if (options.section && options.section !== 'ALL') filtered = filtered.filter((r) => r.section === options.section);
  if (options.paymentStatus && options.paymentStatus !== 'ALL') filtered = filtered.filter((r) => r.payment_status === options.paymentStatus);
  if (options.entryStatus && options.entryStatus !== 'ALL') filtered = filtered.filter((r) => r.entry_status === options.entryStatus);
  if (options.dandiyaSticks && options.dandiyaSticks !== 'ALL') filtered = filtered.filter((r) => r.dandiya_sticks === options.dandiyaSticks);

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return { data: paginated, total, page, limit };
};

// 7. VERIFY PAYMENT (APPROVE OR REJECT)
export const verifyPayment = async (
  registrationId: string,
  action: 'VERIFY' | 'REJECT',
  adminEmail: string = 'admin@jalsa2026.com',
  note: string = ''
): Promise<Registration> => {
  const reg = await getRegistrationByIdOrToken(registrationId);
  if (!reg) throw new Error('Registration not found.');

  const now = new Date().toISOString();
  let updatedFields: Partial<Registration> = {};

  if (action === 'VERIFY') {
    const qrToken = generateSecureQrToken();
    updatedFields = {
      payment_status: 'VERIFIED',
      verified_by: adminEmail,
      verified_at: now,
      verification_note: note || 'Payment verified by admin.',
      qr_token: qrToken,
      qr_generated_at: now,
      qr_status: 'ACTIVE',
      updated_at: now
    };
  } else {
    updatedFields = {
      payment_status: 'REJECTED',
      verified_by: adminEmail,
      verified_at: now,
      verification_note: note || 'Payment screenshot or transaction ID invalid.',
      qr_status: 'NOT_GENERATED',
      updated_at: now
    };
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseAdmin
        .from('registrations')
        .update(updatedFields)
        .eq('registration_id', reg.registration_id)
        .select()
        .single();
      if (!error && data) {
        // Update memory cache
        const idx = memoryRegistrations.findIndex((r) => r.registration_id === reg.registration_id);
        if (idx !== -1) memoryRegistrations[idx] = data as Registration;

        await createAuditLog({
          admin_id: 'admin',
          admin_email: adminEmail,
          action: action === 'VERIFY' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
          registration_id: reg.registration_id,
          details: { note, qr_token: data.qr_token }
        });

        return data as Registration;
      }
    } catch (e) {
      console.error('Supabase verify payment error:', e);
    }
  }

  // Memory fallback
  const idx = memoryRegistrations.findIndex((r) => r.registration_id === reg.registration_id);
  if (idx !== -1) {
    memoryRegistrations[idx] = { ...memoryRegistrations[idx], ...updatedFields };
  }

  await createAuditLog({
    admin_id: 'admin',
    admin_email: adminEmail,
    action: action === 'VERIFY' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
    registration_id: reg.registration_id,
    details: { note, updatedFields }
  });

  return memoryRegistrations[idx];
};

// 8. ATOMIC QR SCAN RECORD ENTRY
export const recordQrEntry = async (
  qrToken: string,
  gate: string = 'Main Gate',
  scannerId: string = 'Scanner-Volunteer'
) => {
  const cleanToken = qrToken.trim();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabaseAdmin.rpc('record_qr_entry', {
        p_qr_token: cleanToken,
        p_gate: gate,
        p_scanner_id: scannerId
      });

      if (!error && data) {
        // Normalize the RPC response so the scanner UI always receives
        // the complete registration object for both approved and
        // already-entered scans.
        if ((data as any).registration) return data;

        if ((data as any).code === 'ALREADY_ENTERED') {
          const { data: existing, error: lookupError } = await supabaseAdmin
            .from('registrations')
            .select('*')
            .eq('qr_token', cleanToken)
            .maybeSingle();

          if (!lookupError && existing) {
            return {
              ...(data as any),
              registration: existing
            };
          }
        }

        return data;
      }

      if (error) {
        console.error('Supabase RPC record_qr_entry error:', error);
        throw new Error(`QR scan database error: ${error.message}`);
      }
    } catch (e) {
      console.error('Supabase RPC record_qr_entry error:', e);
      if (e instanceof Error) throw e;
      throw new Error('QR scan database error.');
    }
  }

  // Memory Atomic Fallback implementation
  const reg = memoryRegistrations.find((r) => r.qr_token === cleanToken);

  if (!reg) {
    return {
      success: false,
      code: 'INVALID_QR',
      message: 'Invalid QR Code. No registration found.'
    };
  }

  if (reg.payment_status !== 'VERIFIED') {
    return {
      success: false,
      code: 'UNVERIFIED_PAYMENT',
      message: 'Payment has not been verified for this registration.',
      registration: reg
    };
  }

  if (reg.qr_status === 'REVOKED') {
    return {
      success: false,
      code: 'TICKET_REVOKED',
      message: 'This ticket has been revoked by event organizers.',
      registration: reg
    };
  }

  if (reg.entry_status === 'ENTERED') {
    return {
      success: false,
      code: 'ALREADY_ENTERED',
      message: 'Participant has already entered the venue.',
      entry_time: reg.entry_time,
      entry_gate: reg.entry_gate,
      scanner_id: reg.scanner_id,
      registration: reg
    };
  }

  // Mark entry
  const now = new Date().toISOString();
  reg.entry_status = 'ENTERED';
  reg.entry_time = now;
  reg.entry_gate = gate;
  reg.scanner_id = scannerId;
  reg.qr_status = 'USED';
  reg.updated_at = now;

  await createAuditLog({
    admin_id: scannerId,
    admin_email: scannerId,
    action: 'ENTRY_RECORDED',
    registration_id: reg.registration_id,
    details: { gate, entry_time: now }
  });

  return {
    success: true,
    code: 'ENTRY_APPROVED',
    message: 'Entry Approved!',
    registration: reg
  };
};

// 9. REGENERATE OR REVOKE QR CODE
export const manageRegistrationQr = async (
  registrationId: string,
  action: 'REGENERATE' | 'REVOKE' | 'MANUAL_ENTRY',
  adminEmail: string = 'admin@jalsa2026.com',
  reason: string = ''
) => {
  const reg = await getRegistrationByIdOrToken(registrationId);
  if (!reg) throw new Error('Registration not found.');

  const now = new Date().toISOString();
  let updates: Partial<Registration> = {};

  if (action === 'REGENERATE') {
    updates = {
      qr_token: generateSecureQrToken(),
      qr_generated_at: now,
      qr_status: 'ACTIVE',
      updated_at: now
    };
  } else if (action === 'REVOKE') {
    updates = {
      qr_status: 'REVOKED',
      verification_note: `Ticket revoked by admin: ${reason}`,
      updated_at: now
    };
  } else if (action === 'MANUAL_ENTRY') {
    updates = {
      entry_status: 'ENTERED',
      entry_time: now,
      entry_gate: 'Manual Admin Override',
      scanner_id: adminEmail,
      qr_status: 'USED',
      updated_at: now
    };
  }

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabaseAdmin
        .from('registrations')
        .update(updates)
        .eq('registration_id', reg.registration_id)
        .select()
        .single();

      if (data) {
        const idx = memoryRegistrations.findIndex((r) => r.registration_id === reg.registration_id);
        if (idx !== -1) memoryRegistrations[idx] = data as Registration;
      }
    } catch (e) {
      console.error('Supabase manage QR error:', e);
    }
  }

  const idx = memoryRegistrations.findIndex((r) => r.registration_id === reg.registration_id);
  if (idx !== -1) memoryRegistrations[idx] = { ...memoryRegistrations[idx], ...updates };

  await createAuditLog({
    admin_id: 'admin',
    admin_email: adminEmail,
    action: `QR_${action}`,
    registration_id: reg.registration_id,
    details: { reason, updates }
  });

  return memoryRegistrations[idx];
};

// 10. GET AUDIT LOGS
export const createAuditLog = async (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
  const entry: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ...log,
    timestamp: new Date().toISOString()
  };
  memoryAuditLogs.unshift(entry);

  if (isSupabaseConfigured()) {
    try {
      await supabaseAdmin.from('audit_logs').insert(entry);
    } catch (e) {
      console.error('Supabase audit log error:', e);
    }
  }

  return entry;
};

export const getAuditLogs = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabaseAdmin
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (data) return data as AuditLog[];
    } catch (e) {
      console.error('Supabase fetch audit logs error:', e);
    }
  }
  return memoryAuditLogs;
};

// 11. GET DASHBOARD METRICS & ANALYTICS MATRIX
export const getDashboardStats = async () => {
  let list: Registration[] = memoryRegistrations;

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabaseAdmin.from('registrations').select('*');
      if (data) list = data as Registration[];
    } catch (e) {
      console.error('Supabase fetch stats error:', e);
    }
  }

  const total = list.length;
  const verified = list.filter((r) => r.payment_status === 'VERIFIED').length;
  const pending = list.filter((r) => r.payment_status === 'PENDING').length;
  const rejected = list.filter((r) => r.payment_status === 'REJECTED').length;
  const entered = list.filter((r) => r.entry_status === 'ENTERED').length;
  const remaining = Math.max(0, verified - entered);

  const totalExpectedRevenue = total * 200;
  const totalVerifiedRevenue = verified * 200;

  const dandiyaRequired = list.filter((r) => r.dandiya_sticks.toLowerCase().includes('required')).length;
  const dandiyaNotRequired = list.filter((r) => r.dandiya_sticks.toLowerCase().includes('not')).length;

  return {
    total,
    verified,
    pending,
    rejected,
    entered,
    remaining,
    totalExpectedRevenue,
    totalVerifiedRevenue,
    dandiyaRequired,
    dandiyaNotRequired
  };
};

// 12. GET ANALYTICS MATRIX (DEPT x SEMESTER x SECTION)
export const getAnalyticsMatrix = async (): Promise<AnalyticsMatrixItem[]> => {
  let list: Registration[] = memoryRegistrations;

  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabaseAdmin.from('registrations').select('*');
      if (data) list = data as Registration[];
    } catch (e) {
      console.error('Supabase fetch matrix error:', e);
    }
  }

  const map = new Map<string, AnalyticsMatrixItem>();

  list.forEach((r) => {
    const key = `${r.department}__${r.semester}__${r.section}`;
    if (!map.has(key)) {
      map.set(key, {
        department: r.department,
        semester: r.semester,
        section: r.section,
        total: 0,
        verified: 0,
        entered: 0,
        pending: 0,
        rejected: 0
      });
    }
    const item = map.get(key)!;
    item.total += 1;
    if (r.payment_status === 'VERIFIED') item.verified += 1;
    if (r.payment_status === 'PENDING') item.pending += 1;
    if (r.payment_status === 'REJECTED') item.rejected += 1;
    if (r.entry_status === 'ENTERED') item.entered += 1;
  });

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
};
