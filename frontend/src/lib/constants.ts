export const APP_NAME = 'ViCare';
export const APP_DESCRIPTION = 'University Campus Healthcare Platform';

export const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
] as const;

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const;

export const APPOINTMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmed', color: 'green' },
  { value: 'in_progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'gray' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
] as const;

export const APPROVAL_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
] as const;

export const SPECIALIZATIONS = [
  'General Medicine',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
  'ENT',
  'Ophthalmology',
  'Psychiatry',
  'Gynecology',
  'Cardiology',
  'Neurology',
] as const;

export const MEDICINE_FREQUENCIES = [
  'Once daily (OD)',
  'Twice daily (BD)',
  'Three times daily (TDS)',
  'Four times daily (QDS)',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'As needed (SOS)',
  'Before meals',
  'After meals',
  'At bedtime',
] as const;

export const ROUTES = {
  public: {
    home: '/',
    signIn: '/sign-in',
    signUp: '/sign-up',
  },
  patient: {
    dashboard: '/patient/dashboard',
    appointments: '/patient/appointments',
    bookAppointment: '/patient/appointments/book',
    healthProfile: '/patient/health-profile',
    prescriptions: '/patient/prescriptions',
    certificates: '/patient/certificates',
  },
  doctor: {
    dashboard: '/doctor/dashboard',
    queue: '/doctor/queue',
    consultation: (id: string) => `/doctor/consultation/${id}`,
    pending: '/doctor/pending',
    rejected: '/doctor/rejected',
  },
  admin: {
    dashboard: '/admin/dashboard',
    approvals: '/admin/approvals',
    doctors: '/admin/doctors',
    patients: '/admin/patients',
    analytics: '/admin/analytics',
  },
} as const;
