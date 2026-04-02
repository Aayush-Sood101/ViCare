import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import { clerkAuthMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody } from '../utils/validation';
import { generatePrescriptionPDF } from '../services/pdfService';
import { uploadPDF, getSignedPDFUrl } from '../services/storageService';

const router = Router();
router.use(clerkAuthMiddleware);

// POST /api/prescriptions - Create prescription (doctor)
// Note: PDF generation will be added in Phase 4
router.post('/', requireRole('doctor'), validateBody({
  consultation_id: { type: 'string' },
  patient_id: { required: true, type: 'string' },
  medicines: { required: true, type: 'array' },
  instructions: { type: 'string' },
}), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.auth!;
  const { consultation_id, patient_id, medicines, instructions } = req.body;

  // Validate medicines array
  if (!Array.isArray(medicines) || medicines.length === 0) {
    return res.status(400).json({ error: 'Medicines must be a non-empty array' });
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
  const pdfBuffer = await generatePrescriptionPDF({
    patient,
    doctor,
    medicines,
    instructions,
    issuedAt: new Date(),
  });

  // Upload to Supabase Storage
  const fileName = `prescription-${patient.id}-${Date.now()}`;
  const pdfPath = await uploadPDF(pdfBuffer, 'prescriptions', fileName);

  // Create prescription record
  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      consultation_id,
      patient_id,
      doctor_id: doctor.id,
      medicines,
      instructions,
      pdf_url: pdfPath,
    })
    .select()
    .single();

  if (error) {
    console.error('Create prescription error:', error);
    return res.status(500).json({ error: 'Failed to create prescription' });
  }

  return res.status(201).json(data);
}));

// GET /api/prescriptions/patient/:patientId - Get patient's prescriptions
router.get('/patient/:patientId', requireRole('doctor', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  const { patientId } = req.params;

  const { data, error } = await supabase
    .from('prescriptions')
    .select(`
      *,
      doctor:doctors(full_name, specialization),
      consultation:consultations(diagnosis, created_at)
    `)
    .eq('patient_id', patientId)
    .order('issued_at', { ascending: false });

  if (error) {
    console.error('Fetch prescriptions error:', error);
    return res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }

  return res.json(data);
}));

// GET /api/prescriptions/me - Get own prescriptions (patient)
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
    .from('prescriptions')
    .select(`
      *,
      doctor:doctors(full_name, specialization),
      consultation:consultations(diagnosis, created_at)
    `)
    .eq('patient_id', patient.id)
    .order('issued_at', { ascending: false });

  if (error) {
    console.error('Fetch prescriptions error:', error);
    return res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }

  return res.json(data);
}));

// GET /api/prescriptions/:id - Get single prescription
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role } = req.auth!;

  const { data, error } = await supabase
    .from('prescriptions')
    .select(`
      *,
      doctor:doctors(full_name, specialization, qualification),
      patient:patients(full_name, student_id),
      consultation:consultations(diagnosis, chief_complaint)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Prescription not found' });
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

// GET /api/prescriptions/:id/pdf - Get signed PDF URL
// Note: This will be implemented in Phase 4 with actual PDF generation
router.get('/:id/pdf', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role } = req.auth!;

  // Get prescription
  const { data: prescription, error } = await supabase
    .from('prescriptions')
    .select('pdf_url, patient_id')
    .eq('id', id)
    .single();

  if (error || !prescription) {
    return res.status(404).json({ error: 'Prescription not found' });
  }

  // Check access for patients
  if (role === 'patient') {
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (prescription.patient_id !== patient?.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  if (!prescription.pdf_url) {
    return res.status(404).json({ 
      error: 'PDF not available'
    });
  }

  // Generate signed URL (expires in 1 hour)
  try {
    const signedUrl = await getSignedPDFUrl(prescription.pdf_url);
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
