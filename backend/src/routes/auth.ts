import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import { updateUserRole, clerkClient } from '../config/clerk';
import { clerkAuthMiddleware } from '../middleware/auth';
import { validateBody } from '../utils/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

interface CompleteSignupBody {
  userType: 'patient' | 'doctor';
  studentId?: string;
  specialization?: string;
  qualification?: string;
  registrationNumber?: string;
  phone?: string;
}

// POST /api/auth/complete-signup - Complete signup after Clerk authentication
router.post('/complete-signup', 
  clerkAuthMiddleware, 
  validateBody({
    userType: { required: true, type: 'string', enum: ['patient', 'doctor'] },
    studentId: { type: 'string' },
    specialization: { type: 'string' },
    qualification: { type: 'string' },
    registrationNumber: { type: 'string' },
    phone: { type: 'string' },
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, email, firstName, lastName } = req.auth!;
    const { 
      userType, 
      studentId, 
      specialization, 
      qualification, 
      registrationNumber, 
      phone 
    } = req.body as CompleteSignupBody;
    
    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0];

    // Check if user already completed signup
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    const { data: existingDoctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    const { data: existingRequest } = await supabase
      .from('doctor_approval_requests')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (existingPatient || existingDoctor || existingRequest) {
      return res.status(400).json({ error: 'Signup already completed' });
    }

    if (userType === 'doctor') {
      // Validate required doctor fields
      if (!specialization || !qualification || !registrationNumber) {
        return res.status(400).json({ 
          error: 'Missing required fields: specialization, qualification, registrationNumber' 
        });
      }

      // Create approval request
      const { error } = await supabase.from('doctor_approval_requests').insert({
        clerk_user_id: userId,
        full_name: fullName,
        email,
        specialization,
        qualification,
        registration_number: registrationNumber,
        phone,
        status: 'pending',
      });

      if (error) {
        console.error('Error creating doctor approval request:', error);
        throw error;
      }

      // Set role to pending_doctor
      await updateUserRole(userId, 'pending_doctor');

      console.log(`✓ Doctor registration submitted for ${email}`);

      return res.status(201).json({
        message: 'Doctor registration submitted. Awaiting admin approval.',
        status: 'pending_doctor',
      });
    } else {
      // Validate required patient fields
      if (!studentId) {
        return res.status(400).json({ error: 'Missing required field: studentId' });
      }

      // Check student ID uniqueness
      const { data: existingStudentId } = await supabase
        .from('patients')
        .select('id')
        .eq('student_id', studentId)
        .single();

      if (existingStudentId) {
        return res.status(400).json({ error: 'Student ID already registered' });
      }

      // Create patient record
      const { error } = await supabase.from('patients').insert({
        clerk_user_id: userId,
        student_id: studentId,
        full_name: fullName,
        email,
        phone,
      });

      if (error) {
        console.error('Error creating patient record:', error);
        throw error;
      }

      // Set role to patient
      await updateUserRole(userId, 'patient');

      console.log(`✓ Patient registration complete for ${email}`);

      return res.status(201).json({
        message: 'Patient registration complete',
        status: 'patient',
      });
    }
  })
);

// GET /api/auth/status - Get current user's auth status and profile completion
router.get('/status', 
  clerkAuthMiddleware, 
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, role } = req.auth!;

    let profileComplete = false;
    let rejectionReason: string | null = null;
    let profileData: any = null;

    if (role === 'patient') {
      const { data } = await supabase
        .from('patients')
        .select('*')
        .eq('clerk_user_id', userId)
        .single();
      
      profileComplete = !!data;
      profileData = data;
    } else if (role === 'doctor') {
      const { data } = await supabase
        .from('doctors')
        .select('*')
        .eq('clerk_user_id', userId)
        .single();
      
      profileComplete = !!data;
      profileData = data;
    } else if (role === 'pending_doctor') {
      const { data } = await supabase
        .from('doctor_approval_requests')
        .select('*')
        .eq('clerk_user_id', userId)
        .single();
      
      profileData = data;
      profileComplete = true; // Request exists
    } else if (role === 'rejected_doctor') {
      const { data } = await supabase
        .from('doctor_approval_requests')
        .select('rejection_reason, reviewed_at')
        .eq('clerk_user_id', userId)
        .single();
      
      rejectionReason = data?.rejection_reason || null;
      profileComplete = true;
    }

    return res.json({
      role,
      profileComplete,
      rejectionReason,
      profile: profileData,
    });
  })
);

export default router;
