import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'ViCare API',
    version: '1.0.0',
    phase: 4,
    description: 'University Campus Healthcare Platform API',
    documentation: 'Complete backend implementation with Admin APIs and PDF generation',
    endpoints: {
      auth: {
        'POST /api/auth/complete-signup': 'Complete user registration (patient or doctor)',
        'GET /api/auth/status': 'Get current user status and role',
      },
      patients: {
        'GET /api/patients/me': 'Get own profile (patient)',
        'PUT /api/patients/me': 'Update own profile (patient)',
        'GET /api/patients/:id': 'Get patient by ID (doctor/admin)',
        'GET /api/patients': 'List all patients (admin)',
        'GET /api/patients/:id/history': 'Get patient consultation history (doctor/admin)',
      },
      doctors: {
        'GET /api/doctors': 'List active doctors (public)',
        'GET /api/doctors/me': 'Get own profile (doctor)',
        'PUT /api/doctors/me': 'Update own profile (doctor)',
        'GET /api/doctors/:id': 'Get doctor by ID (doctor/admin)',
        'GET /api/doctors/me/stats': 'Get daily stats (doctor)',
      },
      appointments: {
        'POST /api/appointments': 'Book appointment (patient)',
        'GET /api/appointments': 'Get appointments (role-based)',
        'GET /api/appointments/:id': 'Get single appointment',
        'PATCH /api/appointments/:id/status': 'Update status (doctor/admin)',
        'DELETE /api/appointments/:id': 'Cancel appointment (patient)',
      },
      consultations: {
        'POST /api/consultations': 'Create consultation (doctor)',
        'GET /api/consultations/patient/:id': 'Get patient consultations (doctor/admin)',
        'GET /api/consultations/me': 'Get own consultations (patient)',
        'GET /api/consultations/:id': 'Get single consultation',
      },
      prescriptions: {
        'POST /api/prescriptions': 'Create prescription with PDF (doctor)',
        'GET /api/prescriptions/patient/:id': 'Get patient prescriptions (doctor/admin)',
        'GET /api/prescriptions/me': 'Get own prescriptions (patient)',
        'GET /api/prescriptions/:id': 'Get single prescription',
        'GET /api/prescriptions/:id/pdf': 'Get prescription PDF signed URL',
      },
      certificates: {
        'POST /api/certificates': 'Issue certificate with PDF (doctor)',
        'GET /api/certificates/patient/:id': 'Get patient certificates (doctor/admin)',
        'GET /api/certificates/me': 'Get own certificates (patient)',
        'GET /api/certificates/:id': 'Get single certificate',
        'GET /api/certificates/:id/pdf': 'Get certificate PDF signed URL',
      },
      admin: {
        'GET /api/admin/approval-requests': 'List doctor approval requests (admin)',
        'GET /api/admin/approval-requests/:id': 'Get single approval request (admin)',
        'PATCH /api/admin/approval-requests/:id': 'Approve or reject doctor (admin)',
        'GET /api/admin/doctors': 'List all doctors with filters (admin)',
        'GET /api/admin/doctors/:id': 'Get doctor with stats (admin)',
        'PATCH /api/admin/doctors/:id': 'Update doctor status (admin)',
        'GET /api/admin/analytics/overview': 'Dashboard overview stats (admin)',
        'GET /api/admin/analytics/visits': 'Visit trends over time (admin)',
        'GET /api/admin/analytics/peak-hours': 'Peak consultation hours (admin)',
        'GET /api/admin/analytics/diagnoses': 'Common diagnoses (admin)',
        'GET /api/admin/analytics/medicines': 'Most prescribed medicines (admin)',
        'GET /api/admin/analytics/demographics': 'Patient demographics (admin)',
      },
      system: {
        'GET /health': 'Basic health check (public)',
        'GET /api/system/health/detailed': 'Detailed health check (admin)',
      },
    },
  });
});

export default router;
