# ViCare — University Campus Healthcare Platform

A full-stack, web-based healthcare management platform for **Sri Narayani Health Centre** — the single on-campus health facility at Vellore Institute of Technology.

## Overview

ViCare digitizes and streamlines medical services by replacing paper-based workflows with a secure, role-aware digital ecosystem. The platform serves three primary actors:

- **Students (Patients)** — Book appointments, view health records, download prescriptions
- **Doctors** — Manage consultations, issue prescriptions and certificates
- **Administrators** — Approve doctors, view analytics, manage the platform

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router, RSC) |
| Backend | Node.js + Express (REST API) |
| Database | Supabase (PostgreSQL) |
| Authentication | Clerk (JWT-based) |
| Role Management | Clerk Public Metadata |
| File Storage | Supabase Storage |
| Styling | Tailwind CSS |

## Architecture Highlights

- **Single Hospital Model** — All operations scoped to one institution
- **Clerk-based Auth** — JWT verification on Express, roles in Clerk metadata
- **Doctor Approval Flow** — `pending_doctor` → Admin review → `doctor`
- **PDF Generation** — Server-side with signed Supabase Storage URLs

## Project Structure

```
vicare/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── config/         # Database & Clerk config
│   │   ├── middleware/     # Auth & role guards
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic
│   │   └── utils/          # PDF generation, helpers
│   └── package.json
│
├── frontend/               # Next.js application
│   ├── app/
│   │   ├── (public)/      # Landing, auth pages
│   │   ├── (patient)/     # Patient dashboard & features
│   │   ├── (doctor)/      # Doctor dashboard & features
│   │   └── (admin)/       # Admin dashboard & features
│   └── package.json
│
└── docs/                   # Phase documentation
```

## Development Phases

The project is divided into 5 phases (backend-first approach):

| Phase | Focus | Documentation |
|-------|-------|---------------|
| 1 | Project Setup & Database Schema | [docs/phase-1-setup.md](docs/phase-1-setup.md) |
| 2 | Auth Infrastructure & Core Middleware | [docs/phase-2-auth.md](docs/phase-2-auth.md) |
| 3 | Patient & Doctor Backend APIs | [docs/phase-3-patient-doctor-api.md](docs/phase-3-patient-doctor-api.md) |
| 4 | Admin APIs & PDF Generation | [docs/phase-4-admin-pdf.md](docs/phase-4-admin-pdf.md) |
| 5 | Frontend Implementation | [docs/phase-5-frontend.md](docs/phase-5-frontend.md) |

## Quick Start

```bash
# Backend
cd backend
npm install
cp .env.example .env  # Configure Clerk & Supabase keys
npm run dev

# Frontend (after backend is complete)
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Environment Variables

### Backend (.env)
```
PORT=4000
CLERK_SECRET_KEY=sk_test_xxx
CLERK_PUBLISHABLE_KEY=pk_test_xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxx
```

### Frontend (.env.local)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## User Roles

| Role | Stored In | Access |
|------|-----------|--------|
| `patient` | Clerk metadata | Patient dashboard, own records |
| `pending_doctor` | Clerk metadata | Holding screen only |
| `doctor` | Clerk metadata | Doctor dashboard, all patient records |
| `rejected_doctor` | Clerk metadata | Rejection screen with reason |
| `admin` | Clerk metadata | Full platform access |

## License

Private — VIT University
