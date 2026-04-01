# Phase 3 API Reference

Complete endpoint reference for Patient and Doctor APIs.

---

## Base URL
```
http://localhost:4000
```

---

## Authentication
All endpoints (except public doctor listing) require JWT authentication via Clerk.

**Header:**
```
Authorization: Bearer <clerk_jwt_token>
```

---

## 📝 Patient Endpoints

### Get Own Profile
```http
GET /api/patients/me
Authorization: Bearer <patient_token>
```

**Response:**
```json
{
  "id": "uuid",
  "clerk_user_id": "user_2...",
  "student_id": "STU001",
  "full_name": "John Doe",
  "email": "john@university.edu",
  "date_of_birth": "2000-01-15",
  "gender": "male",
  "blood_group": "O+",
  "phone": "+919876543210",
  "address": "Campus Hostel A-101",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+919876543211",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-10T12:30:00Z"
}
```

---

### Update Own Profile
```http
PUT /api/patients/me
Authorization: Bearer <patient_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "date_of_birth": "2000-01-15",
  "gender": "male",
  "blood_group": "O+",
  "phone": "+919876543210",
  "address": "New Address",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+919876543211"
}
```

**Immutable Fields (ignored if provided):**
- `id`, `clerk_user_id`, `student_id`, `email`, `created_at`

**Validation:**
- `gender`: `"male" | "female" | "other"`
- `blood_group`: `"A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"`

**Response:** Updated patient object

---

### Get Patient by ID (Doctor/Admin Only)
```http
GET /api/patients/:id
Authorization: Bearer <doctor_or_admin_token>
```

**Response:** Same as "Get Own Profile"

---

### List All Patients (Admin Only)
```http
GET /api/patients?page=1&limit=20&search=john
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)
- `search` (optional): Search by name, student_id, or email

**Response:**
```json
{
  "data": [
    { /* patient objects */ }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

### Get Patient History (Doctor/Admin Only)
```http
GET /api/patients/:id/history
Authorization: Bearer <doctor_or_admin_token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "patient_id": "uuid",
    "doctor_id": "uuid",
    "appointment_id": "uuid",
    "chief_complaint": "Fever and headache",
    "diagnosis": "Viral infection",
    "notes": "Rest advised",
    "vitals": {
      "temperature": "101°F",
      "blood_pressure": "120/80",
      "pulse": "82"
    },
    "follow_up_date": "2024-01-20",
    "created_at": "2024-01-15T10:30:00Z",
    "doctor": {
      "full_name": "Dr. Smith",
      "specialization": "General Physician"
    },
    "prescriptions": [
      {
        "id": "uuid",
        "medicines": [...],
        "instructions": "Take after meals",
        "issued_at": "2024-01-15T10:45:00Z"
      }
    ]
  }
]
```

---

## 👨‍⚕️ Doctor Endpoints

### List Active Doctors (Public)
```http
GET /api/doctors
```

**Response:**
```json
[
  {
    "id": "uuid",
    "full_name": "Dr. Sarah Smith",
    "specialization": "General Physician",
    "qualification": "MBBS, MD"
  }
]
```

---

### Get Own Profile
```http
GET /api/doctors/me
Authorization: Bearer <doctor_token>
```

**Response:**
```json
{
  "id": "uuid",
  "clerk_user_id": "user_2...",
  "full_name": "Dr. Sarah Smith",
  "email": "sarah@hospital.com",
  "specialization": "General Physician",
  "qualification": "MBBS, MD",
  "registration_number": "MED12345",
  "phone": "+919876543210",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-10T12:30:00Z"
}
```

---

### Update Own Profile
```http
PUT /api/doctors/me
Authorization: Bearer <doctor_token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "phone": "+919876543210",
  "specialization": "Cardiology",
  "qualification": "MBBS, MD, DM"
}
```

**Note:** Only `phone`, `specialization`, and `qualification` can be updated.

**Response:** Updated doctor object

---

### Get Doctor by ID
```http
GET /api/doctors/:id
Authorization: Bearer <any_authenticated_user>
```

**Response:**
```json
{
  "id": "uuid",
  "full_name": "Dr. Sarah Smith",
  "specialization": "General Physician",
  "qualification": "MBBS, MD",
  "is_active": true
}
```

---

### Get Daily Stats
```http
GET /api/doctors/me/stats
Authorization: Bearer <doctor_token>
```

**Response:**
```json
{
  "today": {
    "total": 15,
    "completed": 8,
    "pending": 5,
    "inProgress": 2
  }
}
```

---

## 📅 Appointment Endpoints

### Book Appointment (Patient)
```http
POST /api/appointments
Authorization: Bearer <patient_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "doctor_id": "uuid",
  "scheduled_at": "2024-01-15T10:00:00Z",
  "reason_for_visit": "Regular checkup"
}
```

**Validation:**
- Doctor must be active
- No duplicate booking (same patient-doctor-day)
- Token number auto-generated

**Response:**
```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "scheduled_at": "2024-01-15T10:00:00Z",
  "token_number": 3,
  "status": "confirmed",
  "reason_for_visit": "Regular checkup",
  "created_at": "2024-01-14T15:30:00Z"
}
```

---

### Get Appointments
```http
GET /api/appointments?status=pending&date=2024-01-15
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status
- `date` (optional): Filter by date (YYYY-MM-DD) — doctor view only

**Behavior by Role:**
- **Patient:** Returns only their appointments
- **Doctor:** Returns today's queue by default (filterable by date)
- **Admin:** Returns all appointments

**Response:**
```json
[
  {
    "id": "uuid",
    "patient_id": "uuid",
    "doctor_id": "uuid",
    "scheduled_at": "2024-01-15T10:00:00Z",
    "token_number": 3,
    "status": "confirmed",
    "reason_for_visit": "Regular checkup",
    "created_at": "2024-01-14T15:30:00Z",
    "patient": {
      "id": "uuid",
      "full_name": "John Doe",
      "student_id": "STU001",
      "phone": "+919876543210",
      "gender": "male",
      "blood_group": "O+"
    },
    "doctor": {
      "id": "uuid",
      "full_name": "Dr. Sarah Smith",
      "specialization": "General Physician"
    }
  }
]
```

---

### Get Single Appointment
```http
GET /api/appointments/:id
Authorization: Bearer <token>
```

**Access Control:**
- Patient can only view their own appointments

**Response:** Single appointment object with patient and doctor details

---

### Update Appointment Status (Doctor/Admin)
```http
PATCH /api/appointments/:id/status
Authorization: Bearer <doctor_or_admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Valid Status Values:**
- `"pending"`
- `"confirmed"`
- `"in_progress"`
- `"completed"`
- `"cancelled"`

**Access Control:**
- Doctor can only update their own appointments

**Response:** Updated appointment object

---

### Cancel Appointment (Patient)
```http
DELETE /api/appointments/:id
Authorization: Bearer <patient_token>
```

**Validation:**
- Must be patient's own appointment
- Cannot cancel completed appointments

**Response:**
```json
{
  "message": "Appointment cancelled"
}
```

---

## 🏥 Consultation Endpoints

### Create Consultation (Doctor)
```http
POST /api/consultations
Authorization: Bearer <doctor_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "appointment_id": "uuid",
  "patient_id": "uuid",
  "chief_complaint": "Fever and headache",
  "diagnosis": "Viral infection",
  "notes": "Rest advised for 3 days",
  "vitals": {
    "temperature": "101°F",
    "blood_pressure": "120/80",
    "pulse": "82",
    "weight": "70kg",
    "height": "175cm"
  },
  "follow_up_date": "2024-01-20"
}
```

**Required Fields:**
- `patient_id`

**Optional Fields:**
- `appointment_id` (if provided, appointment is auto-completed)
- `chief_complaint`, `diagnosis`, `notes`, `vitals`, `follow_up_date`

**Response:**
```json
{
  "id": "uuid",
  "appointment_id": "uuid",
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "chief_complaint": "Fever and headache",
  "diagnosis": "Viral infection",
  "notes": "Rest advised for 3 days",
  "vitals": { ... },
  "follow_up_date": "2024-01-20",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### Get Patient's Consultations (Doctor/Admin)
```http
GET /api/consultations/patient/:patientId
Authorization: Bearer <doctor_or_admin_token>
```

**Response:** Array of consultation objects with doctor and prescription details

---

### Get Own Consultations (Patient)
```http
GET /api/consultations/me
Authorization: Bearer <patient_token>
```

**Response:** Array of consultation objects

---

### Get Single Consultation
```http
GET /api/consultations/:id
Authorization: Bearer <token>
```

**Access Control:**
- Patient can only view their own consultations

**Response:**
```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "appointment_id": "uuid",
  "chief_complaint": "Fever and headache",
  "diagnosis": "Viral infection",
  "notes": "Rest advised",
  "vitals": { ... },
  "follow_up_date": "2024-01-20",
  "created_at": "2024-01-15T10:30:00Z",
  "patient": {
    "id": "uuid",
    "full_name": "John Doe",
    "student_id": "STU001",
    "date_of_birth": "2000-01-15",
    "gender": "male",
    "blood_group": "O+"
  },
  "doctor": {
    "full_name": "Dr. Sarah Smith",
    "specialization": "General Physician",
    "qualification": "MBBS, MD"
  },
  "prescriptions": [
    { /* prescription objects */ }
  ]
}
```

---

## 💊 Prescription Endpoints

### Issue Prescription (Doctor)
```http
POST /api/prescriptions
Authorization: Bearer <doctor_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "consultation_id": "uuid",
  "patient_id": "uuid",
  "medicines": [
    {
      "name": "Paracetamol",
      "dosage": "500mg",
      "frequency": "TDS",
      "duration": "5 days",
      "instructions": "After food"
    },
    {
      "name": "Cetirizine",
      "dosage": "10mg",
      "frequency": "OD",
      "duration": "3 days",
      "instructions": "At bedtime"
    }
  ],
  "instructions": "Complete the course. Avoid cold water."
}
```

**Required Fields:**
- `patient_id`
- `medicines` (non-empty array)

**Medicine Object Schema:**
- `name` (required)
- `dosage` (required)
- `frequency` (required)
- `duration` (required)
- `instructions` (optional)

**Response:**
```json
{
  "id": "uuid",
  "consultation_id": "uuid",
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "medicines": [ ... ],
  "instructions": "Complete the course. Avoid cold water.",
  "pdf_url": null,
  "issued_at": "2024-01-15T10:45:00Z"
}
```

**Note:** `pdf_url` is `null` in Phase 3. PDF generation will be added in Phase 4.

---

### Get Patient's Prescriptions (Doctor/Admin)
```http
GET /api/prescriptions/patient/:patientId
Authorization: Bearer <doctor_or_admin_token>
```

**Response:** Array of prescription objects with doctor and consultation details

---

### Get Own Prescriptions (Patient)
```http
GET /api/prescriptions/me
Authorization: Bearer <patient_token>
```

**Response:** Array of prescription objects

---

### Get Single Prescription
```http
GET /api/prescriptions/:id
Authorization: Bearer <token>
```

**Access Control:**
- Patient can only view their own prescriptions

**Response:**
```json
{
  "id": "uuid",
  "consultation_id": "uuid",
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "medicines": [ ... ],
  "instructions": "Complete the course",
  "pdf_url": null,
  "issued_at": "2024-01-15T10:45:00Z",
  "doctor": {
    "full_name": "Dr. Sarah Smith",
    "specialization": "General Physician",
    "qualification": "MBBS, MD"
  },
  "patient": {
    "full_name": "John Doe",
    "student_id": "STU001"
  },
  "consultation": {
    "diagnosis": "Viral infection",
    "chief_complaint": "Fever and headache"
  }
}
```

---

### Get Prescription PDF (Stub)
```http
GET /api/prescriptions/:id/pdf
Authorization: Bearer <token>
```

**Phase 3 Response:**
```json
{
  "error": "PDF not available",
  "message": "PDF generation will be implemented in Phase 4"
}
```

---

## 📜 Medical Certificate Endpoints

### Issue Certificate (Doctor)
```http
POST /api/certificates
Authorization: Bearer <doctor_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "consultation_id": "uuid",
  "patient_id": "uuid",
  "reason": "Medical rest advised due to viral fever",
  "from_date": "2024-01-15",
  "to_date": "2024-01-17",
  "notes": "Complete bed rest recommended"
}
```

**Required Fields:**
- `patient_id`
- `reason`
- `from_date`
- `to_date`

**Validation:**
- `to_date` must be after `from_date`

**Response:**
```json
{
  "id": "uuid",
  "consultation_id": "uuid",
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "reason": "Medical rest advised due to viral fever",
  "from_date": "2024-01-15",
  "to_date": "2024-01-17",
  "notes": "Complete bed rest recommended",
  "pdf_url": null,
  "issued_at": "2024-01-15T11:00:00Z"
}
```

---

### Get Patient's Certificates (Doctor/Admin)
```http
GET /api/certificates/patient/:patientId
Authorization: Bearer <doctor_or_admin_token>
```

**Response:** Array of certificate objects with doctor details

---

### Get Own Certificates (Patient)
```http
GET /api/certificates/me
Authorization: Bearer <patient_token>
```

**Response:** Array of certificate objects

---

### Get Single Certificate
```http
GET /api/certificates/:id
Authorization: Bearer <token>
```

**Access Control:**
- Patient can only view their own certificates

**Response:**
```json
{
  "id": "uuid",
  "consultation_id": "uuid",
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "reason": "Medical rest advised due to viral fever",
  "from_date": "2024-01-15",
  "to_date": "2024-01-17",
  "notes": "Complete bed rest recommended",
  "pdf_url": null,
  "issued_at": "2024-01-15T11:00:00Z",
  "doctor": {
    "full_name": "Dr. Sarah Smith",
    "specialization": "General Physician",
    "qualification": "MBBS, MD",
    "registration_number": "MED12345"
  },
  "patient": {
    "full_name": "John Doe",
    "student_id": "STU001"
  }
}
```

---

### Get Certificate PDF (Stub)
```http
GET /api/certificates/:id/pdf
Authorization: Bearer <token>
```

**Phase 3 Response:**
```json
{
  "error": "PDF not available",
  "message": "PDF generation will be implemented in Phase 4"
}
```

---

## 🚨 Error Responses

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

**Common Status Codes:**
- `400` — Bad Request (validation error, invalid data)
- `401` — Unauthorized (missing or invalid token)
- `403` — Forbidden (insufficient permissions)
- `404` — Not Found (resource doesn't exist)
- `500` — Internal Server Error

**Examples:**

```json
// 400 - Validation Error
{
  "error": "Medicines must be a non-empty array"
}

// 403 - Access Denied
{
  "error": "Access denied"
}

// 404 - Not Found
{
  "error": "Patient not found"
}

// 400 - Duplicate Appointment
{
  "error": "You already have an appointment with this doctor today"
}
```

---

## 📊 Response Format Patterns

### Single Resource
```json
{
  "id": "uuid",
  "field1": "value",
  "field2": "value"
}
```

### List of Resources
```json
[
  { "id": "uuid1", ... },
  { "id": "uuid2", ... }
]
```

### Paginated List
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Success Message
```json
{
  "message": "Operation successful"
}
```

---

## 🔐 Authorization Matrix

| Endpoint | Patient | Doctor | Admin |
|----------|---------|--------|-------|
| `GET /api/patients/me` | Own | ❌ | ❌ |
| `PUT /api/patients/me` | Own | ❌ | ❌ |
| `GET /api/patients/:id` | ❌ | ✅ | ✅ |
| `GET /api/patients` | ❌ | ❌ | ✅ |
| `GET /api/patients/:id/history` | ❌ | ✅ | ✅ |
| `GET /api/doctors` | ✅ (public) | ✅ (public) | ✅ (public) |
| `GET /api/doctors/me` | ❌ | Own | ❌ |
| `PUT /api/doctors/me` | ❌ | Own | ❌ |
| `GET /api/doctors/me/stats` | ❌ | Own | ❌ |
| `POST /api/appointments` | ✅ | ❌ | ❌ |
| `GET /api/appointments` | Own | Queue | All |
| `PATCH /api/appointments/:id/status` | ❌ | Own | ✅ |
| `DELETE /api/appointments/:id` | Own | ❌ | ❌ |
| `POST /api/consultations` | ❌ | ✅ | ❌ |
| `GET /api/consultations/me` | Own | ❌ | ❌ |
| `GET /api/consultations/patient/:id` | ❌ | ✅ | ✅ |
| `POST /api/prescriptions` | ❌ | ✅ | ❌ |
| `GET /api/prescriptions/me` | Own | ❌ | ❌ |
| `GET /api/prescriptions/patient/:id` | ❌ | ✅ | ✅ |
| `POST /api/certificates` | ❌ | ✅ | ❌ |
| `GET /api/certificates/me` | Own | ❌ | ❌ |
| `GET /api/certificates/patient/:id` | ❌ | ✅ | ✅ |

---

**Last Updated:** Phase 3 Implementation  
**Base URL:** `http://localhost:4000`  
**Authentication:** Clerk JWT via `Authorization: Bearer <token>`
