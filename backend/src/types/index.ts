// ==================== USER ROLES ====================

export type UserRole = 'patient' | 'doctor' | 'pending_doctor' | 'rejected_doctor' | 'admin';

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

// ==================== PATIENT ====================

export interface Patient {
  id: string;
  clerk_user_id: string;
  student_id: string;
  full_name: string;
  email: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
}

// ==================== DOCTOR ====================

export interface Doctor {
  id: string;
  clerk_user_id: string;
  full_name: string;
  email: string;
  specialization?: string;
  qualification?: string;
  registration_number?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoctorApprovalRequest {
  id: string;
  clerk_user_id: string;
  full_name: string;
  email: string;
  specialization?: string;
  qualification?: string;
  registration_number?: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

// ==================== APPOINTMENT ====================

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  token_number?: number;
  status: AppointmentStatus;
  reason_for_visit?: string;
  created_at: string;
  updated_at: string;
}

// ==================== CONSULTATION ====================

export interface Vitals {
  blood_pressure?: string;
  temperature?: string;
  pulse?: string;
  weight?: string;
  height?: string;
}

export interface Consultation {
  id: string;
  appointment_id?: string;
  patient_id: string;
  doctor_id: string;
  chief_complaint?: string;
  diagnosis?: string;
  notes?: string;
  vitals?: Vitals;
  follow_up_date?: string;
  created_at: string;
}

// ==================== PRESCRIPTION ====================

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  consultation_id?: string;
  patient_id: string;
  doctor_id: string;
  medicines: Medicine[];
  instructions?: string;
  pdf_url?: string;
  issued_at: string;
}

// ==================== MEDICAL CERTIFICATE ====================

export interface MedicalCertificate {
  id: string;
  consultation_id?: string;
  patient_id: string;
  doctor_id: string;
  reason: string;
  from_date: string;
  to_date: string;
  notes?: string;
  pdf_url?: string;
  issued_at: string;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ==================== WEBHOOK TYPES ====================

export interface ClerkWebhookPayload {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string | null;
    last_name: string | null;
    unsafe_metadata?: {
      userType?: 'patient' | 'doctor';
      studentId?: string;
      specialization?: string;
      qualification?: string;
      registrationNumber?: string;
      phone?: string;
    };
  };
}

// ==================== STATS ====================

export interface DoctorStats {
  today: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
  };
}

export interface AdminAnalytics {
  totals: {
    patients: number;
    doctors: number;
    activeDoctors: number;
    pendingApprovals: number;
  };
  today: {
    appointments: number;
    consultations: number;
  };
}
