export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type QrStatus = 'NOT_GENERATED' | 'ACTIVE' | 'USED' | 'REVOKED';
export type EntryStatus = 'NOT_ENTERED' | 'ENTERED';
export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'SCANNER';

export interface Registration {
  id: string;
  registration_id: string; // e.g. "JALSA26-0001"
  seq_num?: number;
  full_name: string;
  email: string;
  phone: string;
  usn: string;
  department: string;
  semester: string;
  section: string;
  dandiya_sticks: string;
  fee_amount: number;
  payment_transaction_id: string;
  payment_screenshot_path: string;
  payment_screenshot_url?: string;
  payment_status: PaymentStatus;
  verification_note?: string;
  verified_by?: string;
  verified_at?: string;
  qr_token?: string;
  qr_generated_at?: string;
  qr_status: QrStatus;
  entry_status: EntryStatus;
  entry_time?: string;
  entry_gate?: string;
  scanner_id?: string;
  created_at: string;
  updated_at: string;
}

export interface EventSettings {
  id: string;
  event_name: string;
  event_date: string;
  event_time: string;
  event_venue: string;
  event_description: string;
  registration_fee: number;
  registration_open: boolean;
  upi_id: string;
  payee_name: string;
  upi_qr_url: string;
  payment_instructions: string;
  departments: string[];
  semesters: string[];
  sections: string[];
  dandiya_options: string[];
  updated_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  registration_id?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface AnalyticsMatrixItem {
  department: string;
  semester: string;
  section: string;
  total: number;
  verified: number;
  entered: number;
  pending: number;
  rejected: number;
}
