import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import { clerkAuthMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { updateUserRole } from '../config/clerk';
import { validateBody } from '../utils/validation';

const router = Router();

// All admin routes require authentication and admin role
router.use(clerkAuthMiddleware);
router.use(requireRole('admin'));

// ==================== DOCTOR APPROVAL ====================

// GET /api/admin/approval-requests - List pending doctor requests
router.get('/approval-requests', asyncHandler(async (req: Request, res: Response) => {
  const status = (req.query.status as string) || 'pending';

  let query = supabase
    .from('doctor_approval_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Fetch approval requests error:', error);
    return res.status(500).json({ error: 'Failed to fetch requests' });
  }

  return res.json(data);
}));

// GET /api/admin/approval-requests/:id - Get single request
router.get('/approval-requests/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('doctor_approval_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Request not found' });
  }

  return res.json(data);
}));

// PATCH /api/admin/approval-requests/:id - Approve or reject
router.patch('/approval-requests/:id', validateBody({
  action: { required: true, type: 'string', enum: ['approve', 'reject'] },
  rejection_reason: { type: 'string' },
}), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, rejection_reason } = req.body;
  const { userId: adminUserId } = req.auth!;

  // Get the request
  const { data: request, error: fetchError } = await supabase
    .from('doctor_approval_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({ error: 'Request already processed' });
  }

  if (action === 'approve') {
    // Update Clerk metadata
    await updateUserRole(request.clerk_user_id, 'doctor');

    // Create doctor record
    const { error: insertError } = await supabase.from('doctors').insert({
      clerk_user_id: request.clerk_user_id,
      full_name: request.full_name,
      email: request.email,
      specialization: request.specialization,
      qualification: request.qualification,
      registration_number: request.registration_number,
      phone: request.phone,
      is_active: true,
    });

    if (insertError) {
      console.error('Create doctor error:', insertError);
      // Rollback Clerk metadata
      await updateUserRole(request.clerk_user_id, 'pending_doctor');
      return res.status(500).json({ error: 'Failed to create doctor record' });
    }

    // Update request status
    await supabase
      .from('doctor_approval_requests')
      .update({
        status: 'approved',
        reviewed_by: adminUserId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    return res.json({ message: 'Doctor approved successfully' });

  } else if (action === 'reject') {
    if (!rejection_reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    // Update Clerk metadata
    await updateUserRole(request.clerk_user_id, 'rejected_doctor');

    // Update request status
    await supabase
      .from('doctor_approval_requests')
      .update({
        status: 'rejected',
        rejection_reason,
        reviewed_by: adminUserId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    return res.json({ message: 'Doctor request rejected' });
  }
}));

// ==================== DOCTOR MANAGEMENT ====================

// GET /api/admin/doctors - List all doctors
router.get('/doctors', asyncHandler(async (req: Request, res: Response) => {
  const is_active = req.query.is_active as string;
  const search = req.query.search as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('doctors')
    .select('*', { count: 'exact' });

  if (is_active !== undefined) {
    query = query.eq('is_active', is_active === 'true');
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,specialization.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Fetch doctors error:', error);
    return res.status(500).json({ error: 'Failed to fetch doctors' });
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

// PATCH /api/admin/doctors/:id - Update doctor (activate/deactivate)
router.patch('/doctors/:id', validateBody({
  is_active: { type: 'boolean' },
}), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { is_active } = req.body;

  const { data, error } = await supabase
    .from('doctors')
    .update({ is_active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update doctor error:', error);
    return res.status(500).json({ error: 'Failed to update doctor' });
  }

  return res.json(data);
}));

// GET /api/admin/doctors/:id - Get single doctor with stats
router.get('/doctors/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: doctor, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  // Get stats
  const { count: totalConsultations } = await supabase
    .from('consultations')
    .select('id', { count: 'exact', head: true })
    .eq('doctor_id', id);

  const { count: totalPrescriptions } = await supabase
    .from('prescriptions')
    .select('id', { count: 'exact', head: true })
    .eq('doctor_id', id);

  return res.json({
    ...doctor,
    stats: {
      totalConsultations,
      totalPrescriptions,
    },
  });
}));

// ==================== ANALYTICS ====================

// GET /api/admin/analytics/overview - Dashboard overview
router.get('/analytics/overview', asyncHandler(async (req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Total counts
  const [
    { count: totalPatients },
    { count: totalDoctors },
    { count: activeDoctors },
    { count: todayAppointments },
    { count: todayConsultations },
    { count: pendingApprovals },
  ] = await Promise.all([
    supabase.from('patients').select('id', { count: 'exact', head: true }),
    supabase.from('doctors').select('id', { count: 'exact', head: true }),
    supabase.from('doctors').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).gte('scheduled_at', todayISO),
    supabase.from('consultations').select('id', { count: 'exact', head: true }).gte('created_at', todayISO),
    supabase.from('doctor_approval_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  // Weekly trend
  const { data: weeklyAppointments } = await supabase
    .from('appointments')
    .select('scheduled_at, status')
    .gte('scheduled_at', weekAgo.toISOString());

  return res.json({
    totals: {
      patients: totalPatients || 0,
      doctors: totalDoctors || 0,
      activeDoctors: activeDoctors || 0,
      pendingApprovals: pendingApprovals || 0,
    },
    today: {
      appointments: todayAppointments || 0,
      consultations: todayConsultations || 0,
    },
    weeklyAppointments: weeklyAppointments || [],
  });
}));

// GET /api/admin/analytics/visits - Visit trends
router.get('/analytics/visits', asyncHandler(async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('consultations')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Fetch visits error:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }

  // Group by date
  const visitsByDate: Record<string, number> = {};
  data?.forEach(consultation => {
    const date = new Date(consultation.created_at).toISOString().split('T')[0];
    visitsByDate[date] = (visitsByDate[date] || 0) + 1;
  });

  // Fill in missing dates
  const result = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      count: visitsByDate[dateStr] || 0,
    });
  }

  return res.json(result);
}));

// GET /api/admin/analytics/peak-hours - Peak consultation hours
router.get('/analytics/peak-hours', asyncHandler(async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('appointments')
    .select('scheduled_at')
    .gte('scheduled_at', startDate.toISOString())
    .eq('status', 'completed');

  if (error) {
    console.error('Fetch peak hours error:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }

  // Group by hour
  const hourCounts: Record<number, number> = {};
  for (let i = 0; i < 24; i++) {
    hourCounts[i] = 0;
  }

  data?.forEach(apt => {
    const hour = new Date(apt.scheduled_at).getHours();
    hourCounts[hour]++;
  });

  return res.json(
    Object.entries(hourCounts).map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
    }))
  );
}));

// GET /api/admin/analytics/diagnoses - Common diagnoses
router.get('/analytics/diagnoses', asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const days = parseInt(req.query.days as string) || 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('consultations')
    .select('diagnosis')
    .gte('created_at', startDate.toISOString())
    .not('diagnosis', 'is', null);

  if (error) {
    console.error('Fetch diagnoses error:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }

  // Count diagnoses
  const diagnosisCounts: Record<string, number> = {};
  data?.forEach(c => {
    if (c.diagnosis) {
      const diagnosis = c.diagnosis.trim().toLowerCase();
      diagnosisCounts[diagnosis] = (diagnosisCounts[diagnosis] || 0) + 1;
    }
  });

  // Sort and limit
  const sorted = Object.entries(diagnosisCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([diagnosis, count]) => ({ diagnosis, count }));

  return res.json(sorted);
}));

// GET /api/admin/analytics/medicines - Most prescribed medicines
router.get('/analytics/medicines', asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const days = parseInt(req.query.days as string) || 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('prescriptions')
    .select('medicines')
    .gte('issued_at', startDate.toISOString());

  if (error) {
    console.error('Fetch medicines error:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }

  // Count medicines
  const medicineCounts: Record<string, number> = {};
  data?.forEach(p => {
    if (Array.isArray(p.medicines)) {
      p.medicines.forEach((med: any) => {
        if (med.name) {
          const name = med.name.trim().toLowerCase();
          medicineCounts[name] = (medicineCounts[name] || 0) + 1;
        }
      });
    }
  });

  // Sort and limit
  const sorted = Object.entries(medicineCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([medicine, count]) => ({ medicine, count }));

  return res.json(sorted);
}));

// GET /api/admin/analytics/demographics - Patient demographics
router.get('/analytics/demographics', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('patients')
    .select('gender, blood_group');

  if (error) {
    console.error('Fetch demographics error:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }

  // Gender distribution
  const genderCounts: Record<string, number> = {};
  const bloodGroupCounts: Record<string, number> = {};

  data?.forEach(p => {
    if (p.gender) {
      genderCounts[p.gender] = (genderCounts[p.gender] || 0) + 1;
    }
    if (p.blood_group) {
      bloodGroupCounts[p.blood_group] = (bloodGroupCounts[p.blood_group] || 0) + 1;
    }
  });

  return res.json({
    gender: Object.entries(genderCounts).map(([gender, count]) => ({ gender, count })),
    bloodGroup: Object.entries(bloodGroupCounts).map(([bloodGroup, count]) => ({ bloodGroup, count })),
  });
}));

export default router;
