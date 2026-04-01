import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import { clerkAuthMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody } from '../utils/validation';

const router = Router();
router.use(clerkAuthMiddleware);

// POST /api/consultations - Create consultation (doctor)
router.post('/', requireRole('doctor'), validateBody({
  appointment_id: { type: 'string' },
  patient_id: { required: true, type: 'string' },
  chief_complaint: { type: 'string' },
  diagnosis: { type: 'string' },
  notes: { type: 'string' },
  vitals: { type: 'object' },
  follow_up_date: { type: 'string' },
}), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.auth!;
  const { appointment_id, patient_id, chief_complaint, diagnosis, notes, vitals, follow_up_date } = req.body;

  // Get doctor ID
  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  // Verify patient exists
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('id', patient_id)
    .single();

  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  // If appointment provided, verify it belongs to this doctor
  if (appointment_id) {
    const { data: appointment } = await supabase
      .from('appointments')
      .select('doctor_id, patient_id')
      .eq('id', appointment_id)
      .single();

    if (!appointment || appointment.doctor_id !== doctor.id || appointment.patient_id !== patient_id) {
      return res.status(400).json({ error: 'Invalid appointment' });
    }

    // Update appointment status to completed
    await supabase
      .from('appointments')
      .update({ status: 'completed' })
      .eq('id', appointment_id);
  }

  // Create consultation
  const { data, error } = await supabase
    .from('consultations')
    .insert({
      appointment_id,
      patient_id,
      doctor_id: doctor.id,
      chief_complaint,
      diagnosis,
      notes,
      vitals,
      follow_up_date,
    })
    .select()
    .single();

  if (error) {
    console.error('Create consultation error:', error);
    return res.status(500).json({ error: 'Failed to create consultation' });
  }

  return res.status(201).json(data);
}));

// GET /api/consultations/patient/:patientId - Get patient's consultations
router.get('/patient/:patientId', requireRole('doctor', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  const { patientId } = req.params;

  const { data, error } = await supabase
    .from('consultations')
    .select(`
      *,
      doctor:doctors(full_name, specialization),
      prescriptions(id, medicines, instructions, issued_at)
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch consultations error:', error);
    return res.status(500).json({ error: 'Failed to fetch consultations' });
  }

  return res.json(data);
}));

// GET /api/consultations/me - Get own consultations (patient)
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
    .from('consultations')
    .select(`
      *,
      doctor:doctors(full_name, specialization),
      prescriptions(id, medicines, instructions, issued_at)
    `)
    .eq('patient_id', patient.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch consultations error:', error);
    return res.status(500).json({ error: 'Failed to fetch consultations' });
  }

  return res.json(data);
}));

// GET /api/consultations/:id - Get single consultation
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role } = req.auth!;

  const { data, error } = await supabase
    .from('consultations')
    .select(`
      *,
      patient:patients(id, full_name, student_id, date_of_birth, gender, blood_group),
      doctor:doctors(full_name, specialization, qualification),
      prescriptions(*)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Consultation not found' });
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

export default router;
