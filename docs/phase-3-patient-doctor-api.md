# Phase 3: Patient & Doctor Backend APIs

## Objectives

1. Implement patient profile management APIs
2. Build appointment booking and management system
3. Create doctor queue and consultation APIs
4. Implement prescription creation endpoints
5. Build medical certificate issuance

---

## 3.1 Patient Routes

### src/routes/patients.ts

```typescript
import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import { clerkAuthMiddleware, requireRole, requireOwnerOrRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(clerkAuthMiddleware);

// GET /api/patients/me - Get current patient's profile
router.get('/me', requireRole('patient'), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.auth!;

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Patient profile not found' });
  }

  return res.json(data);
}));

// PUT /api/patients/me - Update current patient's profile
router.put('/me', requireRole('patient'), validateBody({
  date_of_birth: { type: 'string' },
  gender: { type: 'string', enum: ['male', 'female', 'other'] },
  blood_group: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  phone: { type: 'string' },
  address: { type: 'string' },
  emergency_contact_name: { type: 'string' },
  emergency_contact_phone: { type: 'string' },
}), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.auth!;
  const updates = req.body;

  // Remove fields that shouldn't be updated
  delete updates.id;
  delete updates.clerk_user_id;
  delete updates.student_id;
  delete updates.email;
  delete updates.created_at;

  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('clerk_user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Update patient error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }

  return res.json(data);
}));

// GET /api/patients/:id - Get patient by ID (doctors/admins only)
router.get('/:id', requireRole('doctor', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  return res.json(data);
}));

// GET /api/patients - List all patients (admin only, with pagination)
router.get('/', requireRole('admin'), asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('patients')
    .select('*', { count: 'exact' });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,student_id.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('List patients error:', error);
    return res.status(500).json({ error: 'Failed to fetch patients' });
  }

  return res.json({
    data,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil((count || 0) / limit),
    },
  });
}));

// GET /api/patients/:id/history - Get patient's consultation history
router.get('/:id/history', requireRole('doctor', 'admin'), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: consultations, error } = await supabase
    .from('consultations')
    .select(`
      *,
      doctor:doctors(full_name, specialization),
      prescription:prescriptions(id, medicines, pdf_url)
    `)
    .eq('patient_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch history error:', error);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }

  return res.json(consultations);
}));

export default router;
```

---

## 3.2 Doctor Routes

### src/routes/doctors.ts

```typescript
import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import { clerkAuthMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// GET /api/doctors - List active doctors (public, for booking)
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('doctors')
    .select('id, full_name, specialization, qualification')
    .eq('is_active', true)
    .order('full_name');

  if (error) {
    console.error('List doctors error:', error);
    return res.status(500).json({ error: 'Failed to fetch doctors' });
  }

  return res.json(data);
}));

// Protected routes
router.use(clerkAuthMiddleware);

// GET /api/doctors/me - Get current doctor's profile
router.get('/me', requireRole('doctor'), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.auth!;

  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('clerk_user_id', userId)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Doctor profile not found' });
  }

  return res.json(data);
}));

// PUT /api/doctors/me - Update current doctor's profile
router.put('/me', requireRole('doctor'), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.auth!;
  const updates = req.body;

  // Only allow updating specific fields
  const allowedFields = ['phone', 'specialization', 'qualification'];
  const filteredUpdates: Record<string, any> = {};
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    }
  }

  const { data, error } = await supabase
    .from('doctors')
    .update(filteredUpdates)
    .eq('clerk_user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Update doctor error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }

  return res.json(data);
}));

// GET /api/doctors/:id - Get doctor by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('doctors')
    .select('id, full_name, specialization, qualification, is_active')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  return res.json(data);
}));

// GET /api/doctors/me/stats - Get doctor's daily stats
router.get('/me/stats', requireRole('doctor'), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.auth!;

  // Get doctor's ID
  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  // Today's appointments
  const { data: todayAppointments, count: totalToday } = await supabase
    .from('appointments')
    .select('status', { count: 'exact' })
    .eq('doctor_id', doctor.id)
    .gte('scheduled_at', todayISO)
    .lt('scheduled_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());

  const completed = todayAppointments?.filter(a => a.status === 'completed').length || 0;
  const pending = todayAppointments?.filter(a => a.status === 'pending' || a.status === 'confirmed').length || 0;
  const inProgress = todayAppointments?.filter(a => a.status === 'in_progress').length || 0;

  return res.json({
    today: {
      total: totalToday || 0,
      completed,
      pending,
      inProgress,
    },
  });
}));

export default router;
```

---

## 3.3 Appointment Routes

### src/routes/appointments.ts

```typescript
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
      patient:patients(id, full_name, student_id, phone),
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
```

---

## 3.4 Consultation Routes

### src/routes/consultations.ts

```typescript
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
      prescriptions(id, medicines, pdf_url, issued_at)
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
      prescriptions(id, medicines, pdf_url, issued_at)
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
```

---

## 3.5 Prescription Routes

### src/routes/prescriptions.ts

```typescript
import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import { clerkAuthMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody } from '../utils/validation';
import { generatePrescriptionPDF } from '../services/pdfService';

const router = Router();
router.use(clerkAuthMiddleware);

// POST /api/prescriptions - Create prescription (doctor)
router.post('/', requireRole('doctor'), validateBody({
  consultation_id: { type: 'string' },
  patient_id: { required: true, type: 'string' },
  medicines: { required: true, type: 'array' },
  instructions: { type: 'string' },
}), asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.auth!;
  const { consultation_id, patient_id, medicines, instructions } = req.body;

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
  const fileName = `prescriptions/${patient_id}/${Date.now()}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
    });

  if (uploadError) {
    console.error('PDF upload error:', uploadError);
    return res.status(500).json({ error: 'Failed to upload prescription PDF' });
  }

  // Create prescription record
  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      consultation_id,
      patient_id,
      doctor_id: doctor.id,
      medicines,
      instructions,
      pdf_url: fileName,
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
      doctor:doctors(full_name, specialization)
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
      doctor:doctors(full_name, specialization)
    `)
    .eq('patient_id', patient.id)
    .order('issued_at', { ascending: false });

  if (error) {
    console.error('Fetch prescriptions error:', error);
    return res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }

  return res.json(data);
}));

// GET /api/prescriptions/:id/pdf - Get signed PDF URL
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

  // Generate signed URL (valid for 1 hour)
  const { data: signedUrl, error: signError } = await supabase.storage
    .from('documents')
    .createSignedUrl(prescription.pdf_url, 3600);

  if (signError || !signedUrl) {
    console.error('Signed URL error:', signError);
    return res.status(500).json({ error: 'Failed to generate download URL' });
  }

  return res.json({ url: signedUrl.signedUrl });
}));

export default router;
```

---

## 3.6 Medical Certificate Routes

### src/routes/certificates.ts

```typescript
import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import { clerkAuthMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody } from '../utils/validation';
import { generateCertificatePDF } from '../services/pdfService';

const router = Router();
router.use(clerkAuthMiddleware);

// POST /api/certificates - Issue certificate (doctor)
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
  const fileName = `certificates/${patient_id}/${Date.now()}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
    });

  if (uploadError) {
    console.error('PDF upload error:', uploadError);
    return res.status(500).json({ error: 'Failed to upload certificate PDF' });
  }

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
      pdf_url: fileName,
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

// GET /api/certificates/:id/pdf - Get signed PDF URL
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

  // Generate signed URL
  const { data: signedUrl, error: signError } = await supabase.storage
    .from('documents')
    .createSignedUrl(certificate.pdf_url, 3600);

  if (signError || !signedUrl) {
    console.error('Signed URL error:', signError);
    return res.status(500).json({ error: 'Failed to generate download URL' });
  }

  return res.json({ url: signedUrl.signedUrl });
}));

export default router;
```

---

## 3.7 Updated Entry Point

### src/index.ts

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

// Routes
import webhookRoutes from './routes/webhooks';
import authRoutes from './routes/auth';
import patientRoutes from './routes/patients';
import doctorRoutes from './routes/doctors';
import appointmentRoutes from './routes/appointments';
import consultationRoutes from './routes/consultations';
import prescriptionRoutes from './routes/prescriptions';
import certificateRoutes from './routes/certificates';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Webhook routes (raw body)
app.use('/api/webhooks', webhookRoutes);

// JSON parsing
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/certificates', certificateRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`ViCare API server running on port ${PORT}`);
});
```

---

## 3.8 Verification Checklist

- [ ] Patient can view and update their own profile
- [ ] Patient can book appointments with doctors
- [ ] Patient can view their own appointments, consultations, prescriptions, certificates
- [ ] Doctor can view today's queue
- [ ] Doctor can update appointment status
- [ ] Doctor can create consultations
- [ ] Doctor can issue prescriptions (PDF generated and stored)
- [ ] Doctor can issue medical certificates
- [ ] All routes have proper role-based access control
- [ ] Patients cannot access other patients' data
- [ ] PDF signed URLs work correctly

---

## Next Phase

[Phase 4: Admin APIs & PDF Generation](./phase-4-admin-pdf.md)
