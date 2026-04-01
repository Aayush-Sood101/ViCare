-- ViCare Database Schema
-- Run this SQL file in Supabase SQL Editor to create all tables
-- Execute in order as written

-- ==================== PATIENTS TABLE ====================

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

-- Indexes for patients
CREATE INDEX idx_patients_clerk_user_id ON patients(clerk_user_id);
CREATE INDEX idx_patients_student_id ON patients(student_id);
CREATE INDEX idx_patients_email ON patients(email);

COMMENT ON TABLE patients IS 'Stores patient (student) information';

-- ==================== DOCTORS TABLE ====================

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

-- Indexes for doctors
CREATE INDEX idx_doctors_clerk_user_id ON doctors(clerk_user_id);
CREATE INDEX idx_doctors_is_active ON doctors(is_active);
CREATE INDEX idx_doctors_email ON doctors(email);

COMMENT ON TABLE doctors IS 'Stores approved doctor information';

-- ==================== DOCTOR APPROVAL REQUESTS TABLE ====================

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

-- Indexes for approval requests
CREATE INDEX idx_approval_requests_status ON doctor_approval_requests(status);
CREATE INDEX idx_approval_requests_clerk_user_id ON doctor_approval_requests(clerk_user_id);
CREATE INDEX idx_approval_requests_created_at ON doctor_approval_requests(created_at);

COMMENT ON TABLE doctor_approval_requests IS 'Stores doctor registration requests pending admin approval';

-- ==================== APPOINTMENTS TABLE ====================

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

-- Indexes for appointments
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, scheduled_at);

COMMENT ON TABLE appointments IS 'Stores appointment bookings between patients and doctors';

-- ==================== CONSULTATIONS TABLE ====================

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

-- Indexes for consultations
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX idx_consultations_appointment_id ON consultations(appointment_id);
CREATE INDEX idx_consultations_created_at ON consultations(created_at);

COMMENT ON TABLE consultations IS 'Stores medical consultation records';
COMMENT ON COLUMN consultations.vitals IS 'JSONB: {blood_pressure, temperature, pulse, weight, height}';

-- ==================== PRESCRIPTIONS TABLE ====================

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

-- Indexes for prescriptions
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_consultation_id ON prescriptions(consultation_id);
CREATE INDEX idx_prescriptions_issued_at ON prescriptions(issued_at);

COMMENT ON TABLE prescriptions IS 'Stores prescription records with medicines and PDF storage path';
COMMENT ON COLUMN prescriptions.medicines IS 'JSONB array: [{name, dosage, frequency, duration, instructions}]';
COMMENT ON COLUMN prescriptions.pdf_url IS 'Supabase Storage path (not signed URL)';

-- ==================== MEDICAL CERTIFICATES TABLE ====================

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

-- Indexes for medical certificates
CREATE INDEX idx_certificates_patient_id ON medical_certificates(patient_id);
CREATE INDEX idx_certificates_doctor_id ON medical_certificates(doctor_id);
CREATE INDEX idx_certificates_issued_at ON medical_certificates(issued_at);

COMMENT ON TABLE medical_certificates IS 'Stores medical certificates issued by doctors';
COMMENT ON COLUMN medical_certificates.pdf_url IS 'Supabase Storage path (not signed URL)';

-- ==================== TRIGGERS FOR UPDATED_AT ====================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to patients table
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to doctors table
CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON doctors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to appointments table
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================== ROW LEVEL SECURITY (RLS) ====================
-- Note: RLS is disabled for now since backend uses service role
-- If you want to enable RLS for additional security, uncomment these

-- ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE doctor_approval_requests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE medical_certificates ENABLE ROW LEVEL SECURITY;

-- Service role bypass (if RLS enabled)
-- CREATE POLICY "Service role bypass" ON patients FOR ALL TO service_role USING (true);
-- CREATE POLICY "Service role bypass" ON doctors FOR ALL TO service_role USING (true);
-- (Repeat for all tables)

-- ==================== COMPLETION MESSAGE ====================

DO $$
BEGIN
    RAISE NOTICE '✓ ViCare database schema initialized successfully!';
    RAISE NOTICE '✓ Created tables: patients, doctors, doctor_approval_requests, appointments, consultations, prescriptions, medical_certificates';
    RAISE NOTICE '✓ Created indexes for query optimization';
    RAISE NOTICE '✓ Created triggers for auto-updating timestamps';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Create a Storage bucket named "documents" in Supabase Dashboard';
    RAISE NOTICE '2. Set bucket to PRIVATE (not public)';
    RAISE NOTICE '3. Configure your backend .env file with SUPABASE_URL and SUPABASE_SERVICE_KEY';
END $$;
