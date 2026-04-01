# Phase 2: Authentication Infrastructure & Core Middleware

## Objectives

1. Implement Clerk JWT verification middleware
2. Create role-based access control (RBAC) middleware
3. Build Clerk webhook handler for user registration
4. Implement signup completion logic (patient vs doctor flow)
5. Create Clerk metadata update utilities

---

## 2.1 Clerk Client Configuration

### src/config/clerk.ts

```typescript
import { clerkClient } from '@clerk/express';

export { clerkClient };

// Helper to update user role in Clerk metadata
export async function updateUserRole(
  clerkUserId: string,
  role: string
): Promise<void> {
  await clerkClient.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { role },
  });
}

// Helper to get user metadata
export async function getUserMetadata(clerkUserId: string) {
  const user = await clerkClient.users.getUser(clerkUserId);
  return user.publicMetadata as { role?: string };
}
```

---

## 2.2 Authentication Middleware

### src/middleware/auth.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import { clerkClient, requireAuth } from '@clerk/express';
import { AuthUser, UserRole } from '../types';

// Extend Express Request to include auth info
declare global {
  namespace Express {
    interface Request {
      auth?: AuthUser;
    }
  }
}

// Middleware: Verify Clerk JWT and attach user info
export const clerkAuthMiddleware = [
  requireAuth(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - Clerk adds auth to request
      const { userId } = req.auth;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Fetch user from Clerk to get metadata
      const user = await clerkClient.users.getUser(userId);
      const role = (user.publicMetadata?.role as UserRole) || 'patient';

      req.auth = {
        userId,
        email: user.emailAddresses[0]?.emailAddress || '',
        role,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      };

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  },
];

// Middleware: Check if user has required role(s)
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Required role: ${allowedRoles.join(' or ')}. Your role: ${req.auth.role}`
      });
    }

    next();
  };
};

// Middleware: Allow only the resource owner or specific roles
export const requireOwnerOrRole = (
  getOwnerId: (req: Request) => string | Promise<string>,
  ...allowedRoles: UserRole[]
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Admin and specified roles always have access
    if (allowedRoles.includes(req.auth.role)) {
      return next();
    }

    try {
      const ownerId = await getOwnerId(req);
      if (req.auth.userId === ownerId) {
        return next();
      }
    } catch (error) {
      console.error('Owner check error:', error);
    }

    return res.status(403).json({ error: 'Access denied' });
  };
};
```

---

## 2.3 Webhook Handler for User Registration

### src/routes/webhooks.ts

```typescript
import { Router, Request, Response } from 'express';
import { Webhook } from 'svix';
import { supabase } from '../config/database';
import { updateUserRole } from '../config/clerk';

const router = Router();

// Raw body parser for webhook verification
router.use('/clerk', (req, res, next) => {
  let data = '';
  req.on('data', chunk => { data += chunk; });
  req.on('end', () => {
    (req as any).rawBody = data;
    next();
  });
});

interface ClerkWebhookPayload {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string | null;
    last_name: string | null;
    unsafe_metadata?: {
      userType?: 'patient' | 'doctor';
      studentId?: string;
      specialization?: string;
      qualification?: string;
      registrationNumber?: string;
      phone?: string;
    };
  };
}

router.post('/clerk', async (req: Request, res: Response) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Verify webhook signature
  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  const wh = new Webhook(WEBHOOK_SECRET);
  let payload: ClerkWebhookPayload;

  try {
    payload = wh.verify((req as any).rawBody, {
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
    const { id: clerkUserId, email_addresses, first_name, last_name, unsafe_metadata } = payload.data;
    const email = email_addresses[0]?.email_address;
    const fullName = `${first_name || ''} ${last_name || ''}`.trim();
    const userType = unsafe_metadata?.userType || 'patient';

    try {
      if (userType === 'doctor') {
        // Create doctor approval request
        await supabase.from('doctor_approval_requests').insert({
          clerk_user_id: clerkUserId,
          full_name: fullName,
          email,
          specialization: unsafe_metadata?.specialization,
          qualification: unsafe_metadata?.qualification,
          registration_number: unsafe_metadata?.registrationNumber,
          phone: unsafe_metadata?.phone,
          status: 'pending',
        });

        // Set role to pending_doctor
        await updateUserRole(clerkUserId, 'pending_doctor');
        
        console.log(`Doctor approval request created for ${email}`);
      } else {
        // Create patient record
        await supabase.from('patients').insert({
          clerk_user_id: clerkUserId,
          student_id: unsafe_metadata?.studentId || `STU-${Date.now()}`,
          full_name: fullName,
          email,
          phone: unsafe_metadata?.phone,
        });

        // Set role to patient
        await updateUserRole(clerkUserId, 'patient');
        
        console.log(`Patient record created for ${email}`);
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
```

### Add svix package

```bash
npm install svix
```

---

## 2.4 Alternative: Manual Signup Completion Endpoint

For cases where webhook isn't used, provide a manual endpoint:

### src/routes/auth.ts

```typescript
import { Router, Request, Response } from 'express';
import { supabase } from '../config/database';
import { updateUserRole, clerkClient } from '../config/clerk';
import { clerkAuthMiddleware } from '../middleware/auth';

const router = Router();

interface CompleteSignupBody {
  userType: 'patient' | 'doctor';
  studentId?: string;
  specialization?: string;
  qualification?: string;
  registrationNumber?: string;
  phone?: string;
}

// Complete signup after Clerk authentication
router.post('/complete-signup', clerkAuthMiddleware, async (req: Request, res: Response) => {
  const { userId, email, firstName, lastName } = req.auth!;
  const { userType, studentId, specialization, qualification, registrationNumber, phone } = req.body as CompleteSignupBody;
  
  const fullName = `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0];

  try {
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

      if (error) throw error;

      await updateUserRole(userId, 'pending_doctor');

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

      if (error) throw error;

      await updateUserRole(userId, 'patient');

      return res.status(201).json({
        message: 'Patient registration complete',
        status: 'patient',
      });
    }
  } catch (error) {
    console.error('Complete signup error:', error);
    return res.status(500).json({ error: 'Failed to complete signup' });
  }
});

// Get current user's status
router.get('/status', clerkAuthMiddleware, async (req: Request, res: Response) => {
  const { userId, role } = req.auth!;

  try {
    let profileComplete = false;
    let rejectionReason: string | null = null;

    if (role === 'patient') {
      const { data } = await supabase
        .from('patients')
        .select('id')
        .eq('clerk_user_id', userId)
        .single();
      profileComplete = !!data;
    } else if (role === 'doctor') {
      const { data } = await supabase
        .from('doctors')
        .select('id')
        .eq('clerk_user_id', userId)
        .single();
      profileComplete = !!data;
    } else if (role === 'rejected_doctor') {
      const { data } = await supabase
        .from('doctor_approval_requests')
        .select('rejection_reason')
        .eq('clerk_user_id', userId)
        .single();
      rejectionReason = data?.rejection_reason || null;
    }

    return res.json({
      role,
      profileComplete,
      rejectionReason,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({ error: 'Failed to get status' });
  }
});

export default router;
```

---

## 2.5 Error Handling Middleware

### src/middleware/errorHandler.ts

```typescript
import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Async handler wrapper to catch errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

---

## 2.6 Request Validation Utilities

### src/utils/validation.ts

```typescript
import { Request, Response, NextFunction } from 'express';

type ValidationSchema = {
  [key: string]: {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
    enum?: any[];
    minLength?: number;
    maxLength?: number;
  };
};

export const validateBody = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          if (!(rules.type === 'array' && Array.isArray(value))) {
            errors.push(`${field} must be of type ${rules.type}`);
          }
        }

        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
        }

        if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }

        if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  };
};
```

---

## 2.7 Updated Entry Point

### src/index.ts

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import webhookRoutes from './routes/webhooks';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Webhook routes need raw body - mount before json parser
app.use('/api/webhooks', webhookRoutes);

// JSON parsing for all other routes
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`ViCare API server running on port ${PORT}`);
});
```

---

## 2.8 Environment Variables Update

Add to `.env`:

```
CLERK_WEBHOOK_SECRET=whsec_xxx
FRONTEND_URL=http://localhost:3000
```

---

## 2.9 Testing the Auth Flow

### Test Complete Signup (Patient)

```bash
# After signing up via Clerk, call complete-signup
curl -X POST http://localhost:4000/api/auth/complete-signup \
  -H "Authorization: Bearer <clerk_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "patient",
    "studentId": "21BCE0001",
    "phone": "+919876543210"
  }'
```

### Test Complete Signup (Doctor)

```bash
curl -X POST http://localhost:4000/api/auth/complete-signup \
  -H "Authorization: Bearer <clerk_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "doctor",
    "specialization": "General Medicine",
    "qualification": "MBBS, MD",
    "registrationNumber": "MCI-12345",
    "phone": "+919876543210"
  }'
```

### Test Auth Status

```bash
curl -X GET http://localhost:4000/api/auth/status \
  -H "Authorization: Bearer <clerk_jwt_token>"
```

---

## 2.10 Verification Checklist

- [ ] Clerk JWT verification works
- [ ] Role middleware correctly gates routes
- [ ] Webhook handler verifies signatures and processes user.created
- [ ] Complete signup endpoint creates correct records
- [ ] Patient signup sets role to `patient`
- [ ] Doctor signup sets role to `pending_doctor`
- [ ] Auth status endpoint returns correct role and profile status
- [ ] Error handling middleware catches and formats errors

---

## Next Phase

[Phase 3: Patient & Doctor Backend APIs](./phase-3-patient-doctor-api.md)
