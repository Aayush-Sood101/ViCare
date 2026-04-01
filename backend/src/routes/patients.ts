import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import { clerkAuthMiddleware, requireRole } from '../middleware/auth';
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
      prescriptions(id, medicines, instructions, issued_at)
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
