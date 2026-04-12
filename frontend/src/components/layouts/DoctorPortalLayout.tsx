'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import DoctorSidebar from '@/components/layouts/DoctorSidebar';
import { vc } from '@/lib/vicare-ui';

const BARE_PATHS = ['/doctor/pending', '/doctor/rejected'];

export default function DoctorPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;

  const isBarePage = BARE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (!isLoaded) return;

    if (role === 'pending_doctor' && !pathname.startsWith('/doctor/pending')) {
      router.replace('/doctor/pending');
      return;
    }
    if (role === 'rejected_doctor' && !pathname.startsWith('/doctor/rejected')) {
      router.replace('/doctor/rejected');
      return;
    }
    if (
      role === 'doctor' &&
      (pathname.startsWith('/doctor/pending') || pathname.startsWith('/doctor/rejected'))
    ) {
      router.replace('/doctor/dashboard');
      return;
    }
    if (
      role &&
      role !== 'doctor' &&
      role !== 'pending_doctor' &&
      role !== 'rejected_doctor' &&
      !isBarePage
    ) {
      router.replace('/patient/dashboard');
    }
  }, [isLoaded, role, pathname, router, isBarePage]);

  if (!isLoaded) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${vc.pageCanvas} text-slate-600`}>
        Loading…
      </div>
    );
  }

  if (isBarePage) {
    return <>{children}</>;
  }

  if (role !== 'doctor') {
    return (
      <div className={`flex min-h-screen items-center justify-center ${vc.pageCanvas} text-slate-600`}>
        Redirecting…
      </div>
    );
  }

  return (
    <div className={vc.shell}>
      <DoctorSidebar />
      <main className={vc.main}>{children}</main>
    </div>
  );
}
