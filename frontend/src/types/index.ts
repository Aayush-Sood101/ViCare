export type UserRole = 'patient' | 'doctor' | 'pending_doctor' | 'rejected_doctor' | 'admin';

export interface Patient {
  id: string;
  clerk_user_id: string;
  student_id: string;
  full_name: string;
  email: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  blood_group?: string;
  phone_number?: string;
  address?: string;
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  clerk_user_id: string;
  full_name: string;
  email: string;
  specialization?: string;
  qualification?: string;
  registration_number?: string;
  phone_number?: string;
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
  phone_number?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  token_number?: number;
  status: AppointmentStatus;
  reason?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: Doctor;
}

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
  treatment_plan?: string;
  notes?: string;
  vitals?: Vitals;
  follow_up_date?: string;
  created_at: string;
  patient?: Patient;
  doctor?: Doctor;
  appointment?: Appointment;
  prescriptions?: Prescription[];
}

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
  patient?: Patient;
  doctor?: Doctor;
  consultation?: Consultation;
}

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
  patient?: Patient;
  doctor?: Doctor;
}

export interface DoctorStats {
  today: {
    total: number;
    completed: number;
    pending: number;
    in_progress: number;
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
  weeklyAppointments?: Array<{ date: string; count: number }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
