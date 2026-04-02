import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import { clerkAuthMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody } from '../utils/validation';
import { generateCertificatePDF } from '../services/pdfService';
import { uploadPDF, getSignedPDFUrl } from '../services/storageService';

const router = Router();
router.use(clerkAuthMiddleware);

// POST /api/certificates - Issue certificate (doctor)
// Note: PDF generation will be added in Phase 4
router.post('/', requireRole('doctor'), validateBody({
  consultation_id: { type: 'string' },
  patient_id: { required: true, type: 'string' },
  reason: { required: true, type: 'string' },
  from_date: { required: true, type: 'string' },
  to_date: { required: true, type: 'string' },
  notes: { type: 'string' },
}), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.auth!;
  const { consultation_id, patient_id, reason, from_date, to_date, notes } = req.body;

  // Validate dates
  const fromDate = new Date(from_date);
  const toDate = new Date(to_date);
  if (toDate < fromDate) {
    return res.status(400).json({ error: 'End date must be after start date' });
  }

  // Get doctor
  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  // Get patient
  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patient_id)
    .single();

  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  // Generate PDF
  const pdfBuffer = await generateCertificatePDF({
    patient,
    doctor,
    reason,
    fromDate,
    toDate,
    notes,
    issuedAt: new Date(),
  });

  // Upload to Supabase Storage
  const fileName = `certificate-${patient.id}-${Date.now()}`;
  const pdfPath = await uploadPDF(pdfBuffer, 'certificates', fileName);

  // Create certificate record
  const { data, error } = await supabase
    .from('medical_certificates')
    .insert({
      consultation_id,
      patient_id,
      doctor_id: doctor.id,
      reason,
      from_date,
      to_date,
      notes,
      pdf_url: pdfPath,
    })
    .select()
    .single();

  if (error) {
    console.error('Create certificate error:', error);
    return res.status(500).json({ error: 'Failed to create certificate' });
  }

  return res.status(201).json(data);
}));

// GET /api/certificates/patient/:patientId - Get patient's certificates
router.get('/patient/:patientId', requireRole('doctor', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  const { patientId } = req.params;

  const { data, error } = await supabase
    .from('medical_certificates')
    .select(`
      *,
      doctor:doctors(full_name, specialization)
    `)
    .eq('patient_id', patientId)
    .order('issued_at', { ascending: false });

  if (error) {
    console.error('Fetch certificates error:', error);
    return res.status(500).json({ error: 'Failed to fetch certificates' });
  }

  return res.json(data);
}));

// GET /api/certificates/me - Get own certificates (patient)
router.get('/me', requireRole('patient'), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.auth!;

  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const { data, error } = await supabase
    .from('medical_certificates')
    .select(`
      *,
      doctor:doctors(full_name, specialization)
    `)
    .eq('patient_id', patient.id)
    .order('issued_at', { ascending: false });

  if (error) {
    console.error('Fetch certificates error:', error);
    return res.status(500).json({ error: 'Failed to fetch certificates' });
  }

  return res.json(data);
}));

// GET /api/certificates/:id - Get single certificate
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role } = req.auth!;

  const { data, error } = await supabase
    .from('medical_certificates')
    .select(`
      *,
      doctor:doctors(full_name, specialization, qualification, registration_number),
      patient:patients(full_name, student_id)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Certificate not found' });
  }

  // Check access for patients
  if (role === 'patient') {
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (data.patient_id !== patient?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  return res.json(data);
}));

// GET /api/certificates/:id/pdf - Get signed PDF URL
// Note: This will be implemented in Phase 4 with actual PDF generation
router.get('/:id/pdf', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role } = req.auth!;

  const { data: certificate, error } = await supabase
    .from('medical_certificates')
    .select('pdf_url, patient_id')
    .eq('id', id)
    .single();

  if (error || !certificate) {
    return res.status(404).json({ error: 'Certificate not found' });
  }

  // Check access for patients
  if (role === 'patient') {
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (certificate.patient_id !== patient?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  if (!certificate.pdf_url) {
    return res.status(404).json({ 
      error: 'PDF not available'
    });
  }

  // Generate signed URL (expires in 1 hour)
  try {
    const signedUrl = await getSignedPDFUrl(certificate.pdf_url);
    return res.json({ 
      pdf_url: signedUrl,
      expires_in: 3600 // 1 hour in seconds
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return res.status(500).json({ error: 'Failed to generate PDF URL' });
  }
}));

export default router;
