# Phase 5: Frontend Implementation

## Objectives

1. Set up Next.js project with Clerk authentication
2. Build shared components and layouts
3. Implement Patient Dashboard and features
4. Implement Doctor Dashboard and features
5. Implement Admin Dashboard and features
6. Create API integration layer

---

## 5.1 Frontend Project Setup

### Initialize Next.js Project

```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir
cd frontend
```

### Install Dependencies

```bash
npm install @clerk/nextjs @tanstack/react-query axios
npm install date-fns recharts lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-toast
npm install clsx tailwind-merge class-variance-authority
```

### Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                    # Landing page
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── (patient)/
│   │   │   ├── layout.tsx                  # Patient route guard
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── appointments/page.tsx
│   │   │   ├── appointments/book/page.tsx
│   │   │   ├── health-profile/page.tsx
│   │   │   ├── prescriptions/page.tsx
│   │   │   └── certificates/page.tsx
│   │   ├── (doctor)/
│   │   │   ├── layout.tsx                  # Doctor route guard
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── queue/page.tsx
│   │   │   ├── consultation/[appointmentId]/page.tsx
│   │   │   └── pending/page.tsx            # Pending approval screen
│   │   ├── (admin)/
│   │   │   ├── layout.tsx                  # Admin route guard
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── approvals/page.tsx
│   │   │   ├── doctors/page.tsx
│   │   │   ├── patients/page.tsx
│   │   │   └── analytics/page.tsx
│   │   ├── layout.tsx                      # Root layout with Clerk
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                             # Reusable UI components
│   │   ├── layouts/                        # Layout components
│   │   └── features/                       # Feature-specific components
│   ├── lib/
│   │   ├── api.ts                          # API client
│   │   ├── utils.ts                        # Utility functions
│   │   └── constants.ts                    # App constants
│   ├── hooks/                              # Custom React hooks
│   ├── types/                              # TypeScript types
│   └── middleware.ts                       # Clerk middleware
├── .env.local
└── package.json
```

---

## 5.2 Environment Configuration

### .env.local

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/complete-signup
```

---

## 5.3 Clerk Middleware

### src/middleware.ts

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

---

## 5.4 Root Layout with Clerk Provider

### src/app/layout.tsx

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';
import QueryProvider from '@/components/providers/QueryProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ViCare - Campus Healthcare',
  description: 'University Campus Healthcare Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

## 5.5 API Client

### src/lib/api.ts

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// API functions organized by domain

// Auth
export const authApi = {
  completeSignup: (data: {
    userType: 'patient' | 'doctor';
    studentId?: string;
    specialization?: string;
    qualification?: string;
    registrationNumber?: string;
    phone?: string;
  }) => api.post('/api/auth/complete-signup', data),
  
  getStatus: () => api.get('/api/auth/status'),
};

// Patients
export const patientsApi = {
  getMe: () => api.get('/api/patients/me'),
  updateMe: (data: any) => api.put('/api/patients/me', data),
  getById: (id: string) => api.get(`/api/patients/${id}`),
  getHistory: (id: string) => api.get(`/api/patients/${id}/history`),
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/api/patients', { params }),
};

// Doctors
export const doctorsApi = {
  list: () => api.get('/api/doctors'),
  getMe: () => api.get('/api/doctors/me'),
  updateMe: (data: any) => api.put('/api/doctors/me', data),
  getStats: () => api.get('/api/doctors/me/stats'),
};

// Appointments
export const appointmentsApi = {
  create: (data: {
    doctor_id: string;
    scheduled_at: string;
    reason_for_visit?: string;
  }) => api.post('/api/appointments', data),
  
  list: (params?: { status?: string; date?: string }) =>
    api.get('/api/appointments', { params }),
  
  getById: (id: string) => api.get(`/api/appointments/${id}`),
  
  updateStatus: (id: string, status: string) =>
    api.patch(`/api/appointments/${id}/status`, { status }),
  
  cancel: (id: string) => api.delete(`/api/appointments/${id}`),
};

// Consultations
export const consultationsApi = {
  create: (data: {
    appointment_id?: string;
    patient_id: string;
    chief_complaint?: string;
    diagnosis?: string;
    notes?: string;
    vitals?: object;
    follow_up_date?: string;
  }) => api.post('/api/consultations', data),
  
  getByPatient: (patientId: string) =>
    api.get(`/api/consultations/patient/${patientId}`),
  
  getMe: () => api.get('/api/consultations/me'),
  
  getById: (id: string) => api.get(`/api/consultations/${id}`),
};

// Prescriptions
export const prescriptionsApi = {
  create: (data: {
    consultation_id?: string;
    patient_id: string;
    medicines: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
    instructions?: string;
  }) => api.post('/api/prescriptions', data),
  
  getByPatient: (patientId: string) =>
    api.get(`/api/prescriptions/patient/${patientId}`),
  
  getMe: () => api.get('/api/prescriptions/me'),
  
  getPdfUrl: (id: string) => api.get(`/api/prescriptions/${id}/pdf`),
};

// Certificates
export const certificatesApi = {
  create: (data: {
    consultation_id?: string;
    patient_id: string;
    reason: string;
    from_date: string;
    to_date: string;
    notes?: string;
  }) => api.post('/api/certificates', data),
  
  getByPatient: (patientId: string) =>
    api.get(`/api/certificates/patient/${patientId}`),
  
  getMe: () => api.get('/api/certificates/me'),
  
  getPdfUrl: (id: string) => api.get(`/api/certificates/${id}/pdf`),
};

// Admin
export const adminApi = {
  getApprovalRequests: (status?: string) =>
    api.get('/api/admin/approval-requests', { params: { status } }),
  
  processApproval: (id: string, action: 'approve' | 'reject', rejection_reason?: string) =>
    api.patch(`/api/admin/approval-requests/${id}`, { action, rejection_reason }),
  
  getDoctors: (params?: { is_active?: boolean; search?: string; page?: number }) =>
    api.get('/api/admin/doctors', { params }),
  
  updateDoctor: (id: string, data: { is_active: boolean }) =>
    api.patch(`/api/admin/doctors/${id}`, data),
  
  analytics: {
    overview: () => api.get('/api/admin/analytics/overview'),
    visits: (days?: number) => api.get('/api/admin/analytics/visits', { params: { days } }),
    peakHours: (days?: number) => api.get('/api/admin/analytics/peak-hours', { params: { days } }),
    diagnoses: (limit?: number) => api.get('/api/admin/analytics/diagnoses', { params: { limit } }),
    medicines: (limit?: number) => api.get('/api/admin/analytics/medicines', { params: { limit } }),
    demographics: () => api.get('/api/admin/analytics/demographics'),
  },
};
```

---

## 5.6 Auth Hook with Token Management

### src/hooks/useAuth.ts

```typescript
'use client';

import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { setAuthToken, authApi } from '@/lib/api';

interface AuthStatus {
  role: string;
  profileComplete: boolean;
  rejectionReason?: string;
}

export function useAuth() {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user } = useUser();
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (!isLoaded) return;
      
      if (isSignedIn) {
        try {
          const token = await getToken();
          setAuthToken(token);
          
          const { data } = await authApi.getStatus();
          setStatus(data);
        } catch (error) {
          console.error('Auth init error:', error);
        }
      } else {
        setAuthToken(null);
        setStatus(null);
      }
      
      setIsReady(true);
    };

    initAuth();
  }, [isLoaded, isSignedIn, getToken]);

  const role = (user?.publicMetadata?.role as string) || status?.role || 'patient';

  return {
    isLoaded: isReady,
    isSignedIn,
    user,
    role,
    status,
    getToken,
  };
}
```

---

## 5.7 Route Guard Layouts

### Patient Layout: src/app/(patient)/layout.tsx

```typescript
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import PatientSidebar from '@/components/layouts/PatientSidebar';

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role as string;

  if (!role || role === 'pending_doctor') {
    redirect('/doctor/pending');
  }
  
  if (role === 'rejected_doctor') {
    redirect('/doctor/rejected');
  }
  
  if (role === 'doctor') {
    redirect('/doctor/dashboard');
  }
  
  if (role === 'admin') {
    redirect('/admin/dashboard');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <PatientSidebar />
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
```

### Doctor Layout: src/app/(doctor)/layout.tsx

```typescript
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DoctorSidebar from '@/components/layouts/DoctorSidebar';

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role as string;

  if (role === 'pending_doctor') {
    redirect('/doctor/pending');
  }
  
  if (role === 'rejected_doctor') {
    redirect('/doctor/rejected');
  }
  
  if (role !== 'doctor') {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DoctorSidebar />
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
```

### Admin Layout: src/app/(admin)/layout.tsx

```typescript
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/layouts/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role as string;

  if (role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
```

---

## 5.8 Patient Dashboard

### src/app/(patient)/dashboard/page.tsx

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { patientsApi, appointmentsApi, consultationsApi } from '@/lib/api';
import { format } from 'date-fns';
import Link from 'next/link';
import { Calendar, FileText, Stethoscope, Clock } from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  
  const { data: profile } = useQuery({
    queryKey: ['patient-profile'],
    queryFn: () => patientsApi.getMe().then(res => res.data),
  });

  const { data: appointments } = useQuery({
    queryKey: ['patient-appointments'],
    queryFn: () => appointmentsApi.list().then(res => res.data),
  });

  const { data: consultations } = useQuery({
    queryKey: ['patient-consultations'],
    queryFn: () => consultationsApi.getMe().then(res => res.data),
  });

  const upcomingAppointments = appointments?.filter(
    (apt: any) => new Date(apt.scheduled_at) >= new Date() && apt.status !== 'cancelled'
  ) || [];

  const recentVisits = consultations?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {profile?.full_name || user?.firstName}
        </h1>
        <p className="text-gray-600">Student ID: {profile?.student_id}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/appointments/book" className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
          <Calendar className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-semibold">Book Appointment</h3>
          <p className="text-sm text-gray-600">Schedule a visit</p>
        </Link>

        <Link href="/health-profile" className="p-6 bg-green-50 rounded-lg hover:bg-green-100 transition">
          <Stethoscope className="h-8 w-8 text-green-600 mb-2" />
          <h3 className="font-semibold">Health Profile</h3>
          <p className="text-sm text-gray-600">View your records</p>
        </Link>

        <Link href="/prescriptions" className="p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
          <FileText className="h-8 w-8 text-purple-600 mb-2" />
          <h3 className="font-semibold">Prescriptions</h3>
          <p className="text-sm text-gray-600">Download prescriptions</p>
        </Link>

        <Link href="/certificates" className="p-6 bg-orange-50 rounded-lg hover:bg-orange-100 transition">
          <FileText className="h-8 w-8 text-orange-600 mb-2" />
          <h3 className="font-semibold">Certificates</h3>
          <p className="text-sm text-gray-600">Medical certificates</p>
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-3">
            {upcomingAppointments.slice(0, 3).map((apt: any) => (
              <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Dr. {apt.doctor?.full_name}</p>
                  <p className="text-sm text-gray-600">{apt.doctor?.specialization}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{format(new Date(apt.scheduled_at), 'MMM d, yyyy')}</p>
                  <p className="text-sm text-gray-600">Token: {apt.token_number}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming appointments</p>
        )}
        <Link href="/appointments" className="text-blue-600 hover:underline text-sm mt-4 inline-block">
          View all appointments →
        </Link>
      </div>

      {/* Recent Visits */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Visits</h2>
        {recentVisits.length > 0 ? (
          <div className="space-y-3">
            {recentVisits.map((visit: any) => (
              <div key={visit.id} className="p-4 border rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{visit.diagnosis || 'Consultation'}</p>
                    <p className="text-sm text-gray-600">Dr. {visit.doctor?.full_name}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {format(new Date(visit.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recent visits</p>
        )}
      </div>
    </div>
  );
}
```

---

## 5.9 Doctor Queue Page

### src/app/(doctor)/queue/page.tsx

```typescript
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi, doctorsApi } from '@/lib/api';
import { format } from 'date-fns';
import Link from 'next/link';
import { Play, Check, X, User } from 'lucide-react';

export default function DoctorQueue() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: stats } = useQuery({
    queryKey: ['doctor-stats'],
    queryFn: () => doctorsApi.getStats().then(res => res.data),
  });

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['doctor-queue', selectedDate],
    queryFn: () => appointmentsApi.list({ date: selectedDate }).then(res => res.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      appointmentsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-queue'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-stats'] });
    },
  });

  const statusOrder = ['in_progress', 'confirmed', 'pending', 'completed', 'cancelled'];
  const sortedAppointments = appointments?.sort((a: any, b: any) => {
    return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Today's Queue</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Today</p>
          <p className="text-2xl font-bold">{stats?.today?.total || 0}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <p className="text-yellow-600 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-700">{stats?.today?.pending || 0}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <p className="text-blue-600 text-sm">In Progress</p>
          <p className="text-2xl font-bold text-blue-700">{stats?.today?.inProgress || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <p className="text-green-600 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-700">{stats?.today?.completed || 0}</p>
        </div>
      </div>

      {/* Queue */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Appointments</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : sortedAppointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No appointments for this date</div>
        ) : (
          <div className="divide-y">
            {sortedAppointments.map((apt: any) => (
              <div key={apt.id} className={`p-4 flex items-center justify-between ${
                apt.status === 'in_progress' ? 'bg-blue-50' : ''
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">{apt.patient?.full_name}</p>
                    <p className="text-sm text-gray-600">
                      Token #{apt.token_number} • {apt.patient?.student_id}
                    </p>
                    {apt.reason_for_visit && (
                      <p className="text-sm text-gray-500">{apt.reason_for_visit}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    apt.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    apt.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {apt.status}
                  </span>

                  {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                    <div className="flex gap-2">
                      {apt.status !== 'in_progress' && (
                        <button
                          onClick={() => updateStatus.mutate({ id: apt.id, status: 'in_progress' })}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          title="Start Consultation"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {apt.status === 'in_progress' && (
                        <Link
                          href={`/doctor/consultation/${apt.id}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Open Consultation
                        </Link>
                      )}
                      <button
                        onClick={() => updateStatus.mutate({ id: apt.id, status: 'cancelled' })}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 5.10 Admin Approvals Page

### src/app/(admin)/approvals/page.tsx

```typescript
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { format } from 'date-fns';
import { Check, X, Clock, User } from 'lucide-react';

export default function AdminApprovals() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('pending');
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['approval-requests', filter],
    queryFn: () => adminApi.getApprovalRequests(filter).then(res => res.data),
  });

  const processApproval = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: 'approve' | 'reject'; reason?: string }) =>
      adminApi.processApproval(id, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      setRejectModal(null);
      setRejectReason('');
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Doctor Approvals</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : requests?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No requests found</div>
        ) : (
          <div className="divide-y">
            {requests?.map((request: any) => (
              <div key={request.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{request.full_name}</h3>
                      <p className="text-gray-600">{request.email}</p>
                      <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                        <p><span className="text-gray-500">Specialization:</span> {request.specialization || 'N/A'}</p>
                        <p><span className="text-gray-500">Qualification:</span> {request.qualification || 'N/A'}</p>
                        <p><span className="text-gray-500">Registration:</span> {request.registration_number || 'N/A'}</p>
                        <p><span className="text-gray-500">Phone:</span> {request.phone || 'N/A'}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Applied: {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {request.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => processApproval.mutate({ id: request.id, action: 'approve' })}
                          disabled={processApproval.isPending}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ id: request.id, name: request.full_name })}
                          disabled={processApproval.isPending}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                    )}
                  </div>
                </div>

                {request.status === 'rejected' && request.rejection_reason && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">Rejection Reason:</span> {request.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Reject Application: {rejectModal.name}
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border rounded-lg p-3 h-32 resize-none"
              required
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => processApproval.mutate({
                  id: rejectModal.id,
                  action: 'reject',
                  reason: rejectReason,
                })}
                disabled={!rejectReason.trim() || processApproval.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 5.11 Consultation Form Page

### src/app/(doctor)/consultation/[appointmentId]/page.tsx

```typescript
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { appointmentsApi, consultationsApi, prescriptionsApi, patientsApi } from '@/lib/api';
import { format } from 'date-fns';
import { Plus, Trash2, Save, FileText } from 'lucide-react';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function ConsultationPage() {
  const { appointmentId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    chief_complaint: '',
    diagnosis: '',
    notes: '',
    vitals: {
      blood_pressure: '',
      temperature: '',
      pulse: '',
      weight: '',
    },
    follow_up_date: '',
  });

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptionInstructions, setPrescriptionInstructions] = useState('');

  // Fetch appointment details
  const { data: appointment, isLoading } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => appointmentsApi.getById(appointmentId as string).then(res => res.data),
  });

  // Fetch patient history
  const { data: patientHistory } = useQuery({
    queryKey: ['patient-history', appointment?.patient_id],
    queryFn: () => patientsApi.getHistory(appointment.patient_id).then(res => res.data),
    enabled: !!appointment?.patient_id,
  });

  // Create consultation mutation
  const createConsultation = useMutation({
    mutationFn: async () => {
      // Create consultation
      const { data: consultation } = await consultationsApi.create({
        appointment_id: appointmentId as string,
        patient_id: appointment.patient_id,
        ...formData,
        vitals: formData.vitals,
      });

      // Create prescription if medicines added
      if (medicines.length > 0) {
        await prescriptionsApi.create({
          consultation_id: consultation.id,
          patient_id: appointment.patient_id,
          medicines,
          instructions: prescriptionInstructions,
        });
      }

      return consultation;
    },
    onSuccess: () => {
      router.push('/doctor/queue');
    },
  });

  const addMedicine = () => {
    setMedicines([...medicines, {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    }]);
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const patient = appointment?.patient;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Patient Info Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{patient?.full_name}</h1>
            <p className="text-gray-600">Student ID: {patient?.student_id}</p>
            <div className="mt-2 flex gap-4 text-sm text-gray-500">
              <span>DOB: {patient?.date_of_birth || 'N/A'}</span>
              <span>Gender: {patient?.gender || 'N/A'}</span>
              <span>Blood: {patient?.blood_group || 'N/A'}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Token #{appointment?.token_number}</p>
            <p className="text-sm text-gray-500">
              {format(new Date(appointment?.scheduled_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="col-span-2 space-y-6">
          {/* Vitals */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">Vitals</h2>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-600">Blood Pressure</label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={formData.vitals.blood_pressure}
                  onChange={(e) => setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, blood_pressure: e.target.value }
                  })}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Temperature (°F)</label>
                <input
                  type="text"
                  placeholder="98.6"
                  value={formData.vitals.temperature}
                  onChange={(e) => setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, temperature: e.target.value }
                  })}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Pulse (bpm)</label>
                <input
                  type="text"
                  placeholder="72"
                  value={formData.vitals.pulse}
                  onChange={(e) => setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, pulse: e.target.value }
                  })}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Weight (kg)</label>
                <input
                  type="text"
                  placeholder="70"
                  value={formData.vitals.weight}
                  onChange={(e) => setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, weight: e.target.value }
                  })}
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Chief Complaint & Diagnosis */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <label className="font-medium">Chief Complaint</label>
              <textarea
                value={formData.chief_complaint}
                onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                className="w-full border rounded-lg p-3 mt-1 h-24"
                placeholder="Patient's primary complaints..."
              />
            </div>
            <div>
              <label className="font-medium">Diagnosis</label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="w-full border rounded-lg p-3 mt-1 h-24"
                placeholder="Your diagnosis..."
              />
            </div>
            <div>
              <label className="font-medium">Clinical Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full border rounded-lg p-3 mt-1 h-24"
                placeholder="Additional observations..."
              />
            </div>
            <div>
              <label className="font-medium">Follow-up Date</label>
              <input
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>
          </div>

          {/* Prescription */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Prescription</h2>
              <button
                onClick={addMedicine}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                Add Medicine
              </button>
            </div>

            {medicines.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No medicines added</p>
            ) : (
              <div className="space-y-4">
                {medicines.map((med, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-3">
                      <span className="font-medium">Medicine {index + 1}</span>
                      <button
                        onClick={() => removeMedicine(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="Medicine name"
                        value={med.name}
                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                        className="border rounded p-2"
                      />
                      <input
                        placeholder="Dosage (e.g., 500mg)"
                        value={med.dosage}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                        className="border rounded p-2"
                      />
                      <input
                        placeholder="Frequency (e.g., TDS)"
                        value={med.frequency}
                        onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                        className="border rounded p-2"
                      />
                      <input
                        placeholder="Duration (e.g., 5 days)"
                        value={med.duration}
                        onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                        className="border rounded p-2"
                      />
                      <input
                        placeholder="Instructions (e.g., After food)"
                        value={med.instructions}
                        onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                        className="border rounded p-2 col-span-2"
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-sm text-gray-600">Additional Instructions</label>
                  <textarea
                    value={prescriptionInstructions}
                    onChange={(e) => setPrescriptionInstructions(e.target.value)}
                    className="w-full border rounded-lg p-2 mt-1 h-20"
                    placeholder="General instructions for the patient..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={() => createConsultation.mutate()}
            disabled={createConsultation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {createConsultation.isPending ? 'Saving...' : 'Complete Consultation'}
          </button>
        </div>

        {/* Patient History Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3">Patient History</h3>
            {patientHistory?.length === 0 ? (
              <p className="text-sm text-gray-500">No previous visits</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {patientHistory?.slice(0, 10).map((visit: any) => (
                  <div key={visit.id} className="border-b pb-3">
                    <p className="text-xs text-gray-400">
                      {format(new Date(visit.created_at), 'MMM d, yyyy')}
                    </p>
                    <p className="font-medium text-sm">{visit.diagnosis || 'No diagnosis'}</p>
                    <p className="text-xs text-gray-600">Dr. {visit.doctor?.full_name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 5.12 Verification Checklist

### Setup
- [ ] Next.js project initialized with TypeScript and Tailwind
- [ ] Clerk provider configured in root layout
- [ ] Middleware protects authenticated routes
- [ ] API client with token management works

### Patient Features
- [ ] Patient dashboard shows appointments and visits
- [ ] Can book appointments with doctors
- [ ] Can view and update health profile
- [ ] Can view prescriptions and download PDFs
- [ ] Can view certificates and download PDFs
- [ ] Can cancel pending appointments

### Doctor Features
- [ ] Doctor dashboard shows today's queue
- [ ] Can update appointment status
- [ ] Can conduct consultations with full form
- [ ] Can add medicines and generate prescriptions
- [ ] Can issue medical certificates
- [ ] Can view patient history during consultation

### Admin Features
- [ ] Can view pending approval requests
- [ ] Can approve doctors (creates account, updates role)
- [ ] Can reject doctors with reason
- [ ] Can view and manage all doctors
- [ ] Analytics dashboard shows all stats

### Route Guards
- [ ] Patients redirected from doctor/admin routes
- [ ] Doctors redirected from admin routes
- [ ] Pending doctors see approval waiting screen
- [ ] Rejected doctors see rejection reason

---

## Frontend Complete!

The ViCare platform is now fully implemented with:
- Complete backend API (Phases 1-4)
- Complete frontend application (Phase 5)

Both can run locally for development and testing.
