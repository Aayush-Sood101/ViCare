# ViCare API Reference

**Version:** 1.0.0  
**Base URL:** `http://localhost:4000`  
**Authentication:** Clerk JWT (Bearer token in Authorization header)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Phase 2 - Authentication & User Management](#phase-2---authentication--user-management)
3. [Phase 3 - Core Healthcare Features](#phase-3---core-healthcare-features)
   - [Patients](#patients)
   - [Doctors](#doctors)
   - [Appointments](#appointments)
   - [Consultations](#consultations)
   - [Prescriptions](#prescriptions)
   - [Medical Certificates](#medical-certificates)
4. [Phase 4 - Admin & Analytics](#phase-4---admin--analytics)
   - [Doctor Approval System](#doctor-approval-system)
   - [Doctor Management](#doctor-management)
   - [Analytics & Reports](#analytics--reports)
   - [System Health](#system-health)

---

## Authentication

All protected endpoints require a valid Clerk JWT token in the Authorization header:

```
Authorization: Bearer <clerk_jwt_token>
```

### User Roles

- `patient` - Students with health profiles
- `doctor` - Approved medical professionals
- `pending_doctor` - Doctors awaiting admin approval
- `rejected_doctor` - Doctors whose applications were rejected
- `admin` - System administrators

---

## Phase 2 - Authentication & User Management

### Complete Signup

Complete user registration after Clerk authentication.

**Endpoint:** `POST /api/auth/complete-signup`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_type": "patient",  // or "doctor"
  "full_name": "John Doe",
  
  // For patients:
  "student_id": "VIT2024001",
  "date_of_birth": "2000-01-15",
  "gender": "male",  // "male", "female", or "other"
  "blood_group": "O+",
  "phone_number": "+91-9876543210",
  "address": "VIT Hostel A-Block",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+91-9876543211",
  "emergency_contact_relation": "Mother",
  
  // For doctors:
  "specialization": "General Medicine",
  "qualification": "MBBS, MD",
  "registration_number": "MED12345",
  "phone_number": "+91-9876543210"
}
```

**Success Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "clerk_user_id": "user_2abc123xyz",
  "email": "john.doe@vit.edu",
  "full_name": "John Doe",
  "student_id": "VIT2024001",
  "created_at": "2024-03-15T10:30:00.000Z",
  "updated_at": "2024-03-15T10:30:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields or invalid data
- `409 Conflict` - Student ID or registration number already exists

---

### Get Auth Status

Get current user's authentication status and role.

**Endpoint:** `GET /api/auth/status`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response:** `200 OK`
```json
{
  "authenticated": true,
  "role": "patient",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@vit.edu",
    "full_name": "John Doe"
  }
}
```

---

## Phase 3 - Core Healthcare Features

### Patients

#### Get Own Profile

**Endpoint:** `GET /api/patients/me`

**Role:** `patient`

**Success Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "clerk_user_id": "user_2abc123xyz",
  "email": "john.doe@vit.edu",
  "full_name": "John Doe",
  "student_id": "VIT2024001",
  "date_of_birth": "2000-01-15",
  "gender": "male",
  "blood_group": "O+",
  "phone_number": "+91-9876543210",
  "address": "VIT Hostel A-Block",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+91-9876543211",
  "emergency_contact_relation": "Mother",
  "medical_history": null,
  "allergies": null,
  "current_medications": null,
  "created_at": "2024-03-15T10:30:00.000Z",
  "updated_at": "2024-03-15T10:30:00.000Z"
}
```

---

#### Update Own Profile

**Endpoint:** `PUT /api/patients/me`

**Role:** `patient`

**Request Body:**
```json
{
  "phone_number": "+91-9999999999",
  "address": "VIT Hostel B-Block",
  "medical_history": "Asthma since childhood",
  "allergies": "Peanuts, Dust",
  "current_medications": "Inhaler as needed"
}
```

**Success Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "full_name": "John Doe",
  // ... updated fields
}
```

---

#### Get Patient by ID

**Endpoint:** `GET /api/patients/:id`

**Role:** `doctor`, `admin`

**URL Parameters:**
- `id` - Patient UUID

**Success Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "full_name": "John Doe",
  "student_id": "VIT2024001",
  // ... full patient details
}
```

---

#### List All Patients

**Endpoint:** `GET /api/patients`

**Role:** `admin`

**Query Parameters:**
- `search` - Search by name, email, or student ID
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20, max: 100)

**Example:** `GET /api/patients?search=john&page=1&limit=20`

**Success Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe",
      "student_id": "VIT2024001",
      "email": "john.doe@vit.edu"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

#### Get Patient Consultation History

**Endpoint:** `GET /api/patients/:id/history`

**Role:** `doctor`, `admin`, or patient owner

**Success Response:** `200 OK`
```json
[
  {
    "id": "cons-123",
    "consultation_date": "2024-03-10T14:30:00.000Z",
    "chief_complaint": "Fever and headache",
    "diagnosis": "Viral fever",
    "doctor": {
      "full_name": "Dr. Sarah Johnson",
      "specialization": "General Medicine"
    },
    "prescriptions": [
      {
        "id": "pres-456",
        "medicines": [
          {
            "name": "Paracetamol",
            "dosage": "500mg",
            "frequency": "Three times daily"
          }
        ]
      }
    ]
  }
]
```

---

### Doctors

#### List Active Doctors

**Endpoint:** `GET /api/doctors`

**Role:** Public (authenticated users)

**Query Parameters:**
- `specialization` - Filter by specialization

**Success Response:** `200 OK`
```json
[
  {
    "id": "doc-123",
    "full_name": "Dr. Sarah Johnson",
    "specialization": "General Medicine",
    "qualification": "MBBS, MD",
    "email": "sarah.johnson@vit.edu"
  }
]
```

---

#### Get Own Profile

**Endpoint:** `GET /api/doctors/me`

**Role:** `doctor`

**Success Response:** `200 OK`
```json
{
  "id": "doc-123",
  "clerk_user_id": "user_doctor123",
  "email": "sarah.johnson@vit.edu",
  "full_name": "Dr. Sarah Johnson",
  "specialization": "General Medicine",
  "qualification": "MBBS, MD",
  "registration_number": "MED12345",
  "phone_number": "+91-9876543210",
  "is_active": true,
  "created_at": "2024-01-15T09:00:00.000Z",
  "updated_at": "2024-03-15T10:00:00.000Z"
}
```

---

#### Update Own Profile

**Endpoint:** `PUT /api/doctors/me`

**Role:** `doctor`

**Request Body:**
```json
{
  "phone_number": "+91-9999999999",
  "specialization": "Internal Medicine"
}
```

**Success Response:** `200 OK`
```json
{
  "id": "doc-123",
  "full_name": "Dr. Sarah Johnson",
  // ... updated fields
}
```

---

#### Get Doctor by ID

**Endpoint:** `GET /api/doctors/:id`

**Role:** Authenticated users

**Success Response:** `200 OK`
```json
{
  "id": "doc-123",
  "full_name": "Dr. Sarah Johnson",
  "specialization": "General Medicine",
  "qualification": "MBBS, MD",
  "email": "sarah.johnson@vit.edu"
}
```

---

#### Get Doctor Statistics

**Endpoint:** `GET /api/doctors/me/stats`

**Role:** `doctor`

**Success Response:** `200 OK`
```json
{
  "today": {
    "total_appointments": 15,
    "completed_appointments": 10,
    "pending_appointments": 5,
    "in_progress_appointments": 0
  }
}
```

---

### Appointments

#### Book Appointment

**Endpoint:** `POST /api/appointments`

**Role:** `patient`

**Request Body:**
```json
{
  "doctor_id": "doc-123",
  "appointment_date": "2024-03-20",
  "reason": "Routine checkup"
}
```

**Success Response:** `201 Created`
```json
{
  "id": "apt-789",
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "doctor_id": "doc-123",
  "appointment_date": "2024-03-20",
  "token_number": 15,
  "status": "pending",
  "reason": "Routine checkup",
  "created_at": "2024-03-15T10:30:00.000Z"
}
```

**Business Rules:**
- Automatic token number assignment (sequential per doctor per day)
- Prevents duplicate appointments (same patient-doctor-day)
- Default status: `pending`

---

#### Get Appointments

**Endpoint:** `GET /api/appointments`

**Role:** `patient`, `doctor`, `admin`

**Query Parameters:**
- `date` - Filter by date (YYYY-MM-DD)
- `status` - Filter by status (`pending`, `confirmed`, `in_progress`, `completed`, `cancelled`)

**Behavior:**
- **Patient:** Returns own appointments
- **Doctor:** Returns appointments for that doctor
- **Admin:** Returns all appointments

**Success Response:** `200 OK`
```json
[
  {
    "id": "apt-789",
    "token_number": 15,
    "appointment_date": "2024-03-20",
    "status": "pending",
    "reason": "Routine checkup",
    "patient": {
      "full_name": "John Doe",
      "student_id": "VIT2024001"
    },
    "doctor": {
      "full_name": "Dr. Sarah Johnson",
      "specialization": "General Medicine"
    }
  }
]
```

---

#### Get Single Appointment

**Endpoint:** `GET /api/appointments/:id`

**Role:** Patient owner, assigned doctor, or admin

**Success Response:** `200 OK`
```json
{
  "id": "apt-789",
  "token_number": 15,
  "appointment_date": "2024-03-20",
  "status": "pending",
  "reason": "Routine checkup",
  "patient": {
    "full_name": "John Doe",
    "student_id": "VIT2024001",
    "blood_group": "O+"
  },
  "doctor": {
    "full_name": "Dr. Sarah Johnson",
    "specialization": "General Medicine"
  },
  "created_at": "2024-03-15T10:30:00.000Z",
  "updated_at": "2024-03-15T10:30:00.000Z"
}
```

---

#### Update Appointment Status

**Endpoint:** `PATCH /api/appointments/:id/status`

**Role:** `doctor`, `admin`

**Request Body:**
```json
{
  "status": "confirmed"  // "pending", "confirmed", "in_progress", "completed", "cancelled"
}
```

**Success Response:** `200 OK`
```json
{
  "id": "apt-789",
  "status": "confirmed",
  "updated_at": "2024-03-15T11:00:00.000Z"
}
```

---

#### Cancel Appointment

**Endpoint:** `DELETE /api/appointments/:id`

**Role:** `patient` (own appointments only)

**Success Response:** `200 OK`
```json
{
  "message": "Appointment cancelled successfully"
}
```

---

### Consultations

#### Create Consultation

**Endpoint:** `POST /api/consultations`

**Role:** `doctor`

**Request Body:**
```json
{
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "appointment_id": "apt-789",  // Optional
  "chief_complaint": "Fever and body ache for 3 days",
  "diagnosis": "Viral fever",
  "treatment_plan": "Rest, hydration, and medication",
  "notes": "Patient advised to return if fever persists beyond 5 days",
  "follow_up_date": "2024-03-25",
  "vitals": {
    "blood_pressure": "120/80",
    "temperature": "101.5",
    "pulse": "88",
    "weight": "70",
    "height": "175"
  }
}
```

**Success Response:** `201 Created`
```json
{
  "id": "cons-123",
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "doctor_id": "doc-123",
  "appointment_id": "apt-789",
  "chief_complaint": "Fever and body ache for 3 days",
  "diagnosis": "Viral fever",
  "treatment_plan": "Rest, hydration, and medication",
  "notes": "Patient advised to return if fever persists beyond 5 days",
  "follow_up_date": "2024-03-25",
  "vitals": {
    "blood_pressure": "120/80",
    "temperature": "101.5",
    "pulse": "88",
    "weight": "70",
    "height": "175"
  },
  "created_at": "2024-03-15T14:30:00.000Z"
}
```

**Business Rules:**
- If `appointment_id` is provided, appointment status is automatically set to `completed`

---

#### Get Patient Consultations

**Endpoint:** `GET /api/consultations/patient/:patientId`

**Role:** `doctor`, `admin`

**Success Response:** `200 OK`
```json
[
  {
    "id": "cons-123",
    "consultation_date": "2024-03-15T14:30:00.000Z",
    "chief_complaint": "Fever and body ache for 3 days",
    "diagnosis": "Viral fever",
    "doctor": {
      "full_name": "Dr. Sarah Johnson",
      "specialization": "General Medicine"
    }
  }
]
```

---

#### Get Own Consultations

**Endpoint:** `GET /api/consultations/me`

**Role:** `patient`

**Success Response:** `200 OK`
```json
[
  {
    "id": "cons-123",
    "consultation_date": "2024-03-15T14:30:00.000Z",
    "chief_complaint": "Fever and body ache for 3 days",
    "diagnosis": "Viral fever",
    "treatment_plan": "Rest, hydration, and medication",
    "doctor": {
      "full_name": "Dr. Sarah Johnson",
      "specialization": "General Medicine"
    },
    "prescriptions": []
  }
]
```

---

#### Get Single Consultation

**Endpoint:** `GET /api/consultations/:id`

**Role:** Patient owner, assigned doctor, or admin

**Success Response:** `200 OK`
```json
{
  "id": "cons-123",
  "chief_complaint": "Fever and body ache for 3 days",
  "diagnosis": "Viral fever",
  "treatment_plan": "Rest, hydration, and medication",
  "notes": "Patient advised to return if fever persists beyond 5 days",
  "follow_up_date": "2024-03-25",
  "vitals": {
    "blood_pressure": "120/80",
    "temperature": "101.5",
    "pulse": "88",
    "weight": "70",
    "height": "175"
  },
  "patient": {
    "full_name": "John Doe",
    "student_id": "VIT2024001"
  },
  "doctor": {
    "full_name": "Dr. Sarah Johnson",
    "specialization": "General Medicine"
  },
  "appointment": {
    "token_number": 15,
    "appointment_date": "2024-03-15"
  },
  "prescriptions": [],
  "created_at": "2024-03-15T14:30:00.000Z"
}
```

---

### Prescriptions

#### Create Prescription

**Endpoint:** `POST /api/prescriptions`

**Role:** `doctor`

**Request Body:**
```json
{
  "consultation_id": "cons-123",  // Optional
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "medicines": [
    {
      "name": "Paracetamol",
      "dosage": "500mg",
      "frequency": "Three times daily",
      "duration": "5 days",
      "instructions": "After meals"
    },
    {
      "name": "Amoxicillin",
      "dosage": "250mg",
      "frequency": "Twice daily",
      "duration": "7 days",
      "instructions": "Before meals"
    }
  ],
  "instructions": "Complete the full course of antibiotics. Take plenty of rest."
}
```

**Success Response:** `201 Created`
```json
{
  "id": "pres-456",
  "consultation_id": "cons-123",
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "doctor_id": "doc-123",
  "medicines": [
    {
      "name": "Paracetamol",
      "dosage": "500mg",
      "frequency": "Three times daily",
      "duration": "5 days",
      "instructions": "After meals"
    }
  ],
  "instructions": "Complete the full course of antibiotics. Take plenty of rest.",
  "pdf_url": "prescriptions/prescription-550e8400-1710508800000.pdf",
  "issued_at": "2024-03-15T15:00:00.000Z"
}
```

**Features:**
- Automatically generates PDF prescription
- Stores PDF in Supabase Storage
- PDF includes patient info, medicines table, and doctor signature

---

#### Get Patient Prescriptions

**Endpoint:** `GET /api/prescriptions/patient/:patientId`

**Role:** `doctor`, `admin`

**Success Response:** `200 OK`
```json
[
  {
    "id": "pres-456",
    "issued_at": "2024-03-15T15:00:00.000Z",
    "medicines": [
      {
        "name": "Paracetamol",
        "dosage": "500mg",
        "frequency": "Three times daily"
      }
    ],
    "doctor": {
      "full_name": "Dr. Sarah Johnson",
      "specialization": "General Medicine"
    },
    "consultation": {
      "diagnosis": "Viral fever",
      "created_at": "2024-03-15T14:30:00.000Z"
    }
  }
]
```

---

#### Get Own Prescriptions

**Endpoint:** `GET /api/prescriptions/me`

**Role:** `patient`

**Success Response:** `200 OK`
```json
[
  {
    "id": "pres-456",
    "issued_at": "2024-03-15T15:00:00.000Z",
    "medicines": [
      {
        "name": "Paracetamol",
        "dosage": "500mg",
        "frequency": "Three times daily",
        "duration": "5 days"
      }
    ],
    "instructions": "Complete the full course of antibiotics.",
    "doctor": {
      "full_name": "Dr. Sarah Johnson",
      "specialization": "General Medicine"
    }
  }
]
```

---

#### Get Single Prescription

**Endpoint:** `GET /api/prescriptions/:id`

**Role:** Patient owner, doctor, or admin

**Success Response:** `200 OK`
```json
{
  "id": "pres-456",
  "medicines": [
    {
      "name": "Paracetamol",
      "dosage": "500mg",
      "frequency": "Three times daily",
      "duration": "5 days",
      "instructions": "After meals"
    }
  ],
  "instructions": "Complete the full course of antibiotics.",
  "issued_at": "2024-03-15T15:00:00.000Z",
  "doctor": {
    "full_name": "Dr. Sarah Johnson",
    "specialization": "General Medicine",
    "qualification": "MBBS, MD"
  },
  "patient": {
    "full_name": "John Doe",
    "student_id": "VIT2024001"
  },
  "consultation": {
    "diagnosis": "Viral fever",
    "chief_complaint": "Fever and body ache"
  }
}
```

---

#### Get Prescription PDF URL

**Endpoint:** `GET /api/prescriptions/:id/pdf`

**Role:** Patient owner, doctor, or admin

**Success Response:** `200 OK`
```json
{
  "pdf_url": "https://storage.supabase.co/signed-url...",
  "expires_in": 3600
}
```

**Features:**
- Returns signed URL valid for 1 hour
- Secure access to private PDF documents

**Error Response:**
- `404 Not Found` - PDF not available

---

### Medical Certificates

#### Issue Medical Certificate

**Endpoint:** `POST /api/certificates`

**Role:** `doctor`

**Request Body:**
```json
{
  "consultation_id": "cons-123",  // Optional
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "reason": "Viral fever with severe body ache",
  "from_date": "2024-03-15",
  "to_date": "2024-03-17",
  "notes": "Patient advised complete bed rest"
}
```

**Success Response:** `201 Created`
```json
{
  "id": "cert-789",
  "consultation_id": "cons-123",
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "doctor_id": "doc-123",
  "reason": "Viral fever with severe body ache",
  "from_date": "2024-03-15",
  "to_date": "2024-03-17",
  "notes": "Patient advised complete bed rest",
  "pdf_url": "certificates/certificate-550e8400-1710508900000.pdf",
  "issued_at": "2024-03-15T15:15:00.000Z"
}
```

**Features:**
- Automatically generates PDF medical certificate
- Formal certificate format with doctor signature
- Includes validity period and official stamp placeholder

**Validation:**
- `to_date` must be after or equal to `from_date`

---

#### Get Patient Certificates

**Endpoint:** `GET /api/certificates/patient/:patientId`

**Role:** `doctor`, `admin`

**Success Response:** `200 OK`
```json
[
  {
    "id": "cert-789",
    "reason": "Viral fever with severe body ache",
    "from_date": "2024-03-15",
    "to_date": "2024-03-17",
    "issued_at": "2024-03-15T15:15:00.000Z",
    "doctor": {
      "full_name": "Dr. Sarah Johnson",
      "specialization": "General Medicine"
    }
  }
]
```

---

#### Get Own Certificates

**Endpoint:** `GET /api/certificates/me`

**Role:** `patient`

**Success Response:** `200 OK`
```json
[
  {
    "id": "cert-789",
    "reason": "Viral fever with severe body ache",
    "from_date": "2024-03-15",
    "to_date": "2024-03-17",
    "notes": "Patient advised complete bed rest",
    "issued_at": "2024-03-15T15:15:00.000Z",
    "doctor": {
      "full_name": "Dr. Sarah Johnson",
      "specialization": "General Medicine"
    }
  }
]
```

---

#### Get Single Certificate

**Endpoint:** `GET /api/certificates/:id`

**Role:** Patient owner, doctor, or admin

**Success Response:** `200 OK`
```json
{
  "id": "cert-789",
  "reason": "Viral fever with severe body ache",
  "from_date": "2024-03-15",
  "to_date": "2024-03-17",
  "notes": "Patient advised complete bed rest",
  "issued_at": "2024-03-15T15:15:00.000Z",
  "doctor": {
    "full_name": "Dr. Sarah Johnson",
    "specialization": "General Medicine",
    "qualification": "MBBS, MD",
    "registration_number": "MED12345"
  },
  "patient": {
    "full_name": "John Doe",
    "student_id": "VIT2024001"
  }
}
```

---

#### Get Certificate PDF URL

**Endpoint:** `GET /api/certificates/:id/pdf`

**Role:** Patient owner, doctor, or admin

**Success Response:** `200 OK`
```json
{
  "pdf_url": "https://storage.supabase.co/signed-url...",
  "expires_in": 3600
}
```

**Features:**
- Returns signed URL valid for 1 hour
- Secure access to private certificate documents

---

## Phase 4 - Admin & Analytics

### Doctor Approval System

#### List Approval Requests

**Endpoint:** `GET /api/admin/approval-requests`

**Role:** `admin`

**Query Parameters:**
- `status` - Filter by status (`pending`, `approved`, `rejected`)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

**Success Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "req-123",
      "email": "new.doctor@vit.edu",
      "full_name": "Dr. Michael Brown",
      "specialization": "Cardiology",
      "qualification": "MBBS, MD, DM",
      "registration_number": "CARD56789",
      "phone_number": "+91-9876543333",
      "status": "pending",
      "created_at": "2024-03-10T09:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

#### Get Single Approval Request

**Endpoint:** `GET /api/admin/approval-requests/:id`

**Role:** `admin`

**Success Response:** `200 OK`
```json
{
  "id": "req-123",
  "clerk_user_id": "user_newdoc123",
  "email": "new.doctor@vit.edu",
  "full_name": "Dr. Michael Brown",
  "specialization": "Cardiology",
  "qualification": "MBBS, MD, DM",
  "registration_number": "CARD56789",
  "phone_number": "+91-9876543333",
  "status": "pending",
  "created_at": "2024-03-10T09:00:00.000Z",
  "updated_at": "2024-03-10T09:00:00.000Z"
}
```

---

#### Approve or Reject Doctor

**Endpoint:** `PATCH /api/admin/approval-requests/:id`

**Role:** `admin`

**Request Body:**
```json
{
  "action": "approve",  // or "reject"
  "rejection_reason": "Incomplete documentation"  // Required if action is "reject"
}
```

**Success Response:** `200 OK`

**For Approval:**
```json
{
  "message": "Doctor approved successfully",
  "doctor": {
    "id": "doc-new-123",
    "full_name": "Dr. Michael Brown",
    "email": "new.doctor@vit.edu",
    "is_active": true
  }
}
```

**For Rejection:**
```json
{
  "message": "Doctor application rejected",
  "request": {
    "id": "req-123",
    "status": "rejected",
    "rejection_reason": "Incomplete documentation"
  }
}
```

**Business Logic:**

**When Approving:**
1. Updates Clerk user metadata: `role = 'doctor'`
2. Creates doctor record in database
3. Marks approval request as `approved`
4. Sets doctor `is_active = true`

**When Rejecting:**
1. Updates Clerk user metadata: `role = 'rejected_doctor'`
2. Stores rejection reason
3. Marks approval request as `rejected`

**Validation:**
- Cannot reprocess already approved/rejected requests
- `rejection_reason` is required when rejecting

---

### Doctor Management

#### List All Doctors

**Endpoint:** `GET /api/admin/doctors`

**Role:** `admin`

**Query Parameters:**
- `search` - Search by name, email, or specialization
- `is_active` - Filter by active status (`true`, `false`)
- `specialization` - Filter by specialization
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

**Example:** `GET /api/admin/doctors?search=cardio&is_active=true&page=1`

**Success Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "doc-123",
      "full_name": "Dr. Michael Brown",
      "email": "michael.brown@vit.edu",
      "specialization": "Cardiology",
      "qualification": "MBBS, MD, DM",
      "registration_number": "CARD56789",
      "is_active": true,
      "created_at": "2024-03-10T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

#### Get Doctor with Statistics

**Endpoint:** `GET /api/admin/doctors/:id`

**Role:** `admin`

**Success Response:** `200 OK`
```json
{
  "id": "doc-123",
  "full_name": "Dr. Michael Brown",
  "email": "michael.brown@vit.edu",
  "specialization": "Cardiology",
  "qualification": "MBBS, MD, DM",
  "registration_number": "CARD56789",
  "phone_number": "+91-9876543333",
  "is_active": true,
  "created_at": "2024-03-10T10:00:00.000Z",
  "updated_at": "2024-03-15T14:00:00.000Z",
  "stats": {
    "totalConsultations": 245,
    "totalPrescriptions": 198
  }
}
```

---

#### Update Doctor Status

**Endpoint:** `PATCH /api/admin/doctors/:id`

**Role:** `admin`

**Request Body:**
```json
{
  "is_active": false
}
```

**Success Response:** `200 OK`
```json
{
  "id": "doc-123",
  "full_name": "Dr. Michael Brown",
  "is_active": false,
  "updated_at": "2024-03-15T16:00:00.000Z"
}
```

**Use Cases:**
- Deactivate doctors on leave
- Suspend doctors pending investigation
- Reactivate previously deactivated doctors

---

### Analytics & Reports

#### Dashboard Overview

**Endpoint:** `GET /api/admin/analytics/overview`

**Role:** `admin`

**Success Response:** `200 OK`
```json
{
  "totals": {
    "patients": 1250,
    "doctors": 18,
    "activeDoctors": 15,
    "pendingApprovals": 3
  },
  "today": {
    "appointments": 45,
    "consultations": 32
  },
  "weeklyAppointments": [
    { "date": "2024-03-10", "count": 38 },
    { "date": "2024-03-11", "count": 42 },
    { "date": "2024-03-12", "count": 45 },
    { "date": "2024-03-13", "count": 41 },
    { "date": "2024-03-14", "count": 39 },
    { "date": "2024-03-15", "count": 43 },
    { "date": "2024-03-16", "count": 45 }
  ]
}
```

---

#### Visit Trends

**Endpoint:** `GET /api/admin/analytics/visits`

**Role:** `admin`

**Query Parameters:**
- `days` - Number of days (default: 30, max: 365)

**Example:** `GET /api/admin/analytics/visits?days=7`

**Success Response:** `200 OK`
```json
[
  { "date": "2024-03-09", "count": 35 },
  { "date": "2024-03-10", "count": 38 },
  { "date": "2024-03-11", "count": 42 },
  { "date": "2024-03-12", "count": 45 },
  { "date": "2024-03-13", "count": 41 },
  { "date": "2024-03-14", "count": 39 },
  { "date": "2024-03-15", "count": 43 }
]
```

**Features:**
- Fills in missing dates with 0 count
- Useful for charting visit trends

---

#### Peak Consultation Hours

**Endpoint:** `GET /api/admin/analytics/peak-hours`

**Role:** `admin`

**Success Response:** `200 OK`
```json
[
  { "hour": 9, "count": 15 },
  { "hour": 10, "count": 28 },
  { "hour": 11, "count": 35 },
  { "hour": 12, "count": 22 },
  { "hour": 14, "count": 30 },
  { "hour": 15, "count": 25 },
  { "hour": 16, "count": 18 }
]
```

**Features:**
- Analyzes completed appointments only
- Hours are in 24-hour format (0-23)
- Helps identify staffing needs

---

#### Most Common Diagnoses

**Endpoint:** `GET /api/admin/analytics/diagnoses`

**Role:** `admin`

**Query Parameters:**
- `limit` - Number of results (default: 10, max: 50)
- `days` - Time period in days (default: 90, max: 365)

**Example:** `GET /api/admin/analytics/diagnoses?limit=5&days=30`

**Success Response:** `200 OK`
```json
[
  { "diagnosis": "Viral fever", "count": 125 },
  { "diagnosis": "Common cold", "count": 98 },
  { "diagnosis": "Headache", "count": 76 },
  { "diagnosis": "Stomach pain", "count": 54 },
  { "diagnosis": "Allergies", "count": 42 }
]
```

**Features:**
- Case-insensitive grouping
- Ranked by frequency
- Useful for identifying health trends

---

#### Most Prescribed Medicines

**Endpoint:** `GET /api/admin/analytics/medicines`

**Role:** `admin`

**Query Parameters:**
- `limit` - Number of results (default: 10, max: 50)

**Example:** `GET /api/admin/analytics/medicines?limit=5`

**Success Response:** `200 OK`
```json
[
  { "medicine": "Paracetamol", "count": 245 },
  { "medicine": "Ibuprofen", "count": 156 },
  { "medicine": "Amoxicillin", "count": 134 },
  { "medicine": "Cetirizine", "count": 98 },
  { "medicine": "Omeprazole", "count": 76 }
]
```

**Features:**
- Parses medicines from all prescriptions
- Ranked by prescription frequency
- Helps with inventory planning

---

#### Patient Demographics

**Endpoint:** `GET /api/admin/analytics/demographics`

**Role:** `admin`

**Success Response:** `200 OK`
```json
{
  "gender": [
    { "gender": "male", "count": 685 },
    { "gender": "female", "count": 525 },
    { "gender": "other", "count": 40 }
  ],
  "bloodGroup": [
    { "blood_group": "O+", "count": 425 },
    { "blood_group": "A+", "count": 350 },
    { "blood_group": "B+", "count": 275 },
    { "blood_group": "AB+", "count": 125 },
    { "blood_group": "O-", "count": 45 },
    { "blood_group": "A-", "count": 20 },
    { "blood_group": "B-", "count": 8 },
    { "blood_group": "AB-", "count": 2 }
  ]
}
```

**Use Cases:**
- Health planning
- Resource allocation
- Statistical reporting

---

### System Health

#### Basic Health Check

**Endpoint:** `GET /health`

**Role:** Public

**Success Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-03-15T16:30:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "phase": 4
}
```

---

#### Detailed Health Check

**Endpoint:** `GET /api/system/health/detailed`

**Role:** `admin`

**Success Response:** `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2024-03-15T16:30:00.000Z",
  "checks": {
    "database": {
      "status": "healthy",
      "latencyMs": 15
    },
    "storage": {
      "status": "healthy"
    }
  },
  "totalLatencyMs": 18
}
```

**Status Values:**
- `healthy` - All systems operational
- `degraded` - Some systems experiencing issues
- `unhealthy` - Critical systems down

---

#### API Documentation

**Endpoint:** `GET /api/docs`

**Role:** Public (authenticated)

**Success Response:** `200 OK`
```json
{
  "name": "ViCare API Documentation",
  "version": "1.0.0",
  "phase": 4,
  "endpoints": {
    "auth": [
      {
        "method": "POST",
        "path": "/api/auth/complete-signup",
        "description": "Complete user registration",
        "roles": ["authenticated"]
      }
    ],
    "patients": [...],
    "doctors": [...],
    "appointments": [...],
    "consultations": [...],
    "prescriptions": [...],
    "certificates": [...],
    "admin": [...],
    "system": [...]
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "message": "Detailed explanation (optional)"
}
```

### Common HTTP Status Codes

- `200 OK` - Successful GET, PUT, PATCH, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource or business rule violation
- `500 Internal Server Error` - Server error

---

## Rate Limiting

Currently not implemented. Future versions may include rate limiting.

---

## CORS

The API supports Cross-Origin Resource Sharing (CORS) for the configured frontend URL.

**Allowed Origins:**
- Development: `http://localhost:3000`
- Production: Configured via `FRONTEND_URL` environment variable

---

## Environment Variables

Required environment variables:

```env
# Server
PORT=4000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Additional Resources

- **API Base URL (Development):** `http://localhost:4000`
- **Health Check:** `http://localhost:4000/health`
- **Interactive Documentation:** `http://localhost:4000/api/docs`

---

**Last Updated:** March 2024  
**Version:** 1.0.0  
**Phase:** 4 Complete

