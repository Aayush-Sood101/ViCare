import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import { clerkAuthMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody } from '../utils/validation';

const router = Router();
router.use(clerkAuthMiddleware);

// Helper: Get next token number for a doctor on a date
async function getNextTokenNumber(doctorId: string, date: Date): Promise<number> {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const { data } = await supabase
    .from('appointments')
    .select('token_number')
    .eq('doctor_id', doctorId)
    .gte('scheduled_at', dayStart.toISOString())
    .lt('scheduled_at', dayEnd.toISOString())
    .order('token_number', { ascending: false })
    .limit(1);

  return (data?.[0]?.token_number || 0) + 1;
}

// POST /api/appointments - Book appointment (patient)
router.post('/', requireRole('patient'), validateBody({
  doctor_id: { required: true, type: 'string' },
  scheduled_at: { required: true, type: 'string' },
  reason_for_visit: { type: 'string', maxLength: 500 },
}), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.auth!;
  const { doctor_id, scheduled_at, reason_for_visit } = req.body;

  // Get patient ID
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!patient) {
    return res.status(404).json({ error: 'Patient profile not found' });
  }

  // Verify doctor exists and is active
  const { data: doctor } = await supabase
    .from('doctors')
    .select('id, is_active')
    .eq('id', doctor_id)
    .single();

  if (!doctor || !doctor.is_active) {
    return res.status(400).json({ error: 'Doctor not available' });
  }

  // Get token number
  const scheduledDate = new Date(scheduled_at);
  const tokenNumber = await getNextTokenNumber(doctor_id, scheduledDate);

  // Check for duplicate appointment (same patient, doctor, date)
  const dayStart = new Date(scheduledDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const { data: existing } = await supabase
    .from('appointments')
    .select('id')
    .eq('patient_id', patient.id)
    .eq('doctor_id', doctor_id)
    .gte('scheduled_at', dayStart.toISOString())
    .lt('scheduled_at', dayEnd.toISOString())
    .not('status', 'eq', 'cancelled')
    .single();

  if (existing) {
    return res.status(400).json({ error: 'You already have an appointment with this doctor today' });
  }

  // Create appointment
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: patient.id,
      doctor_id,
      scheduled_at,
      token_number: tokenNumber,
      reason_for_visit,
      status: 'confirmed',
    })
    .select()
    .single();

  if (error) {
    console.error('Create appointment error:', error);
    return res.status(500).json({ error: 'Failed to book appointment' });
  }

  return res.status(201).json(data);
}));

// GET /api/appointments - Get appointments
// Patients: their own | Doctors: today's queue | Admin: all
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { userId, role } = req.auth!;
  const status = req.query.status as string;
  const date = req.query.date as string; // YYYY-MM-DD

  let query = supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(id, full_name, student_id, phone, gender, blood_group),
      doctor:doctors(id, full_name, specialization)
    `)
    .order('scheduled_at', { ascending: true });

  if (role === 'patient') {
    // Get patient's own appointments
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    query = query.eq('patient_id', patient.id);
  } else if (role === 'doctor') {
    // Get doctor's queue
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    query = query.eq('doctor_id', doctor.id);

    // Default to today for doctors
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

    query = query
      .gte('scheduled_at', targetDate.toISOString())
      .lt('scheduled_at', nextDay.toISOString());
  }
  // Admin gets all appointments (optionally filtered)

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Fetch appointments error:', error);
    return res.status(500).json({ error: 'Failed to fetch appointments' });
  }

  return res.json(data);
}));

// GET /api/appointments/:id - Get single appointment
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role } = req.auth!;

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(*),
      doctor:doctors(id, full_name, specialization, qualification)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  // Check access
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

// PATCH /api/appointments/:id/status - Update appointment status
router.patch('/:id/status', requireRole('doctor', 'admin'), validateBody({
  status: { required: true, type: 'string', enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] },
}), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const { userId, role } = req.auth!;

  // Verify ownership for doctors
  if (role === 'doctor') {
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    const { data: appointment } = await supabase
      .from('appointments')
      .select('doctor_id')
      .eq('id', id)
      .single();

    if (appointment?.doctor_id !== doctor?.id) {
      return res.status(403).json({ error: 'Cannot update another doctor\'s appointment' });
    }
  }

  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update appointment status error:', error);
    return res.status(500).json({ error: 'Failed to update status' });
  }

  return res.json(data);
}));

// DELETE /api/appointments/:id - Cancel appointment (patient only, own appointments)
router.delete('/:id', requireRole('patient'), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.auth!;

  // Get patient
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  // Verify ownership
  const { data: appointment } = await supabase
    .from('appointments')
    .select('patient_id, status')
    .eq('id', id)
    .single();

  if (!appointment || appointment.patient_id !== patient?.id) {
    return res.status(403).json({ error: 'Cannot cancel this appointment' });
  }

  if (appointment.status === 'completed') {
    return res.status(400).json({ error: 'Cannot cancel a completed appointment' });
  }

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) {
    console.error('Cancel appointment error:', error);
    return res.status(500).json({ error: 'Failed to cancel appointment' });
  }

  return res.json({ message: 'Appointment cancelled' });
}));

export default router;
