# Phase 4: Admin APIs & PDF Generation

## Objectives

1. Implement admin doctor approval workflow
2. Build doctor management APIs
3. Create analytics and reporting endpoints
4. Implement PDF generation for prescriptions and certificates
5. Add system health and utility endpoints

---

## 4.1 Admin Routes

### src/routes/admin.ts

```typescript
import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import { clerkAuthMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { updateUserRole, clerkClient } from '../config/clerk';
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
    .select('id', { count: 'exact' })
    .eq('doctor_id', id);

  const { count: totalPrescriptions } = await supabase
    .from('prescriptions')
    .select('id', { count: 'exact' })
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
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

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
```

---

## 4.2 PDF Generation Service

### src/services/pdfService.ts

```typescript
import PDFDocument from 'pdfkit';
import { Patient, Doctor, Medicine } from '../types';

interface PrescriptionPDFData {
  patient: Patient;
  doctor: Doctor;
  medicines: Medicine[];
  instructions?: string;
  issuedAt: Date;
}

interface CertificatePDFData {
  patient: Patient;
  doctor: Doctor;
  reason: string;
  fromDate: Date;
  toDate: Date;
  notes?: string;
  issuedAt: Date;
}

export async function generatePrescriptionPDF(data: PrescriptionPDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Sri Narayani Health Centre', { align: 'center' })
      .fontSize(12)
      .font('Helvetica')
      .text('VIT University Campus', { align: 'center' })
      .moveDown(0.5);

    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown();

    // Title
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('PRESCRIPTION', { align: 'center' })
      .moveDown();

    // Patient Info
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('Patient Information', { underline: true })
      .moveDown(0.3);

    doc
      .font('Helvetica')
      .text(`Name: ${data.patient.full_name}`)
      .text(`Student ID: ${data.patient.student_id}`)
      .text(`Date of Birth: ${data.patient.date_of_birth || 'N/A'}`)
      .text(`Gender: ${data.patient.gender || 'N/A'}`)
      .text(`Blood Group: ${data.patient.blood_group || 'N/A'}`)
      .moveDown();

    // Date
    doc
      .text(`Date: ${data.issuedAt.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })}`)
      .moveDown();

    // Medicines Table
    doc
      .font('Helvetica-Bold')
      .text('Medicines', { underline: true })
      .moveDown(0.5);

    // Table header
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 200;
    const col3 = 280;
    const col4 = 360;
    const col5 = 440;

    doc
      .fontSize(10)
      .text('Medicine', col1, tableTop)
      .text('Dosage', col2, tableTop)
      .text('Frequency', col3, tableTop)
      .text('Duration', col4, tableTop)
      .text('Instructions', col5, tableTop);

    doc
      .moveTo(col1, doc.y + 3)
      .lineTo(545, doc.y + 3)
      .stroke();

    // Table rows
    let y = doc.y + 10;
    doc.font('Helvetica');

    data.medicines.forEach(med => {
      doc
        .text(med.name, col1, y, { width: 145 })
        .text(med.dosage, col2, y, { width: 75 })
        .text(med.frequency, col3, y, { width: 75 })
        .text(med.duration, col4, y, { width: 75 })
        .text(med.instructions || '-', col5, y, { width: 100 });
      y = doc.y + 10;
    });

    doc.moveDown(2);

    // Additional Instructions
    if (data.instructions) {
      doc
        .font('Helvetica-Bold')
        .text('Additional Instructions:', { underline: true })
        .moveDown(0.3)
        .font('Helvetica')
        .text(data.instructions)
        .moveDown(2);
    }

    // Doctor Signature
    doc
      .moveDown(2)
      .font('Helvetica-Bold')
      .text(`Dr. ${data.doctor.full_name}`, { align: 'right' })
      .font('Helvetica')
      .text(data.doctor.specialization || '', { align: 'right' })
      .text(data.doctor.qualification || '', { align: 'right' })
      .text(`Reg. No: ${data.doctor.registration_number || 'N/A'}`, { align: 'right' });

    // Footer
    doc
      .fontSize(8)
      .text(
        'This is a computer-generated prescription. Valid only with doctor\'s digital signature.',
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

    doc.end();
  });
}

export async function generateCertificatePDF(data: CertificatePDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Sri Narayani Health Centre', { align: 'center' })
      .fontSize(12)
      .font('Helvetica')
      .text('VIT University Campus', { align: 'center' })
      .moveDown(0.5);

    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown();

    // Title
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('MEDICAL CERTIFICATE', { align: 'center' })
      .moveDown(2);

    // Certificate number and date
    const certNumber = `MC-${Date.now().toString(36).toUpperCase()}`;
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Certificate No: ${certNumber}`, { align: 'right' })
      .text(`Date: ${data.issuedAt.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })}`, { align: 'right' })
      .moveDown(2);

    // Body
    doc
      .fontSize(12)
      .font('Helvetica')
      .text('TO WHOM IT MAY CONCERN', { align: 'center' })
      .moveDown(2);

    const fromDateStr = data.fromDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const toDateStr = data.toDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    doc
      .text(
        `This is to certify that ${data.patient.full_name}, ` +
        `Student ID: ${data.patient.student_id}, ` +
        `was under my medical care and treatment.`,
        { align: 'justify', lineGap: 5 }
      )
      .moveDown();

    doc
      .font('Helvetica-Bold')
      .text('Reason: ', { continued: true })
      .font('Helvetica')
      .text(data.reason)
      .moveDown();

    doc
      .font('Helvetica-Bold')
      .text('Period: ', { continued: true })
      .font('Helvetica')
      .text(`From ${fromDateStr} to ${toDateStr}`)
      .moveDown();

    if (data.notes) {
      doc
        .font('Helvetica-Bold')
        .text('Remarks: ', { continued: true })
        .font('Helvetica')
        .text(data.notes)
        .moveDown();
    }

    doc
      .moveDown()
      .text(
        'The patient is advised to take rest and follow the prescribed treatment ' +
        'during the mentioned period.',
        { align: 'justify' }
      )
      .moveDown(3);

    // Doctor Signature
    doc
      .font('Helvetica-Bold')
      .text(`Dr. ${data.doctor.full_name}`, { align: 'right' })
      .font('Helvetica')
      .text(data.doctor.specialization || '', { align: 'right' })
      .text(data.doctor.qualification || '', { align: 'right' })
      .text(`Reg. No: ${data.doctor.registration_number || 'N/A'}`, { align: 'right' });

    // Official stamp placeholder
    doc
      .moveDown(2)
      .rect(400, doc.y, 100, 50)
      .stroke()
      .fontSize(8)
      .text('Official Stamp', 420, doc.y + 20);

    // Footer
    doc
      .fontSize(8)
      .text(
        'This certificate is issued upon the request of the patient and is valid for official purposes.',
        50,
        doc.page.height - 60,
        { align: 'center' }
      )
      .text(
        'This is a computer-generated certificate. No signature required.',
        50,
        doc.page.height - 45,
        { align: 'center' }
      );

    doc.end();
  });
}
```

---

## 4.3 Seed Admin Script

### src/scripts/seedAdmin.ts

```typescript
import { clerkClient } from '@clerk/express';
import dotenv from 'dotenv';

dotenv.config();

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.error('ADMIN_EMAIL environment variable is required');
    process.exit(1);
  }

  try {
    // Find user by email
    const users = await clerkClient.users.getUserList({
      emailAddress: [adminEmail],
    });

    if (users.data.length === 0) {
      console.error(`No user found with email: ${adminEmail}`);
      console.log('Please sign up first, then run this script.');
      process.exit(1);
    }

    const user = users.data[0];

    // Update user metadata to admin
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: { role: 'admin' },
    });

    console.log(`Successfully set admin role for: ${adminEmail}`);
    console.log(`Clerk User ID: ${user.id}`);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
```

### Add script to package.json

```json
{
  "scripts": {
    "seed:admin": "ts-node src/scripts/seedAdmin.ts"
  }
}
```

Usage:
```bash
ADMIN_EMAIL=admin@vicare.edu npm run seed:admin
```

---

## 4.4 Updated Entry Point with Admin Routes

### src/index.ts (additions)

```typescript
// Add to imports
import adminRoutes from './routes/admin';

// Add to routes section
app.use('/api/admin', adminRoutes);
```

---

## 4.5 System Health Endpoints

### src/routes/system.ts

```typescript
import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import { clerkAuthMiddleware, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Public health check
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Detailed health check (admin only)
router.get('/health/detailed', clerkAuthMiddleware, requireRole('admin'), asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();

  // Check database connection
  let dbStatus = 'ok';
  let dbLatency = 0;
  try {
    const dbStart = Date.now();
    await supabase.from('patients').select('id').limit(1);
    dbLatency = Date.now() - dbStart;
  } catch (error) {
    dbStatus = 'error';
  }

  // Check storage
  let storageStatus = 'ok';
  try {
    await supabase.storage.from('documents').list('', { limit: 1 });
  } catch (error) {
    storageStatus = 'error';
  }

  const totalLatency = Date.now() - startTime;

  return res.json({
    status: dbStatus === 'ok' && storageStatus === 'ok' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: dbStatus, latencyMs: dbLatency },
      storage: { status: storageStatus },
    },
    totalLatencyMs: totalLatency,
  });
}));

export default router;
```

---

## 4.6 API Documentation Endpoint

### src/routes/docs.ts

```typescript
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'ViCare API',
    version: '1.0.0',
    description: 'University Campus Healthcare Platform API',
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
        'GET /api/prescriptions/:id/pdf': 'Get prescription PDF URL',
      },
      certificates: {
        'POST /api/certificates': 'Issue certificate with PDF (doctor)',
        'GET /api/certificates/patient/:id': 'Get patient certificates (doctor/admin)',
        'GET /api/certificates/me': 'Get own certificates (patient)',
        'GET /api/certificates/:id/pdf': 'Get certificate PDF URL',
      },
      admin: {
        'GET /api/admin/approval-requests': 'List doctor approval requests',
        'PATCH /api/admin/approval-requests/:id': 'Approve or reject doctor',
        'GET /api/admin/doctors': 'List all doctors',
        'PATCH /api/admin/doctors/:id': 'Update doctor (activate/deactivate)',
        'GET /api/admin/analytics/overview': 'Dashboard overview stats',
        'GET /api/admin/analytics/visits': 'Visit trends',
        'GET /api/admin/analytics/peak-hours': 'Peak consultation hours',
        'GET /api/admin/analytics/diagnoses': 'Common diagnoses',
        'GET /api/admin/analytics/medicines': 'Most prescribed medicines',
        'GET /api/admin/analytics/demographics': 'Patient demographics',
      },
      system: {
        'GET /health': 'Basic health check (public)',
        'GET /api/system/health/detailed': 'Detailed health check (admin)',
      },
    },
  });
});

export default router;
```

---

## 4.7 Final Entry Point

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
import adminRoutes from './routes/admin';
import systemRoutes from './routes/system';
import docsRoutes from './routes/docs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Webhook routes (raw body)
app.use('/api/webhooks', webhookRoutes);

// JSON parsing
app.use(express.json());

// Public routes
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/docs', docsRoutes);
app.use('/api/system', systemRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`ViCare API server running on http://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api/docs`);
});
```

---

## 4.8 Verification Checklist

### Admin Approval Flow
- [ ] List pending doctor approval requests
- [ ] Approve doctor → creates doctor record, updates Clerk metadata
- [ ] Reject doctor → updates Clerk metadata with rejection reason
- [ ] Cannot re-process already processed requests

### Doctor Management
- [ ] List all doctors with search and filters
- [ ] Deactivate/reactivate doctor accounts
- [ ] View individual doctor with stats

### Analytics
- [ ] Overview dashboard returns all totals
- [ ] Visit trends grouped by date
- [ ] Peak hours analysis works
- [ ] Common diagnoses ranked correctly
- [ ] Most prescribed medicines tracked
- [ ] Demographics breakdown accurate

### PDF Generation
- [ ] Prescription PDFs generate correctly
- [ ] Certificate PDFs generate correctly
- [ ] PDFs upload to Supabase Storage
- [ ] Signed URLs work for downloads

### System
- [ ] Health check returns status
- [ ] Detailed health check verifies DB and storage
- [ ] API docs endpoint lists all routes
- [ ] Admin seed script works

---

## Backend Complete!

At this point, the entire backend is complete and ready for frontend integration.

## Next Phase

[Phase 5: Frontend Implementation](./phase-5-frontend.md)
