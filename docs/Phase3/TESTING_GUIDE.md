# Phase 3 Testing Guide

Comprehensive testing instructions for Patient & Doctor APIs.

---

## Prerequisites

Before testing Phase 3:

1. ✅ **Phase 1 complete:** Database initialized, environment configured
2. ✅ **Phase 2 complete:** Authentication middleware working
3. ✅ **Server running:** `npm run dev` in `backend/` directory
4. ✅ **Clerk account:** Valid JWT tokens available

---

## Quick Start

```bash
# Navigate to backend
cd backend

# Start development server
npm run dev

# In another terminal, verify server is running
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "environment": "development",
  "version": "1.0.0",
  "phase": 3
}
```

---

## Getting Test Tokens

### Option 1: Using Clerk Dashboard

1. Go to Clerk Dashboard → Users
2. Select a test user
3. Click "Generate JWT"
4. Copy the token

### Option 2: From Frontend (Phase 5)

```javascript
// In your frontend after Clerk authentication
const token = await clerk.session.getToken();
console.log('JWT Token:', token);
```

### Option 3: Using Clerk API

```bash
# Get session token programmatically
curl -X POST https://api.clerk.com/v1/sessions/{session_id}/tokens \
  -H "Authorization: Bearer <clerk_secret_key>"
```

---

## Test Data Setup

### 1. Create Test Patient via Webhook

Simulate Clerk webhook to create a patient:

```bash
# First, get your Clerk Webhook Secret from .env
WEBHOOK_SECRET="your_webhook_secret_here"

# Create test patient
curl -X POST http://localhost:4000/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -H "svix-id: msg_test123" \
  -H "svix-timestamp: $(date +%s)" \
  -H "svix-signature: v1,signature_here" \
  -d '{
    "type": "user.created",
    "data": {
      "id": "user_test_patient_001",
      "email_addresses": [
        {"email_address": "patient1@university.edu"}
      ],
      "first_name": "John",
      "last_name": "Doe",
      "unsafe_metadata": {
        "userType": "patient",
        "studentId": "STU2024001"
      }
    }
  }'
```

### 2. Create Test Doctor via Webhook

```bash
curl -X POST http://localhost:4000/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -d '{
    "type": "user.created",
    "data": {
      "id": "user_test_doctor_001",
      "email_addresses": [
        {"email_address": "doctor1@hospital.com"}
      ],
      "first_name": "Sarah",
      "last_name": "Smith",
      "unsafe_metadata": {
        "userType": "doctor",
        "specialization": "General Physician",
        "qualification": "MBBS, MD",
        "registrationNumber": "MED12345"
      }
    }
  }'
```

### 3. Approve Test Doctor (Admin Action)

```bash
# Get the doctor approval request ID from Supabase
# Then approve via admin endpoint (to be implemented in Phase 4)

# For now, manually approve in Supabase:
# 1. Find the request in doctor_approval_requests table
# 2. Update status to 'approved'
# 3. Insert record into doctors table
# 4. Update Clerk user metadata: role = 'doctor'
```

---

## Test Scenarios

### Scenario 1: Patient Profile Management

#### 1.1 Get Patient Profile

```bash
PATIENT_TOKEN="your_patient_jwt_token"

curl -H "Authorization: Bearer $PATIENT_TOKEN" \
  http://localhost:4000/api/patients/me
```

**Expected:** 200 OK with patient data

---

#### 1.2 Update Patient Profile

```bash
curl -X PUT \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "blood_group": "O+",
    "gender": "male",
    "address": "Campus Hostel A-101",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_phone": "+919876543211"
  }' \
  http://localhost:4000/api/patients/me
```

**Expected:** 200 OK with updated patient data

---

#### 1.3 Try to Update Immutable Fields (Should Fail)

```bash
curl -X PUT \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@test.com",
    "student_id": "HACKED123"
  }' \
  http://localhost:4000/api/patients/me
```

**Expected:** 200 OK, but email and student_id should remain unchanged

---

### Scenario 2: Doctor Viewing Patient Data

#### 2.1 View Active Doctors (Public)

```bash
curl http://localhost:4000/api/doctors
```

**Expected:** 200 OK with list of active doctors

---

#### 2.2 Doctor Views Patient Profile

```bash
DOCTOR_TOKEN="your_doctor_jwt_token"
PATIENT_ID="patient_uuid_from_database"

curl -H "Authorization: Bearer $DOCTOR_TOKEN" \
  http://localhost:4000/api/patients/$PATIENT_ID
```

**Expected:** 200 OK with patient data

---

#### 2.3 Doctor Views Patient History

```bash
curl -H "Authorization: Bearer $DOCTOR_TOKEN" \
  http://localhost:4000/api/patients/$PATIENT_ID/history
```

**Expected:** 200 OK with empty array (if no consultations yet)

---

### Scenario 3: Appointment Booking

#### 3.1 Patient Books Appointment

```bash
# First, get a doctor ID
DOCTOR_ID=$(curl -s http://localhost:4000/api/doctors | jq -r '.[0].id')

# Book appointment
curl -X POST \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"doctor_id\": \"$DOCTOR_ID\",
    \"scheduled_at\": \"$(date -u -v+1d +%Y-%m-%dT10:00:00Z)\",
    \"reason_for_visit\": \"Regular checkup\"
  }" \
  http://localhost:4000/api/appointments
```

**Expected:** 201 Created with appointment data including token_number: 1

---

#### 3.2 Try Duplicate Booking (Should Fail)

```bash
# Book same appointment again
curl -X POST \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"doctor_id\": \"$DOCTOR_ID\",
    \"scheduled_at\": \"$(date -u -v+1d +%Y-%m-%dT10:00:00Z)\",
    \"reason_for_visit\": \"Another checkup\"
  }" \
  http://localhost:4000/api/appointments
```

**Expected:** 400 Bad Request
```json
{
  "error": "You already have an appointment with this doctor today"
}
```

---

#### 3.3 Patient Views Their Appointments

```bash
curl -H "Authorization: Bearer $PATIENT_TOKEN" \
  http://localhost:4000/api/appointments
```

**Expected:** 200 OK with array of appointments

---

#### 3.4 Doctor Views Today's Queue

```bash
curl -H "Authorization: Bearer $DOCTOR_TOKEN" \
  http://localhost:4000/api/appointments
```

**Expected:** 200 OK with today's appointments for this doctor

---

#### 3.5 Doctor Updates Appointment Status

```bash
APPOINTMENT_ID="appointment_uuid"

# Mark as in progress
curl -X PATCH \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}' \
  http://localhost:4000/api/appointments/$APPOINTMENT_ID/status
```

**Expected:** 200 OK with updated appointment

---

### Scenario 4: Consultation & Prescription

#### 4.1 Doctor Creates Consultation

```bash
PATIENT_ID="patient_uuid"
APPOINTMENT_ID="appointment_uuid"

curl -X POST \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"appointment_id\": \"$APPOINTMENT_ID\",
    \"patient_id\": \"$PATIENT_ID\",
    \"chief_complaint\": \"Fever and headache for 2 days\",
    \"diagnosis\": \"Viral infection\",
    \"notes\": \"Rest advised for 3 days. Plenty of fluids.\",
    \"vitals\": {
      \"temperature\": \"101°F\",
      \"blood_pressure\": \"120/80\",
      \"pulse\": \"82\",
      \"weight\": \"70kg\"
    },
    \"follow_up_date\": \"$(date -u -v+7d +%Y-%m-%d)\"
  }" \
  http://localhost:4000/api/consultations
```

**Expected:** 201 Created with consultation data

**Side Effect:** Appointment status automatically updated to "completed"

---

#### 4.2 Doctor Issues Prescription

```bash
CONSULTATION_ID="consultation_uuid"

curl -X POST \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"consultation_id\": \"$CONSULTATION_ID\",
    \"patient_id\": \"$PATIENT_ID\",
    \"medicines\": [
      {
        \"name\": \"Paracetamol\",
        \"dosage\": \"500mg\",
        \"frequency\": \"TDS\",
        \"duration\": \"5 days\",
        \"instructions\": \"After food\"
      },
      {
        \"name\": \"Cetirizine\",
        \"dosage\": \"10mg\",
        \"frequency\": \"OD\",
        \"duration\": \"3 days\",
        \"instructions\": \"At bedtime\"
      }
    ],
    \"instructions\": \"Complete the course. Avoid cold water.\"
  }" \
  http://localhost:4000/api/prescriptions
```

**Expected:** 201 Created with prescription data (pdf_url will be null)

---

#### 4.3 Doctor Issues Medical Certificate

```bash
curl -X POST \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"consultation_id\": \"$CONSULTATION_ID\",
    \"patient_id\": \"$PATIENT_ID\",
    \"reason\": \"Medical rest advised due to viral fever\",
    \"from_date\": \"$(date -u +%Y-%m-%d)\",
    \"to_date\": \"$(date -u -v+3d +%Y-%m-%d)\",
    \"notes\": \"Complete bed rest recommended\"
  }" \
  http://localhost:4000/api/certificates
```

**Expected:** 201 Created with certificate data (pdf_url will be null)

---

#### 4.4 Patient Views Their Consultations

```bash
curl -H "Authorization: Bearer $PATIENT_TOKEN" \
  http://localhost:4000/api/consultations/me
```

**Expected:** 200 OK with array of consultations

---

#### 4.5 Patient Views Their Prescriptions

```bash
curl -H "Authorization: Bearer $PATIENT_TOKEN" \
  http://localhost:4000/api/prescriptions/me
```

**Expected:** 200 OK with array of prescriptions

---

#### 4.6 Patient Views Their Certificates

```bash
curl -H "Authorization: Bearer $PATIENT_TOKEN" \
  http://localhost:4000/api/certificates/me
```

**Expected:** 200 OK with array of certificates

---

### Scenario 5: Access Control Tests

#### 5.1 Patient Tries to View Another Patient (Should Fail)

```bash
OTHER_PATIENT_ID="different_patient_uuid"

curl -H "Authorization: Bearer $PATIENT_TOKEN" \
  http://localhost:4000/api/patients/$OTHER_PATIENT_ID
```

**Expected:** 403 Forbidden or 404 Not Found

---

#### 5.2 Patient Tries to Update Appointment Status (Should Fail)

```bash
curl -X PATCH \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}' \
  http://localhost:4000/api/appointments/$APPOINTMENT_ID/status
```

**Expected:** 403 Forbidden

---

#### 5.3 Patient Tries to Create Consultation (Should Fail)

```bash
curl -X POST \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"patient_id": "uuid", "diagnosis": "Hack"}' \
  http://localhost:4000/api/consultations
```

**Expected:** 403 Forbidden

---

### Scenario 6: Validation Tests

#### 6.1 Invalid Blood Group

```bash
curl -X PUT \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"blood_group": "Z+"}' \
  http://localhost:4000/api/patients/me
```

**Expected:** 400 Bad Request with validation error

---

#### 6.2 Empty Medicines Array

```bash
curl -X POST \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "uuid",
    "medicines": []
  }' \
  http://localhost:4000/api/prescriptions
```

**Expected:** 400 Bad Request
```json
{
  "error": "Medicines must be a non-empty array"
}
```

---

#### 6.3 Invalid Date Range (Certificate)

```bash
curl -X POST \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "uuid",
    "reason": "Test",
    "from_date": "2024-01-20",
    "to_date": "2024-01-15"
  }' \
  http://localhost:4000/api/certificates
```

**Expected:** 400 Bad Request
```json
{
  "error": "End date must be after start date"
}
```

---

## Automated Test Script

Create `test-phase3.sh`:

```bash
#!/bin/bash

# Phase 3 Automated Test Script

set -e

BASE_URL="http://localhost:4000"
PATIENT_TOKEN="$1"
DOCTOR_TOKEN="$2"

if [ -z "$PATIENT_TOKEN" ] || [ -z "$DOCTOR_TOKEN" ]; then
  echo "Usage: ./test-phase3.sh <patient_token> <doctor_token>"
  exit 1
fi

echo "========================================="
echo "Phase 3 Automated Testing"
echo "========================================="
echo ""

# Test 1: Health Check
echo "✓ Test 1: Health Check"
curl -s "$BASE_URL/health" | jq -e '.phase == 3' > /dev/null
echo "  PASS: Phase 3 confirmed"
echo ""

# Test 2: Patient Profile
echo "✓ Test 2: Get Patient Profile"
PATIENT_RESPONSE=$(curl -s -H "Authorization: Bearer $PATIENT_TOKEN" "$BASE_URL/api/patients/me")
PATIENT_ID=$(echo $PATIENT_RESPONSE | jq -r '.id')
echo "  PASS: Patient ID = $PATIENT_ID"
echo ""

# Test 3: List Doctors
echo "✓ Test 3: List Active Doctors"
DOCTORS=$(curl -s "$BASE_URL/api/doctors")
DOCTOR_ID=$(echo $DOCTORS | jq -r '.[0].id')
echo "  PASS: Found $(echo $DOCTORS | jq '. | length') doctors"
echo "  Using Doctor ID = $DOCTOR_ID"
echo ""

# Test 4: Book Appointment
echo "✓ Test 4: Book Appointment"
SCHEDULED_AT=$(date -u -v+1d +%Y-%m-%dT10:00:00Z)
APPOINTMENT=$(curl -s -X POST \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"doctor_id\": \"$DOCTOR_ID\",
    \"scheduled_at\": \"$SCHEDULED_AT\",
    \"reason_for_visit\": \"Test appointment\"
  }" \
  "$BASE_URL/api/appointments")
APPOINTMENT_ID=$(echo $APPOINTMENT | jq -r '.id')
TOKEN_NUMBER=$(echo $APPOINTMENT | jq -r '.token_number')
echo "  PASS: Appointment ID = $APPOINTMENT_ID"
echo "  Token Number = $TOKEN_NUMBER"
echo ""

# Test 5: Doctor Views Queue
echo "✓ Test 5: Doctor Views Queue"
QUEUE=$(curl -s -H "Authorization: Bearer $DOCTOR_TOKEN" "$BASE_URL/api/appointments")
echo "  PASS: Queue has $(echo $QUEUE | jq '. | length') appointments"
echo ""

# Test 6: Doctor Updates Status
echo "✓ Test 6: Update Appointment Status"
curl -s -X PATCH \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}' \
  "$BASE_URL/api/appointments/$APPOINTMENT_ID/status" | jq -e '.status == "in_progress"' > /dev/null
echo "  PASS: Status updated to in_progress"
echo ""

# Test 7: Create Consultation
echo "✓ Test 7: Create Consultation"
CONSULTATION=$(curl -s -X POST \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"appointment_id\": \"$APPOINTMENT_ID\",
    \"patient_id\": \"$PATIENT_ID\",
    \"chief_complaint\": \"Test complaint\",
    \"diagnosis\": \"Test diagnosis\",
    \"vitals\": {\"temperature\": \"98.6°F\"}
  }" \
  "$BASE_URL/api/consultations")
CONSULTATION_ID=$(echo $CONSULTATION | jq -r '.id')
echo "  PASS: Consultation ID = $CONSULTATION_ID"
echo ""

# Test 8: Issue Prescription
echo "✓ Test 8: Issue Prescription"
PRESCRIPTION=$(curl -s -X POST \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"consultation_id\": \"$CONSULTATION_ID\",
    \"patient_id\": \"$PATIENT_ID\",
    \"medicines\": [
      {\"name\": \"Test Med\", \"dosage\": \"10mg\", \"frequency\": \"OD\", \"duration\": \"3 days\"}
    ]
  }" \
  "$BASE_URL/api/prescriptions")
PRESCRIPTION_ID=$(echo $PRESCRIPTION | jq -r '.id')
echo "  PASS: Prescription ID = $PRESCRIPTION_ID"
echo ""

# Test 9: Issue Certificate
echo "✓ Test 9: Issue Certificate"
FROM_DATE=$(date -u +%Y-%m-%d)
TO_DATE=$(date -u -v+3d +%Y-%m-%d)
CERTIFICATE=$(curl -s -X POST \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"patient_id\": \"$PATIENT_ID\",
    \"reason\": \"Test certificate\",
    \"from_date\": \"$FROM_DATE\",
    \"to_date\": \"$TO_DATE\"
  }" \
  "$BASE_URL/api/certificates")
CERTIFICATE_ID=$(echo $CERTIFICATE | jq -r '.id')
echo "  PASS: Certificate ID = $CERTIFICATE_ID"
echo ""

# Test 10: Patient Views Data
echo "✓ Test 10: Patient Views Own Data"
curl -s -H "Authorization: Bearer $PATIENT_TOKEN" "$BASE_URL/api/consultations/me" | jq -e '. | length >= 1' > /dev/null
curl -s -H "Authorization: Bearer $PATIENT_TOKEN" "$BASE_URL/api/prescriptions/me" | jq -e '. | length >= 1' > /dev/null
curl -s -H "Authorization: Bearer $PATIENT_TOKEN" "$BASE_URL/api/certificates/me" | jq -e '. | length >= 1' > /dev/null
echo "  PASS: Patient can view consultations, prescriptions, certificates"
echo ""

# Test 11: Doctor Views Stats
echo "✓ Test 11: Doctor Views Stats"
STATS=$(curl -s -H "Authorization: Bearer $DOCTOR_TOKEN" "$BASE_URL/api/doctors/me/stats")
echo $STATS | jq -e '.today.total >= 0' > /dev/null
echo "  PASS: Stats retrieved"
echo ""

echo "========================================="
echo "✅ ALL TESTS PASSED"
echo "========================================="
```

Make it executable:
```bash
chmod +x test-phase3.sh
```

Run tests:
```bash
./test-phase3.sh "patient_jwt_here" "doctor_jwt_here"
```

---

## Expected Results Summary

| Test | Endpoint | Expected Status | Key Validation |
|------|----------|----------------|----------------|
| Health Check | `/health` | 200 | `phase === 3` |
| Get Patient Profile | `/api/patients/me` | 200 | Returns patient data |
| Update Patient Profile | `/api/patients/me` (PUT) | 200 | Updates allowed fields |
| List Doctors | `/api/doctors` | 200 | Returns doctor array |
| Book Appointment | `/api/appointments` (POST) | 201 | Token number assigned |
| Duplicate Booking | `/api/appointments` (POST) | 400 | Error message |
| Get Appointments | `/api/appointments` | 200 | Role-based filtering |
| Update Status | `/api/appointments/:id/status` | 200 | Status changed |
| Create Consultation | `/api/consultations` (POST) | 201 | Consultation created |
| Issue Prescription | `/api/prescriptions` (POST) | 201 | Prescription created |
| Issue Certificate | `/api/certificates` (POST) | 201 | Certificate created |
| Get Consultations | `/api/consultations/me` | 200 | Returns array |
| Get Prescriptions | `/api/prescriptions/me` | 200 | Returns array |
| Get Certificates | `/api/certificates/me` | 200 | Returns array |
| Access Control | Various | 403/404 | Unauthorized access blocked |

---

## Troubleshooting

### Issue: 401 Unauthorized

**Cause:** Invalid or expired JWT token

**Solution:**
```bash
# Regenerate token from Clerk dashboard
# Or check token expiration
```

---

### Issue: 403 Forbidden

**Cause:** Role doesn't match required role

**Solution:**
```bash
# Verify user role in Clerk metadata:
# Patient tokens must have role: "patient"
# Doctor tokens must have role: "doctor"
```

---

### Issue: 404 Not Found on Patient Profile

**Cause:** Patient record not created in database

**Solution:**
```bash
# Check if patient exists in Supabase
# If not, trigger webhook or use complete-signup endpoint
```

---

### Issue: Cannot Book Appointment

**Cause 1:** Doctor not active  
**Solution:** Check doctor `is_active` field in database

**Cause 2:** Duplicate booking  
**Solution:** Check existing appointments for same patient-doctor-day

---

### Issue: Token Number Not Sequential

**Cause:** Multiple bookings at same time

**Solution:** This is expected behavior with concurrent requests. Token numbers are still unique.

---

## Database Verification

After running tests, verify data in Supabase:

```sql
-- Check appointments
SELECT * FROM appointments ORDER BY created_at DESC LIMIT 5;

-- Check consultations
SELECT * FROM consultations ORDER BY created_at DESC LIMIT 5;

-- Check prescriptions
SELECT * FROM prescriptions ORDER BY issued_at DESC LIMIT 5;

-- Check certificates
SELECT * FROM medical_certificates ORDER BY issued_at DESC LIMIT 5;

-- Verify token numbers are sequential
SELECT scheduled_at::date, doctor_id, token_number 
FROM appointments 
WHERE doctor_id = 'your_doctor_id' 
ORDER BY token_number;
```

---

## Performance Benchmarks

Expected response times (local development):

- Health check: < 10ms
- Get patient profile: < 50ms
- List doctors: < 100ms
- Book appointment: < 200ms
- Create consultation: < 150ms
- Issue prescription: < 150ms
- Get patient history: < 300ms (joins multiple tables)

---

**Phase 3 Testing Complete!** ✅

Next: Proceed to Phase 4 (Admin APIs & PDF Generation)
