import { Router, Request, Response } from 'express';
import { Webhook } from 'svix';
import { supabase } from '../config/database';
import { updateUserRole } from '../config/clerk';
import { ClerkWebhookPayload } from '../types';

const router = Router();

// Webhook handler - needs raw body for signature verification
// This route is mounted BEFORE json parser in main index.ts
router.post('/clerk', async (req: Request, res: Response) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET environment variable');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Get the headers
  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  // Get the body
  const body = req.body;
  
  // Verify webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let payload: ClerkWebhookPayload;

  try {
    payload = wh.verify(JSON.stringify(body), {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkWebhookPayload;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Handle user.created event
  if (payload.type === 'user.created') {
    const { 
      id: clerkUserId, 
      email_addresses, 
      first_name, 
      last_name, 
      unsafe_metadata 
    } = payload.data;
    
    const email = email_addresses[0]?.email_address;
    const fullName = `${first_name || ''} ${last_name || ''}`.trim() || email?.split('@')[0] || 'User';
    const userType = unsafe_metadata?.userType || 'patient';

    console.log(`Processing user.created webhook for ${email} as ${userType}`);

    try {
      if (userType === 'doctor') {
        // Create doctor approval request
        const { error } = await supabase.from('doctor_approval_requests').insert({
          clerk_user_id: clerkUserId,
          full_name: fullName,
          email,
          specialization: unsafe_metadata?.specialization,
          qualification: unsafe_metadata?.qualification,
          registration_number: unsafe_metadata?.registrationNumber,
          phone: unsafe_metadata?.phone,
          status: 'pending',
        });

        if (error) {
          console.error('Error creating doctor approval request:', error);
          return res.status(500).json({ error: 'Failed to create approval request' });
        }

        // Set role to pending_doctor
        await updateUserRole(clerkUserId, 'pending_doctor');
        
        console.log(`✓ Doctor approval request created for ${email}`);
      } else {
        // Create patient record
        const studentId = unsafe_metadata?.studentId || `STU-${Date.now()}`;
        
        const { error } = await supabase.from('patients').insert({
          clerk_user_id: clerkUserId,
          student_id: studentId,
          full_name: fullName,
          email,
          phone: unsafe_metadata?.phone,
        });

        if (error) {
          console.error('Error creating patient record:', error);
          return res.status(500).json({ error: 'Failed to create patient record' });
        }

        // Set role to patient
        await updateUserRole(clerkUserId, 'patient');
        
        console.log(`✓ Patient record created for ${email}`);
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error processing user.created webhook:', error);
      return res.status(500).json({ error: 'Failed to process webhook' });
    }
  }

  // Acknowledge other event types
  return res.status(200).json({ received: true });
});

export default router;
