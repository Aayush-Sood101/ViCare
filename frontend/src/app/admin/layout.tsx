import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/layouts/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== 'admin') {
    redirect('/patient/dashboard');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-8 lg:p-8 pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
