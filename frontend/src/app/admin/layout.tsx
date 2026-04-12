import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/layouts/AdminSidebar';
import { getAppRole } from '@/lib/clerk-session-role';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await getAppRole();

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
