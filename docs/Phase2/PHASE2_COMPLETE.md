# ✅ Phase 2 Implementation Complete

## What Has Been Implemented

### 1. Authentication Middleware (`src/middleware/auth.ts`)
✓ **clerkAuthMiddleware** - Verifies Clerk JWT and attaches user info to request
  - Extracts userId from Clerk JWT
  - Fetches user metadata (role) from Clerk
  - Attaches AuthUser object to req.auth
  
✓ **requireRole** - Role-based access control middleware
  - Checks if user has required role(s)
  - Returns 403 Forbidden if role doesn't match
  - Supports multiple allowed roles
  
✓ **requireOwnerOrRole** - Owner or role-based access
  - Allows resource owner OR specified roles
  - Useful for "view own data" or admin override scenarios

### 2. Error Handling (`src/middleware/errorHandler.ts`)
✓ **errorHandler** - Global error handling middleware
  - Catches all errors thrown in route handlers
  - Returns consistent error response format
  - Includes stack trace in development mode
  
✓ **asyncHandler** - Wraps async route handlers
  - Automatically catches Promise rejections
  - Forwards errors to error handling middleware
  
✓ **createError** - Custom error creator
  - Creates errors with custom status codes
  - Useful for throwing specific HTTP errors

### 3. Request Validation (`src/utils/validation.ts`)
✓ **validateBody** - Validates request body
  - Type checking (string, number, boolean, array, object)
  - Required field validation
  - Enum validation
  - Length/range validation (min/max)
  - Returns 400 with detailed error messages
  
✓ **validateQuery** - Validates query parameters
  - Similar validation as body
  - Handles query string parsing

### 4. Webhook Handler (`src/routes/webhooks.ts`)
✓ **POST /api/webhooks/clerk** - Clerk webhook handler
  - Verifies webhook signature using Svix
  - Handles `user.created` event
  - Patient flow:
    - Creates patient record in database
    - Sets role to 'patient' in Clerk metadata
  - Doctor flow:
    - Creates doctor_approval_requests record
    - Sets role to 'pending_doctor' in Clerk metadata
  - Logs all webhook processing

### 5. Auth Routes (`src/routes/auth.ts`)
✓ **POST /api/auth/complete-signup** - Manual signup completion
  - Alternative to webhook for completing registration
  - Validates user type (patient or doctor)
  - Patient: requires studentId
  - Doctor: requires specialization, qualification, registrationNumber
  - Prevents duplicate registrations
  - Updates Clerk metadata with appropriate role
  
✓ **GET /api/auth/status** - Get current user status
  - Returns user's role and profile completion status
  - For rejected doctors: includes rejection reason
  - Returns profile data if exists
  - Protected by clerkAuthMiddleware

### 6. Updated Main Server (`src/index.ts`)
✓ Integrated all Phase 2 routes
✓ Webhook route mounted BEFORE JSON parser (for raw body access)
✓ Auth routes mounted with JSON parser
✓ Error handler middleware at the end
✓ Enhanced health check with phase number
✓ Updated API root with phase info and endpoints

## File Structure

```
backend/src/
├── config/
│   ├── database.ts          ✓ (Phase 1)
│   └── clerk.ts             ✓ (Phase 1)
├── middleware/
│   ├── auth.ts              ✓ NEW - Authentication & RBAC
│   └── errorHandler.ts      ✓ NEW - Error handling
├── routes/
│   ├── webhooks.ts          ✓ NEW - Clerk webhooks
│   └── auth.ts              ✓ NEW - Auth endpoints
├── utils/
│   └── validation.ts        ✓ NEW - Request validation
├── types/
│   └── index.ts             ✓ (Phase 1)
└── index.ts                 ✓ UPDATED - Integrated Phase 2
```

## API Endpoints Added

### Webhooks
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/webhooks/clerk` | Clerk user.created webhook | Webhook signature |

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/complete-signup` | Complete user registration | Clerk JWT |
| GET | `/api/auth/status` | Get user status and profile | Clerk JWT |

## Testing Phase 2

### 1. Start the Server
```bash
cd backend
npm run dev
```

Expected output:
```
✓ Database connection successful
Server running on port 4000
Phase 2 Setup Complete! ✓
```

### 2. Test Health Check
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "version": "1.0.0",
  "phase": 2
}
```

### 3. Test Auth Status (Without Token - Should Fail)
```bash
curl http://localhost:4000/api/auth/status
```

Expected: 401 Unauthorized

### 4. Test Auth Status (With Clerk JWT)
```bash
curl -H "Authorization: Bearer YOUR_CLERK_JWT" \
  http://localhost:4000/api/auth/status
```

Expected: 200 OK with user status

### 5. Test Complete Signup - Patient
```bash
curl -X POST http://localhost:4000/api/auth/complete-signup \
  -H "Authorization: Bearer YOUR_CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "patient",
    "studentId": "21BCE0001",
    "phone": "+919876543210"
  }'
```

Expected: 201 Created with success message

### 6. Test Complete Signup - Doctor
```bash
curl -X POST http://localhost:4000/api/auth/complete-signup \
  -H "Authorization: Bearer YOUR_CLERK_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "doctor",
    "specialization": "General Medicine",
    "qualification": "MBBS, MD",
    "registrationNumber": "MCI-12345",
    "phone": "+919876543210"
  }'
```

Expected: 201 Created with pending approval message

### 7. Run Automated Tests
```bash
cd backend
./test-phase2.sh
```

## Clerk Configuration for Phase 2

### 1. JWT Template (If not done in Phase 1)
Create in Clerk Dashboard → JWT Templates:

**Name:** `vicare`

**Claims:**
```json
{
  "userId": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "{{user.public_metadata.role}}",
  "firstName": "{{user.first_name}}",
  "lastName": "{{user.last_name}}"
}
```

### 2. Webhook Setup
1. Go to Clerk Dashboard → Webhooks
2. Click "Add Endpoint"
3. **Endpoint URL:** `https://your-backend-url/api/webhooks/clerk`
   - For local testing: Use ngrok or similar tunnel
   - `ngrok http 4000` then use the ngrok URL
4. **Subscribe to events:**
   - ✓ user.created
5. Copy the **Signing Secret**
6. Add to `.env`:
   ```
   CLERK_WEBHOOK_SECRET=whsec_xxxxx
   ```

### 3. Test Webhook Flow
1. Configure webhook as above
2. Start backend server
3. Sign up a new user via Clerk (frontend or Clerk dashboard)
4. Check backend logs - you should see:
   ```
   Processing user.created webhook for user@email.com as patient
   ✓ Patient record created for user@email.com
   ```
5. Verify in Supabase:
   - `patients` table has new row
   - User's Clerk metadata has `role: 'patient'`

## Middleware Usage Examples

### Example 1: Protected Route (Any Authenticated User)
```typescript
router.get('/profile', clerkAuthMiddleware, async (req, res) => {
  const { userId, role } = req.auth!;
  res.json({ userId, role });
});
```

### Example 2: Role-Restricted Route (Admin Only)
```typescript
router.get('/admin/dashboard', 
  clerkAuthMiddleware, 
  requireRole('admin'), 
  async (req, res) => {
    // Only admins can access this
    res.json({ message: 'Admin dashboard' });
  }
);
```

### Example 3: Multiple Allowed Roles
```typescript
router.get('/patients/:id', 
  clerkAuthMiddleware, 
  requireRole('doctor', 'admin'), 
  async (req, res) => {
    // Doctors and admins can access
    const { id } = req.params;
    // ... fetch patient
  }
);
```

### Example 4: With Validation
```typescript
router.post('/appointments', 
  clerkAuthMiddleware,
  requireRole('patient'),
  validateBody({
    doctor_id: { required: true, type: 'string' },
    scheduled_at: { required: true, type: 'string' },
    reason_for_visit: { type: 'string', maxLength: 500 },
  }),
  asyncHandler(async (req, res) => {
    // Validated and typed request body
    const { doctor_id, scheduled_at, reason_for_visit } = req.body;
    // ... create appointment
  })
);
```

### Example 5: Owner or Role Access
```typescript
router.get('/patients/:id/records',
  clerkAuthMiddleware,
  requireOwnerOrRole(
    async (req) => {
      // Get patient's Clerk user ID
      const { data } = await supabase
        .from('patients')
        .select('clerk_user_id')
        .eq('id', req.params.id)
        .single();
      return data?.clerk_user_id || '';
    },
    'doctor',
    'admin'
  ),
  async (req, res) => {
    // Patient can view own records OR doctor/admin can view any
    // ... fetch records
  }
);
```

## Error Handling Examples

### Using asyncHandler
```typescript
router.get('/data', 
  clerkAuthMiddleware,
  asyncHandler(async (req, res) => {
    // Any errors thrown here are caught automatically
    const data = await someAsyncOperation();
    if (!data) {
      throw createError('Data not found', 404);
    }
    res.json(data);
  })
);
```

### Without asyncHandler (Manual)
```typescript
router.get('/data', clerkAuthMiddleware, async (req, res, next) => {
  try {
    const data = await someAsyncOperation();
    res.json(data);
  } catch (error) {
    next(error); // Forward to error handler
  }
});
```

## Verification Checklist

- [x] Authentication middleware implemented
- [x] Role-based access control implemented
- [x] Error handling middleware implemented
- [x] Request validation utilities implemented
- [x] Webhook handler with signature verification
- [x] Complete signup endpoint (patient & doctor)
- [x] Auth status endpoint
- [x] Main server updated with all routes
- [x] TypeScript compiles without errors
- [x] Server starts successfully
- [x] Health check returns phase 2
- [x] Unauthorized requests return 401
- [x] Test script created

## Common Issues & Solutions

### Issue: Webhook signature verification fails
**Solution:** 
- Check `CLERK_WEBHOOK_SECRET` in `.env`
- Make sure you're using the raw body for verification
- Webhook route must be before JSON parser

### Issue: JWT verification fails
**Solution:**
- Check `CLERK_SECRET_KEY` in `.env`
- Ensure JWT template is created in Clerk
- Verify Bearer token format in Authorization header

### Issue: Role not found in user metadata
**Solution:**
- Ensure JWT template includes role from publicMetadata
- Check that role was set via `updateUserRole()` function
- Verify in Clerk dashboard that user has role in metadata

### Issue: TypeScript errors about req.auth
**Solution:**
- Already handled with `declare global` in `auth.ts`
- Make sure to use clerkAuthMiddleware before accessing `req.auth`

## Next Steps

Phase 2 is complete! You can now:

1. **Test authentication flow:**
   - Sign up users via Clerk
   - Complete profile via `/api/auth/complete-signup`
   - Check status via `/api/auth/status`

2. **Verify webhook processing:**
   - Configure webhook in Clerk
   - Sign up a new user
   - Check database for new records

3. **Move to Phase 3:**
   - Patient & Doctor API endpoints
   - Appointment booking system
   - Consultation management
   - Prescription creation

See `docs/phase-3-patient-doctor-api.md` for next phase implementation.

## Summary

✅ **Phase 2 Complete!**

- Authentication infrastructure fully implemented
- Clerk JWT verification working
- Role-based access control functional
- Webhook handler processing user creation
- Error handling and validation in place
- All TypeScript types defined
- Server running with Phase 2 features

**Total Files Created/Updated:**
- 5 new files created
- 1 file updated (index.ts)
- 1 test script created

**Ready for Phase 3: Patient & Doctor Backend APIs!** 🚀
