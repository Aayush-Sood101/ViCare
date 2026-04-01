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
  const tomorrowISO = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();

  // Today's appointments
  const { data: todayAppointments, count: totalToday } = await supabase
    .from('appointments')
    .select('status', { count: 'exact' })
    .eq('doctor_id', doctor.id)
    .gte('scheduled_at', todayISO)
    .lt('scheduled_at', tomorrowISO);

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
