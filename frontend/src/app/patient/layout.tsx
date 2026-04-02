import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import PatientSidebar from '@/components/layouts/PatientSidebar';

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role === 'pending_doctor') {
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
      <main className="flex-1 overflow-auto p-8 lg:p-8 pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
