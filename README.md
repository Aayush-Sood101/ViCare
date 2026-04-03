<div align="center">

# 🏥 ViCare

### University Campus Healthcare Platform

*Digitizing healthcare services at Sri Narayani Health Centre, VIT*

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue?logo=postgresql)](https://supabase.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [API Docs](#-api-documentation)

</div>

---

## 📋 Overview

ViCare is a comprehensive, full-stack healthcare management platform built specifically for **Sri Narayani Health Centre** at Vellore Institute of Technology. It replaces traditional paper-based workflows with a secure, role-based digital ecosystem that streamlines medical services for the entire campus community.

### 👥 Primary Users

- **🎓 Students (Patients)** — Book appointments, view consultation history, download prescriptions and medical certificates
- **👨‍⚕️ Doctors** — Manage appointments, conduct consultations, issue prescriptions and medical certificates, track patient records
- **👔 Administrators** — Approve doctor registrations, monitor system analytics, manage platform operations

---

## ✨ Features

### For Students
- 📅 **Appointment Booking** — Schedule visits with available doctors
- 📊 **Health Dashboard** — View complete medical history and records
- 💊 **Prescription Access** — Download prescriptions as PDF documents
- 📄 **Medical Certificates** — Obtain and download medical certificates
- 🔔 **Real-time Updates** — Track appointment status and token numbers

### For Doctors
- 📋 **Patient Management** — Access comprehensive patient profiles
- 🩺 **Digital Consultations** — Record diagnoses, vitals, and treatment plans
- 💊 **E-Prescriptions** — Generate PDF prescriptions with digital signatures
- 📄 **Certificate Issuance** — Issue medical certificates with validity periods
- 📈 **Performance Stats** — View consultation metrics and appointment analytics

### For Administrators
- ✅ **Doctor Approval System** — Review and approve/reject doctor registrations
- 📊 **Analytics Dashboard** — Monitor visit trends, peak hours, and demographics
- 🏥 **Healthcare Insights** — Track common diagnoses and medicine usage
- 👥 **User Management** — Manage doctors and patients, control access
- 💡 **System Health** — Monitor database and storage performance

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.2 | React framework with App Router and Server Components |
| **React** | 19.2 | UI library for building interactive interfaces |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **Clerk** | 7.0 | Authentication and user management |
| **TanStack Query** | 5.96 | Server state management and data fetching |
| **Radix UI** | Latest | Accessible component primitives |
| **Axios** | 1.14 | HTTP client for API requests |
| **Recharts** | 3.8 | Data visualization and charts |
| **Lucide React** | 1.7 | Icon library |
| **date-fns** | 4.1 | Date utility library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20+ | JavaScript runtime |
| **Express** | 4.18 | Web application framework |
| **TypeScript** | 5.3 | Type-safe JavaScript |
| **Clerk Express** | 1.0 | JWT authentication middleware |
| **Supabase JS** | 2.39 | PostgreSQL database client |
| **PDFKit** | 0.14 | PDF document generation |
| **Jest** | 30.3 | Testing framework |
| **Supertest** | 7.2 | HTTP assertion library |

### Database & Services
| Service | Purpose |
|---------|---------|
| **Supabase (PostgreSQL)** | Primary database with Row Level Security |
| **Supabase Storage** | Secure file storage for PDFs |
| **Clerk** | Authentication, JWT tokens, role management |

### Development Tools
- **ts-node-dev** — Fast TypeScript development server
- **ESLint** — Code linting and quality
- **PostCSS** — CSS processing

---

## 🏗 Architecture

### System Design Principles

- **🏥 Single Hospital Model** — All operations scoped to one healthcare institution
- **🔐 JWT-based Authentication** — Clerk handles auth, roles stored in user metadata
- **👨‍⚕️ Doctor Approval Workflow** — `pending_doctor` → Admin Review → `doctor` or `rejected_doctor`
- **📄 Server-side PDF Generation** — PDFKit generates documents, Supabase Storage hosts with signed URLs
- **🎯 Role-based Access Control** — Middleware enforces permissions at route level
- **📊 Real-time Analytics** — Aggregated queries for dashboard insights

### Database Schema

```
┌─────────────────┐         ┌──────────────────┐
│    patients     │         │     doctors      │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │         │ id (PK)          │
│ clerk_user_id   │         │ clerk_user_id    │
│ student_id      │         │ specialization   │
│ full_name       │         │ qualification    │
│ blood_group     │         │ is_active        │
│ emergency_info  │         │ registration_no  │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         │    ┌──────────────────┐   │
         └────┤  appointments    ├───┘
              ├──────────────────┤
              │ id (PK)          │
              │ patient_id (FK)  │
              │ doctor_id (FK)   │
              │ token_number     │
              │ status           │
              └────────┬─────────┘
                       │
              ┌────────┴─────────┐
              │  consultations   │
              ├──────────────────┤
              │ id (PK)          │
              │ appointment_id   │
              │ diagnosis        │
              │ vitals (JSON)    │
              │ treatment_plan   │
              └────────┬─────────┘
                       │
         ┌─────────────┼─────────────┐
         │                           │
┌────────┴─────────┐      ┌──────────┴────────┐
│  prescriptions   │      │   certificates    │
├──────────────────┤      ├───────────────────┤
│ id (PK)          │      │ id (PK)           │
│ consultation_id  │      │ consultation_id   │
│ medicines (JSON) │      │ reason            │
│ pdf_url          │      │ from_date         │
└──────────────────┘      │ to_date           │
                          │ pdf_url           │
                          └───────────────────┘
```

### Project Structure

```
ViCare/
├── backend/                    # Express REST API Server
│   ├── src/
│   │   ├── config/            # Database & Clerk configuration
│   │   │   ├── database.ts    # Supabase client setup
│   │   │   └── clerk.ts       # Clerk authentication config
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.ts        # JWT verification
│   │   │   └── roles.ts       # Role-based access control
│   │   ├── routes/            # API route handlers
│   │   │   ├── auth.ts        # Authentication endpoints
│   │   │   ├── patients.ts    # Patient management
│   │   │   ├── doctors.ts     # Doctor management
│   │   │   ├── appointments.ts
│   │   │   ├── consultations.ts
│   │   │   ├── prescriptions.ts
│   │   │   ├── certificates.ts
│   │   │   ├── admin.ts       # Admin operations
│   │   │   └── system.ts      # Health checks
│   │   ├── utils/             # Utility functions
│   │   │   ├── pdf.ts         # PDF generation
│   │   │   └── validation.ts  # Input validation
│   │   ├── types/             # TypeScript type definitions
│   │   ├── __tests__/         # Test suites
│   │   └── index.ts           # Server entry point
│   ├── database/
│   │   └── init.sql           # Database schema
│   └── package.json
│
├── frontend/                   # Next.js Application
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── (public)/      # Public routes
│   │   │   │   ├── page.tsx   # Landing page
│   │   │   │   ├── sign-in/   # Login
│   │   │   │   └── sign-up/   # Registration
│   │   │   ├── complete-signup/
│   │   │   ├── patient/       # Patient dashboard
│   │   │   ├── doctor/        # Doctor dashboard
│   │   │   └── admin/         # Admin dashboard
│   │   ├── components/        # React components
│   │   │   ├── ui/            # Reusable UI components
│   │   │   ├── layouts/       # Layout components
│   │   │   └── providers/     # Context providers
│   │   └── types/             # TypeScript types
│   ├── public/                # Static assets
│   └── package.json
│
└── docs/                       # Documentation
    ├── Phase1/                # Setup documentation
    ├── Phase2/                # Auth documentation
    ├── Phase3/                # Core features
    ├── Phase4/                # Admin features
    ├── API_REFERENCE.md       # Complete API docs
    └── phase-*.md             # Phase guides
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20 or higher
- **npm** or **yarn**
- **Supabase Account** — [Create one here](https://supabase.com)
- **Clerk Account** — [Create one here](https://clerk.com)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Aayush-Sood101/ViCare.git
cd ViCare
```

#### 2. Set Up Database

1. Create a new Supabase project
2. Run the database initialization script:
   ```bash
   # Copy contents of backend/database/init.sql
   # Paste into Supabase SQL Editor and execute
   ```

#### 3. Configure Clerk

1. Create a new Clerk application
2. Enable Email/Password authentication
3. Configure user metadata fields for roles
4. Copy your API keys

#### 4. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials:
# PORT=4000
# CLERK_SECRET_KEY=sk_test_...
# CLERK_PUBLISHABLE_KEY=pk_test_...
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_KEY=your-service-role-key

# Start development server
npm run dev
```

The backend will start on `http://localhost:4000`

#### 5. Frontend Setup

```bash
cd frontend
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
# CLERK_SECRET_KEY=sk_test_...
# NEXT_PUBLIC_API_URL=http://localhost:4000

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`

#### 6. Create Admin User

```bash
cd backend
npm run seed:admin
```

Follow the prompts to create an admin account with full system access.

---

## 📚 Development Phases

The project follows a **backend-first** development approach across 5 phases:

| Phase | Status | Focus | Key Deliverables |
|-------|--------|-------|------------------|
| **Phase 1** | ✅ Complete | Project Setup & Database Schema | Supabase tables, relationships, indexes |
| **Phase 2** | ✅ Complete | Auth Infrastructure | Clerk integration, JWT middleware, role guards |
| **Phase 3** | ✅ Complete | Core Healthcare APIs | Patients, doctors, appointments, consultations |
| **Phase 4** | ✅ Complete | Admin & PDF Generation | Doctor approvals, analytics, PDF prescriptions |
| **Phase 5** | ✅ Complete | Frontend Implementation | Next.js UI, role-based dashboards |

### Phase Documentation

- [Phase 1: Setup & Database](docs/phase-1-setup.md)
- [Phase 2: Authentication](docs/Phase2/)
- [Phase 3: Patient & Doctor APIs](docs/Phase3/)
- [Phase 4: Admin & Analytics](docs/Phase4/)

---

## 🔐 User Roles & Permissions

| Role | How Assigned | Capabilities |
|------|--------------|--------------|
| **`patient`** | Auto-assigned on student signup | Book appointments, view own records, download prescriptions/certificates |
| **`pending_doctor`** | Auto-assigned on doctor signup | Access to holding screen only, awaiting admin approval |
| **`doctor`** | Admin approval required | Manage appointments, conduct consultations, issue prescriptions/certificates, view all patient records |
| **`rejected_doctor`** | Admin rejection | View rejection reason and message |
| **`admin`** | Manual database seed | Full platform access, approve doctors, view analytics, manage users |

**Role Storage:** All roles are stored in Clerk user metadata under the `role` field and enforced via Express middleware.

---

## 📖 API Documentation

### Base URL
- **Development:** `http://localhost:4000`
- **Health Check:** `http://localhost:4000/health`

### Authentication
All protected endpoints require a Clerk JWT token:
```
Authorization: Bearer <clerk_jwt_token>
```

### Key Endpoints

#### Authentication
- `POST /api/auth/complete-signup` — Complete user registration
- `GET /api/auth/status` — Get current auth status

#### Patients
- `GET /api/patients/me` — Get own profile
- `PUT /api/patients/me` — Update own profile
- `GET /api/patients/:id/history` — Get consultation history

#### Doctors
- `GET /api/doctors` — List active doctors
- `GET /api/doctors/me` — Get own profile
- `GET /api/doctors/me/stats` — Get statistics

#### Appointments
- `POST /api/appointments` — Book appointment
- `GET /api/appointments` — Get appointments (role-filtered)
- `PATCH /api/appointments/:id/status` — Update status

#### Consultations
- `POST /api/consultations` — Create consultation record
- `GET /api/consultations/me` — Get own consultations
- `GET /api/consultations/:id` — Get single consultation

#### Prescriptions
- `POST /api/prescriptions` — Issue prescription (generates PDF)
- `GET /api/prescriptions/me` — Get own prescriptions
- `GET /api/prescriptions/:id/pdf` — Get signed PDF URL

#### Medical Certificates
- `POST /api/certificates` — Issue certificate (generates PDF)
- `GET /api/certificates/me` — Get own certificates
- `GET /api/certificates/:id/pdf` — Get signed PDF URL

#### Admin
- `GET /api/admin/approval-requests` — List doctor applications
- `PATCH /api/admin/approval-requests/:id` — Approve/reject doctor
- `GET /api/admin/analytics/overview` — Dashboard metrics
- `GET /api/admin/analytics/visits` — Visit trends
- `GET /api/admin/analytics/diagnoses` — Common diagnoses

For complete API documentation, see [API_REFERENCE.md](docs/API_REFERENCE.md)

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific phase tests
npm run test:phase4

# Watch mode
npm run test:watch
```

### Test Coverage
- Authentication middleware
- Role-based access control
- API endpoints
- PDF generation
- Database queries

---

## 📊 Analytics Features

The admin dashboard provides comprehensive insights:

- **Overview Metrics** — Total patients, doctors, appointments, consultations
- **Visit Trends** — Daily/weekly/monthly appointment patterns
- **Peak Hours Analysis** — Identify busiest consultation times
- **Diagnosis Tracking** — Most common health issues
- **Medicine Analytics** — Frequently prescribed medications
- **Demographics** — Gender and blood group distribution
- **Doctor Performance** — Individual consultation statistics

---

## 🔒 Security Features

- **JWT Authentication** — Clerk-managed tokens with automatic refresh
- **Role-based Access Control** — Middleware enforces permissions
- **Signed URLs** — Temporary access to private PDF documents
- **Input Validation** — Server-side validation on all endpoints
- **SQL Injection Protection** — Parameterized queries via Supabase
- **CORS Configuration** — Restricted to authorized origins
- **Environment Variables** — Sensitive credentials in .env files

---

## 🚀 Deployment

### Backend Deployment (Railway/Render/Vercel)

1. Set environment variables
2. Build the project: `npm run build`
3. Start the server: `npm start`

### Frontend Deployment (Vercel)

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Database (Supabase)

Already hosted — just configure the connection URL in your backend environment.

---

## 📝 Environment Variables

### Backend (`.env`)
```bash
PORT=4000
NODE_ENV=production

# Clerk
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# Optional
FRONTEND_URL=http://localhost:3000
```

### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 🤝 Contributing

This is a university project for VIT. For contributions:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary to **Vellore Institute of Technology**.

---

## 👨‍💻 Authors

- **Aayush Sood** — [GitHub](https://github.com/Aayush-Sood101)

---

## 🙏 Acknowledgments

- **Sri Narayani Health Centre, VIT** — For the problem statement and domain knowledge
- **Clerk** — For robust authentication infrastructure
- **Supabase** — For database and storage solutions
- **Vercel** — For Next.js and hosting platform

---

<div align="center">

**Built with ❤️ for VIT Community**

[Report Bug](https://github.com/Aayush-Sood101/ViCare/issues) • [Request Feature](https://github.com/Aayush-Sood101/ViCare/issues)

</div>
