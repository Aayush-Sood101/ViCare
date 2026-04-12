import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let clerkGetToken: (() => Promise<string | null>) | null = null;

export function registerClerkTokenGetter(fn: (() => Promise<string | null>) | null) {
  clerkGetToken = fn;
}

api.interceptors.request.use(async (config) => {
  if (clerkGetToken) {
    try {
      const token = await clerkGetToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      /* ignore */
    }
  }
  return config;
});

/** Legacy: optional manual token (interceptor usually supplies JWT). */
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Auth — body matches Express backend (camelCase), not API_REFERENCE snake_case
export const authApi = {
  completeSignup: (data: {
    userType: 'patient' | 'doctor';
    studentId?: string;
    specialization?: string;
    qualification?: string;
    registrationNumber?: string;
    phone?: string;
  }) => api.post('/api/auth/complete-signup', data),

  getStatus: () => api.get('/api/auth/status'),
};

// Patients
export const patientsApi = {
  getMe: () => api.get('/api/patients/me'),
  updateMe: (data: {
    phone?: string;
    address?: string;
    date_of_birth?: string;
    gender?: 'male' | 'female' | 'other';
    blood_group?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
  }) => api.put('/api/patients/me', data),
  getById: (id: string) => api.get(`/api/patients/${id}`),
  getHistory: (id: string) => api.get(`/api/patients/${id}/history`),
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/api/patients', { params }),
};

// Doctors
export const doctorsApi = {
  list: (params?: { specialization?: string }) => api.get('/api/doctors', { params }),
  getMe: () => api.get('/api/doctors/me'),
  updateMe: (data: { phone?: string; specialization?: string; qualification?: string }) =>
    api.put('/api/doctors/me', data),
  getById: (id: string) => api.get(`/api/doctors/${id}`),
  getStats: () => api.get('/api/doctors/me/stats'),
};

// Appointments — backend uses scheduled_at + reason_for_visit
export const appointmentsApi = {
  create: (data: {
    doctor_id: string;
    scheduled_at: string;
    reason_for_visit?: string;
  }) => api.post('/api/appointments', data),

  list: (params?: { status?: string; date?: string }) =>
    api.get('/api/appointments', { params }),

  getById: (id: string) => api.get(`/api/appointments/${id}`),

  updateStatus: (id: string, status: string) =>
    api.patch(`/api/appointments/${id}/status`, { status }),

  cancel: (id: string) => api.delete(`/api/appointments/${id}`),
};

// Consultations
export const consultationsApi = {
  create: (data: {
    appointment_id?: string;
    patient_id: string;
    chief_complaint?: string;
    diagnosis?: string;
    treatment_plan?: string;
    notes?: string;
    vitals?: {
      blood_pressure?: string;
      temperature?: string;
      pulse?: string;
      weight?: string;
      height?: string;
    };
    follow_up_date?: string;
  }) => api.post('/api/consultations', data),

  getByPatient: (patientId: string) =>
    api.get(`/api/consultations/patient/${patientId}`),

  getMe: () => api.get('/api/consultations/me'),

  getById: (id: string) => api.get(`/api/consultations/${id}`),
};

// Prescriptions
export const prescriptionsApi = {
  create: (data: {
    consultation_id?: string;
    patient_id: string;
    medicines: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
    instructions?: string;
  }) => api.post('/api/prescriptions', data),

  getByPatient: (patientId: string) =>
    api.get(`/api/prescriptions/patient/${patientId}`),

  getMe: () => api.get('/api/prescriptions/me'),

  getById: (id: string) => api.get(`/api/prescriptions/${id}`),

  getPdfUrl: (id: string) => api.get(`/api/prescriptions/${id}/pdf`),
};

// Certificates
export const certificatesApi = {
  create: (data: {
    consultation_id?: string;
    patient_id: string;
    reason: string;
    from_date: string;
    to_date: string;
    notes?: string;
  }) => api.post('/api/certificates', data),

  getByPatient: (patientId: string) =>
    api.get(`/api/certificates/patient/${patientId}`),

  getMe: () => api.get('/api/certificates/me'),

  getById: (id: string) => api.get(`/api/certificates/${id}`),

  getPdfUrl: (id: string) => api.get(`/api/certificates/${id}/pdf`),
};

// Admin
export const adminApi = {
  getApprovalRequests: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/api/admin/approval-requests', { params }),

  getApprovalRequestById: (id: string) =>
    api.get(`/api/admin/approval-requests/${id}`),

  processApproval: (id: string, action: 'approve' | 'reject', rejection_reason?: string) =>
    api.patch(`/api/admin/approval-requests/${id}`, { action, rejection_reason }),

  getDoctors: (params?: { is_active?: boolean; search?: string; specialization?: string; page?: number; limit?: number }) =>
    api.get('/api/admin/doctors', { params }),

  getDoctorById: (id: string) =>
    api.get(`/api/admin/doctors/${id}`),

  updateDoctor: (id: string, data: { is_active: boolean }) =>
    api.patch(`/api/admin/doctors/${id}`, data),

  analytics: {
    overview: () => api.get('/api/admin/analytics/overview'),
    visits: (days?: number) => api.get('/api/admin/analytics/visits', { params: { days } }),
    peakHours: (days?: number) => api.get('/api/admin/analytics/peak-hours', { params: { days } }),
    diagnoses: (limit?: number, days?: number) => api.get('/api/admin/analytics/diagnoses', { params: { limit, days } }),
    medicines: (limit?: number) => api.get('/api/admin/analytics/medicines', { params: { limit } }),
    demographics: () => api.get('/api/admin/analytics/demographics'),
  },
};
