# Phase 1 Setup - Quick Start Guide

## ✓ What Has Been Created

### Backend Structure
```
backend/
├── database/
│   └── init.sql              ← Run this in Supabase SQL Editor
├── src/
│   ├── config/
│   │   ├── database.ts       ← Supabase client
│   │   └── clerk.ts          ← Clerk client with helper functions
│   ├── types/
│   │   └── index.ts          ← All TypeScript interfaces
│   ├── middleware/           ← (Phase 2)
│   ├── routes/               ← (Phase 2+)
│   ├── services/             ← (Phase 3+)
│   ├── utils/                ← (Phase 2+)
│   ├── scripts/              ← (Phase 4)
│   └── index.ts              ← Main server entry point
├── .env.example              ← Template for environment variables
├── .gitignore
├── package.json              ← Dependencies installed ✓
├── tsconfig.json             ← TypeScript configuration
└── README.md                 ← Detailed documentation
```

## 🚀 Next Steps (Do These Now)

### 1. Create Environment File
```bash
cd backend
cp .env.example .env
```

Then edit `.env` with your actual credentials:
- Get Clerk keys from: https://dashboard.clerk.com
- Get Supabase keys from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

### 2. Initialize Database
1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of `backend/database/init.sql`
3. Paste and click "Run"
4. Wait for success message with ✓ symbols

This creates:
- 7 tables (patients, doctors, appointments, etc.)
- All indexes and constraints
- Triggers for auto-updating timestamps
- Comments for documentation

### 3. Create Storage Bucket
1. In Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Name: `documents`
4. **Important:** Make it PRIVATE (not public)
5. File size limit: 10MB
6. Allowed types: `application/pdf`

### 4. Configure Clerk

#### A. Create JWT Template
1. Go to Clerk Dashboard → JWT Templates
2. Click "New template"
3. Name it: `vicare`
4. Paste this JSON:
```json
{
  "userId": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "{{user.public_metadata.role}}",
  "firstName": "{{user.first_name}}",
  "lastName": "{{user.last_name}}"
}
```
5. Save

#### B. Enable Authentication Methods
1. Go to User & Authentication → Email, Phone, Username
2. Enable "Email address" + "Password"
3. Save changes

### 5. Start the Server
```bash
cd backend
npm run dev
```

You should see:
```
═══════════════════════════════════════════════════════
  ViCare API Server
═══════════════════════════════════════════════════════
  Status:        Running
  Port:          4000
  Environment:   development
  URL:           http://localhost:4000
  Health Check:  http://localhost:4000/health
═══════════════════════════════════════════════════════

Phase 1 Setup Complete! ✓
```

### 6. Test the Setup
Open a new terminal and run:
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

## 📋 Verification Checklist

Before proceeding to Phase 2, verify:

- [ ] Backend dependencies installed (`node_modules/` exists)
- [ ] `.env` file created with all credentials
- [ ] Database tables created in Supabase (check Tables section)
- [ ] Storage bucket `documents` created (private)
- [ ] Clerk JWT template created
- [ ] Server starts without errors (`npm run dev`)
- [ ] Health check returns 200 OK
- [ ] Database connection test passes (in server logs)

## 🔍 Troubleshooting

### Server won't start
```bash
# Check if .env exists
ls -la .env

# Verify environment variables are loaded
cat .env
```

### Database connection fails
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `.env`
- Check Supabase project is not paused
- Ensure `init.sql` was run successfully

### TypeScript errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Port 4000 already in use
Edit `.env` and change:
```
PORT=4001
```

## 📁 Database Schema Summary

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `patients` | Student patient records | clerk_user_id, student_id, blood_group |
| `doctors` | Approved doctor profiles | clerk_user_id, specialization, is_active |
| `doctor_approval_requests` | Pending doctor registrations | status, rejection_reason |
| `appointments` | Appointment bookings | patient_id, doctor_id, token_number, status |
| `consultations` | Medical consultation records | diagnosis, vitals, notes |
| `prescriptions` | Prescription records + PDF | medicines (JSONB), pdf_url |
| `medical_certificates` | Medical certificates | reason, from_date, to_date, pdf_url |

## 🎯 What's Next?

Once Phase 1 is verified and working:

→ **Proceed to Phase 2: Authentication & Middleware**
- Implement Clerk JWT verification
- Create role-based access control (RBAC)
- Build webhook handler for user registration
- Implement signup completion flow

See `docs/phase-2-auth.md` for detailed implementation steps.

## 📞 Need Help?

Common issues:
1. **Missing env variables** → Copy from `.env.example`
2. **Database errors** → Re-run `init.sql`
3. **Clerk errors** → Check API keys are correct
4. **Port conflicts** → Change PORT in `.env`

Check backend logs for detailed error messages!
