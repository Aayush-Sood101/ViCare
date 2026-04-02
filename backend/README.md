# ViCare Backend - Phase 1 Setup Complete

## Overview

This is the Express.js backend API for the ViCare healthcare platform.

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your actual credentials
```

## Environment Configuration

Create a `.env` file with the following variables:

```env
PORT=4000
NODE_ENV=development

# Clerk (get from clerk.com dashboard)
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# Supabase (get from supabase.com project settings)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbG...

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Admin email (for seeding admin user)
ADMIN_EMAIL=admin@vicare.edu
```

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `database/init.sql`
4. Paste and run it in the SQL Editor
5. Wait for completion message

This will create:
- All database tables (patients, doctors, appointments, etc.)
- Indexes for query optimization
- Triggers for auto-updating timestamps
- Comments for documentation

## Supabase Storage Setup

1. Go to Storage in Supabase Dashboard
2. Create a new bucket named `documents`
3. Set it to **PRIVATE** (not public)
4. This will store prescription and certificate PDFs

## Clerk Setup

### 1. Create Clerk Application
- Go to https://clerk.com
- Create a new application
- Choose "Email/Password" authentication

### 2. Get API Keys
- Copy `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY`
- Add them to your `.env` file

### 3. Create JWT Template
- Go to JWT Templates in Clerk Dashboard
- Create a new template named `vicare`
- Use this content:

```json
{
  "userId": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "{{user.public_metadata.role}}",
  "firstName": "{{user.first_name}}",
  "lastName": "{{user.last_name}}"
}
```

### 4. User Registration Flow
- Users sign up via Clerk in the frontend
- Frontend calls `/api/auth/complete-signup` to create database records
- No webhooks required (frontend-driven registration)
- See `docs/FRONTEND_REGISTRATION.md` for complete guide

## Running the Server

```bash
# Development mode (auto-reload on changes)
npm run dev

# Production build
npm run build
npm start
```

## Testing

Once the server is running:

```bash
# Test health endpoint
curl http://localhost:4000/health

# Should return:
# {
#   "status": "ok",
#   "timestamp": "2024-01-01T00:00:00.000Z",
#   "environment": "development",
#   "version": "1.0.0"
# }
```

## Project Structure

```
backend/
├── database/
│   └── init.sql              # Database schema initialization
├── src/
│   ├── config/
│   │   ├── database.ts       # Supabase client
│   │   └── clerk.ts          # Clerk client
│   ├── middleware/           # Express middleware (Phase 2)
│   ├── routes/               # API routes (Phase 2+)
│   ├── services/             # Business logic (Phase 3+)
│   ├── utils/                # Utility functions (Phase 2+)
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── scripts/
│   │   └── seedAdmin.ts      # Admin user seeding (Phase 4)
│   └── index.ts              # Application entry point
├── .env                      # Environment variables (create from .env.example)
├── .env.example              # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Phase 1 Checklist

- [x] Backend project initialized with TypeScript
- [x] All dependencies installed
- [x] Environment configuration created (.env.example)
- [x] Database schema SQL file created
- [x] Supabase client configured
- [x] Clerk client configured
- [x] TypeScript types defined
- [x] Basic Express server running
- [x] Health check endpoint working

## What You Need To Do

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Clerk and Supabase credentials
   ```

3. **Initialize Database**
   - Open Supabase SQL Editor
   - Run the `database/init.sql` file
   - Verify tables are created

4. **Create Storage Bucket**
   - In Supabase Dashboard → Storage
   - Create bucket named `documents` (private)

5. **Configure Clerk**
   - Create JWT template (see above)
   - Copy API keys to `.env`

6. **Start Server**
   ```bash
   npm run dev
   ```

7. **Verify Setup**
   ```bash
   curl http://localhost:4000/health
   ```

## Next Steps

Once Phase 1 is complete and verified:
- Proceed to **Phase 2**: Authentication & Middleware
- See `docs/phase-2-auth.md` for implementation guide

## Troubleshooting

### Database connection fails
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in `.env`
- Ensure database schema was initialized
- Check Supabase project is active

### TypeScript errors
- Run `npm install` to ensure all dependencies are installed
- Check `tsconfig.json` is present

### Port already in use
- Change `PORT` in `.env` to a different port (e.g., 4001)

## Support

For issues or questions:
1. Check the phase documentation in `/docs`
2. Verify all environment variables are set correctly
3. Check server logs for detailed error messages
