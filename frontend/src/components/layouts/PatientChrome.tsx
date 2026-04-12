'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import PatientSidebar from '@/components/layouts/PatientSidebar';
import { patientsApi } from '@/lib/api';

export default function PatientChrome({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;

  const skipPatientProfileGate =
    role === 'admin' || role === 'doctor' || role === 'pending_doctor' || role === 'rejected_doctor';

  useEffect(() => {
    if (!userLoaded) return;
    if (role === 'admin') router.replace('/admin/dashboard');
    else if (role === 'doctor') router.replace('/doctor/dashboard');
    else if (role === 'pending_doctor') router.replace('/doctor/pending');
    else if (role === 'rejected_doctor') router.replace('/doctor/rejected');
  }, [userLoaded, role, router]);

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ['patient-profile-gate'],
    queryFn: async () => {
      try {
        const { data: profile } = await patientsApi.getMe();
        return profile;
      } catch (e: unknown) {
        const status = (e as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          router.replace('/complete-signup');
          return null;
        }
        throw e;
      }
    },
    enabled: userLoaded && !skipPatientProfileGate,
    retry: false,
    staleTime: 60_000,
  });

  if (!userLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-600">
        Loading…
      </div>
    );
  }

  if (skipPatientProfileGate) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-600">
        Redirecting…
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-600">
        Loading your profile…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center text-red-600">
        <p>Could not load your profile. Check that the API is running and you are signed in.</p>
        {(error as Error)?.message && (
          <p className="mt-2 text-sm text-gray-600">{(error as Error).message}</p>
        )}
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-600">
        Redirecting to registration…
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <PatientSidebar />
      <main className="flex-1 overflow-auto p-8 lg:p-8 pt-20 lg:pt-8">{children}</main>
    </div>
  );
}
