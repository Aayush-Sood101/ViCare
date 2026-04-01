# Phase 1: Project Setup & Database Schema

## Objectives

1. Initialize backend Express project with TypeScript
2. Set up Supabase project and database connection
3. Create all database tables and relationships
4. Configure Clerk application
5. Set up development environment

---

## 1.1 Backend Project Initialization

### Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts      # Supabase client
│   │   └── clerk.ts         # Clerk client
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   └── index.ts             # Entry point
├── package.json
├── tsconfig.json
└── .env.example
```

### Package Installation

```bash
mkdir backend && cd backend
npm init -y
npm install express cors dotenv
npm install @clerk/express @supabase/supabase-js
npm install pdfkit uuid
npm install -D typescript @types/express @types/node @types/cors
npm install -D ts-node-dev
```

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Package Scripts (package.json)

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### Entry Point (src/index.ts)

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 1.2 Supabase Configuration

### Create Supabase Client (src/config/database.ts)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Service role client - bypasses RLS for backend operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

### Environment Variables (.env.example)

```
PORT=4000
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

---

## 1.3 Database Schema

Execute these SQL statements in the Supabase SQL Editor in order.

### Patients Table

```sql
CREATE TABLE patients (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id           TEXT UNIQUE NOT NULL,
  student_id              TEXT UNIQUE NOT NULL,
  full_name               TEXT NOT NULL,
  email                   TEXT NOT NULL,
  date_of_birth           DATE,
  gender                  TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_group             TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  phone                   TEXT,
  address                 TEXT,
  emergency_contact_name  TEXT,
  emergency_contact_phone TEXT,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_patients_clerk_user_id ON patients(clerk_user_id);
CREATE INDEX idx_patients_student_id ON patients(student_id);
```

### Doctors Table

```sql
CREATE TABLE doctors (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id       TEXT UNIQUE NOT NULL,
  full_name           TEXT NOT NULL,
  email               TEXT NOT NULL,
  specialization      TEXT,
  qualification       TEXT,
  registration_number TEXT,
  phone               TEXT,
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_doctors_clerk_user_id ON doctors(clerk_user_id);
CREATE INDEX idx_doctors_is_active ON doctors(is_active);
```

### Doctor Approval Requests Table

```sql
CREATE TABLE doctor_approval_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id       TEXT UNIQUE NOT NULL,
  full_name           TEXT NOT NULL,
  email               TEXT NOT NULL,
  specialization      TEXT,
  qualification       TEXT,
  registration_number TEXT,
  phone               TEXT,
  status              TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  rejection_reason    TEXT,
  reviewed_by         TEXT,
  reviewed_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_approval_requests_status ON doctor_approval_requests(status);
```

### Appointments Table

```sql
CREATE TABLE appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id        UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  scheduled_at     TIMESTAMPTZ NOT NULL,
  token_number     INT,
  status           TEXT CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  reason_for_visit TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
```

### Consultations Table

```sql
CREATE TABLE consultations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id       UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  chief_complaint TEXT,
  diagnosis       TEXT,
  notes           TEXT,
  vitals          JSONB,
  follow_up_date  DATE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Vitals JSONB structure:
-- {
--   "blood_pressure": "120/80",
--   "temperature": "98.6",
--   "pulse": "72",
--   "weight": "70",
--   "height": "175"
-- }

CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX idx_consultations_created_at ON consultations(created_at);
```

### Prescriptions Table

```sql
CREATE TABLE prescriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id       UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  medicines       JSONB NOT NULL,
  instructions    TEXT,
  pdf_url         TEXT,
  issued_at       TIMESTAMPTZ DEFAULT now()
);

-- Medicines JSONB structure:
-- [
--   {
--     "name": "Paracetamol",
--     "dosage": "500mg",
--     "frequency": "TDS",
--     "duration": "5 days",
--     "instructions": "After food"
--   }
-- ]

CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_consultation_id ON prescriptions(consultation_id);
```

### Medical Certificates Table

```sql
CREATE TABLE medical_certificates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id       UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  reason          TEXT NOT NULL,
  from_date       DATE NOT NULL,
  to_date         DATE NOT NULL,
  notes           TEXT,
  pdf_url         TEXT,
  issued_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_certificates_patient_id ON medical_certificates(patient_id);
```

### Update Timestamp Trigger

```sql
-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 1.4 Supabase Storage Setup

Create a private bucket for PDFs in Supabase Dashboard:

1. Go to Storage → Create Bucket
2. Name: `documents`
3. Public: **OFF** (private bucket)
4. File size limit: 10MB
5. Allowed MIME types: `application/pdf`

### Bucket Policies (via SQL Editor)

```sql
-- Allow service role full access (backend operations)
CREATE POLICY "Service role full access"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'documents');
```

---

## 1.5 Clerk Configuration

### Clerk Dashboard Setup

1. Create new application in Clerk Dashboard
2. Enable Email/Password authentication
3. Configure Sign-up form fields:
   - Email (required)
   - Password (required)
   - First Name (required)
   - Last Name (required)

### JWT Template

Create a custom JWT template named `vicare`:

```json
{
  "userId": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "{{user.public_metadata.role}}",
  "firstName": "{{user.first_name}}",
  "lastName": "{{user.last_name}}"
}
```

### Webhook Configuration

1. Go to Webhooks in Clerk Dashboard
2. Create endpoint: `https://your-backend-url/api/webhooks/clerk`
3. Subscribe to events:
   - `user.created`
4. Copy the signing secret for verification

---

## 1.6 TypeScript Types (src/types/index.ts)

```typescript
export interface Patient {
  id: string;
  clerk_user_id: string;
  student_id: string;
  full_name: string;
  email: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  blood_group?: string;
  phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  clerk_user_id: string;
  full_name: string;
  email: string;
  specialization?: string;
  qualification?: string;
  registration_number?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoctorApprovalRequest {
  id: string;
  clerk_user_id: string;
  full_name: string;
  email: string;
  specialization?: string;
  qualification?: string;
  registration_number?: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  token_number?: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  reason_for_visit?: string;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  appointment_id?: string;
  patient_id: string;
  doctor_id: string;
  chief_complaint?: string;
  diagnosis?: string;
  notes?: string;
  vitals?: {
    blood_pressure?: string;
    temperature?: string;
    pulse?: string;
    weight?: string;
    height?: string;
  };
  follow_up_date?: string;
  created_at: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  consultation_id?: string;
  patient_id: string;
  doctor_id: string;
  medicines: Medicine[];
  instructions?: string;
  pdf_url?: string;
  issued_at: string;
}

export interface MedicalCertificate {
  id: string;
  consultation_id?: string;
  patient_id: string;
  doctor_id: string;
  reason: string;
  from_date: string;
  to_date: string;
  notes?: string;
  pdf_url?: string;
  issued_at: string;
}

export type UserRole = 'patient' | 'doctor' | 'pending_doctor' | 'rejected_doctor' | 'admin';

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}
```

---

## 1.7 Verification Checklist

- [ ] Backend server starts without errors (`npm run dev`)
- [ ] Health endpoint returns 200 (`GET /health`)
- [ ] Supabase connection works (test query in SQL Editor)
- [ ] All tables created with correct indexes
- [ ] Supabase Storage bucket created
- [ ] Clerk application configured
- [ ] JWT template created in Clerk
- [ ] Webhook endpoint configured (will be implemented in Phase 2)

---

## Next Phase

[Phase 2: Auth Infrastructure & Core Middleware](./phase-2-auth.md)
