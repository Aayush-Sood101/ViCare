# Phase 2 Setup Guide - Quick Start

## Prerequisites
- ✅ Phase 1 completed (database initialized, .env configured)
- ✅ Supabase project active with tables created
- ✅ Clerk application created with JWT template

## What's New in Phase 2

### 🔐 Authentication Infrastructure
- JWT verification middleware
- Role-based access control (RBAC)
- Webhook handler for auto-registration
- Manual signup completion endpoints
- User status checking

### 📁 New Files
```
src/
├── middleware/
│   ├── auth.ts              ✓ Authentication & RBAC
│   └── errorHandler.ts      ✓ Error handling
├── routes/
│   ├── webhooks.ts          ✓ Clerk webhooks
│   └── auth.ts              ✓ Auth endpoints
└── utils/
    └── validation.ts        ✓ Request validation
```

## Setup Steps

### Step 1: Verify Environment Variables

Check your `.env` file has all required values:

```bash
# Required for Phase 2
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxx
```

### Step 2: Configure Clerk Webhook

#### Option A: Local Development (Using ngrok)

1. Install ngrok:
   ```bash
   brew install ngrok  # macOS
   # or download from https://ngrok.com
   ```

2. Start your backend:
   ```bash
   cd backend
   npm run dev
   ```

3. In a new terminal, start ngrok:
   ```bash
   ngrok http 4000
   ```

4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

5. Go to Clerk Dashboard → Webhooks → Add Endpoint
   - **URL:** `https://abc123.ngrok.io/api/webhooks/clerk`
   - **Events:** Check ✓ `user.created`
   - **Save**

6. Copy the **Signing Secret** → Add to `.env`:
   ```
   CLERK_WEBHOOK_SECRET=whsec_xxxxx
   ```

7. Restart your backend to load the new secret

#### Option B: Production (When deployed)

Use your actual backend URL:
```
https://api.yourapp.com/api/webhooks/clerk
```

### Step 3: Start the Server

```bash
cd backend
npm run dev
```

Expected output:
```
✓ Database connection successful

═══════════════════════════════════════════════════════
  ViCare API Server
═══════════════════════════════════════════════════════
  Status:        Running
  Port:          4000
  Environment:   development
  URL:           http://localhost:4000
  Health Check:  http://localhost:4000/health
═══════════════════════════════════════════════════════

Phase 2 Auth Infrastructure Complete! ✓

Available Endpoints:
- POST /api/auth/complete-signup (Protected)
- GET  /api/auth/status (Protected)
- POST /api/webhooks/clerk (Webhook)
```

### Step 4: Test Basic Functionality

```bash
# Test health check
curl http://localhost:4000/health

# Should return:
# {
#   "status": "ok",
#   "phase": 2,
#   ...
# }

# Test auth endpoint (should fail without token)
curl http://localhost:4000/api/auth/status
# Should return 401 Unauthorized
```

### Step 5: Test Full Authentication Flow

#### A. Via Webhook (Recommended)

1. Make sure webhook is configured (Step 2)
2. Make sure backend is running with ngrok (for local dev)
3. Open your Clerk User & Authentication page
4. Create a test user manually OR sign up via your frontend
5. Check backend logs - you should see:
   ```
   Processing user.created webhook for testuser@example.com as patient
   ✓ Patient record created for testuser@example.com
   ```
6. Verify in Supabase `patients` table - new row should exist
7. Check Clerk user metadata - should have `role: 'patient'`

#### B. Via Manual Signup Endpoint

You need a valid Clerk JWT token for this. Get it from:
- Your frontend after login
- Clerk Dashboard → Users → [User] → [Copy JWT]
- Browser DevTools → Application → Cookies → `__session`

Then:

```bash
# Set your JWT
JWT="your_actual_jwt_here"

# Test auth status
curl -H "Authorization: Bearer $JWT" \
  http://localhost:4000/api/auth/status

# Complete signup as patient
curl -X POST http://localhost:4000/api/auth/complete-signup \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "patient",
    "studentId": "21BCE0001",
    "phone": "+919876543210"
  }'

# Expected: 201 Created
# {
#   "message": "Patient registration complete",
#   "status": "patient"
# }
```

### Step 6: Run Automated Tests

```bash
cd backend
./test-phase2.sh
```

This tests:
- ✓ Health check
- ✓ API root
- ✓ Auth without token (should fail)
- ✓ Auth with token (if JWT provided)
- ✓ Complete signup
- ✓ 404 handling

## Testing Different User Types

### Patient Registration
```bash
curl -X POST http://localhost:4000/api/auth/complete-signup \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "patient",
    "studentId": "21BCE0001",
    "phone": "+919876543210"
  }'
```

**Expected:**
- Status: 201 Created
- User role in Clerk: `patient`
- Record in `patients` table
- Can book appointments

### Doctor Registration
```bash
curl -X POST http://localhost:4000/api/auth/complete-signup \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "doctor",
    "specialization": "Cardiology",
    "qualification": "MBBS, MD",
    "registrationNumber": "MCI-67890",
    "phone": "+919876543211"
  }'
```

**Expected:**
- Status: 201 Created
- User role in Clerk: `pending_doctor`
- Record in `doctor_approval_requests` table
- Status: `pending`
- Cannot access doctor routes until approved

## Checking User Status

```bash
curl -H "Authorization: Bearer $JWT" \
  http://localhost:4000/api/auth/status
```

**For Patient:**
```json
{
  "role": "patient",
  "profileComplete": true,
  "rejectionReason": null,
  "profile": {
    "id": "...",
    "student_id": "21BCE0001",
    "full_name": "John Doe",
    ...
  }
}
```

**For Pending Doctor:**
```json
{
  "role": "pending_doctor",
  "profileComplete": true,
  "rejectionReason": null,
  "profile": {
    "id": "...",
    "status": "pending",
    "specialization": "Cardiology",
    ...
  }
}
```

## Debugging Tips

### Check Backend Logs
Backend logs show all requests and webhook processing:
```
2024-01-01T00:00:00.000Z - POST /api/auth/complete-signup
Processing user.created webhook for user@email.com as patient
✓ Patient record created for user@email.com
```

### Check Database
Verify records were created:

**Patients:**
```sql
SELECT * FROM patients ORDER BY created_at DESC LIMIT 5;
```

**Doctor Requests:**
```sql
SELECT * FROM doctor_approval_requests ORDER BY created_at DESC LIMIT 5;
```

### Check Clerk Metadata
1. Go to Clerk Dashboard → Users
2. Click on a user
3. Check "Metadata" section
4. Should see:
   ```json
   {
     "role": "patient"  // or "pending_doctor"
   }
   ```

### Common Issues

**"Missing svix headers"**
- Webhook signature verification failed
- Check webhook is configured correctly in Clerk
- Ensure ngrok URL is correct

**"Authentication failed"**
- Check `CLERK_SECRET_KEY` in `.env`
- Verify JWT token is valid (not expired)
- Ensure JWT template is configured

**"Student ID already registered"**
- Student ID must be unique
- Use different student ID or check existing records

**"Missing required fields"**
- Doctor registration needs: specialization, qualification, registrationNumber
- Patient registration needs: studentId

## Next Steps

Once Phase 2 is verified:

✅ Authentication working
✅ Webhooks processing
✅ Signup completion functional
✅ User status checking working

→ **Proceed to Phase 3: Patient & Doctor APIs**

This includes:
- Patient profile management
- Appointment booking system
- Doctor queue management
- Consultation creation
- Prescription issuance
- Medical certificate generation

See `docs/phase-3-patient-doctor-api.md` for implementation guide.

## Quick Reference

### Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/webhooks/clerk` | Webhook | Auto-register users |
| POST | `/api/auth/complete-signup` | JWT | Manual registration |
| GET | `/api/auth/status` | JWT | Get user status |

### Roles
| Role | Description | Set When |
|------|-------------|----------|
| `patient` | Regular student patient | Signup complete |
| `pending_doctor` | Doctor awaiting approval | Doctor signup |
| `doctor` | Approved doctor | Admin approves |
| `rejected_doctor` | Rejected doctor | Admin rejects |
| `admin` | System administrator | Manual seed |

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `CLERK_SECRET_KEY` | Yes | Clerk API secret |
| `CLERK_WEBHOOK_SECRET` | Yes | Webhook signing secret |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Service role key |

---

**Phase 2 Setup Complete!** Ready for Phase 3. 🎉
