import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/layouts/AdminSidebar';
import { getAppRole } from '@/lib/clerk-session-role';
import { vc } from '@/lib/vicare-ui';

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
    <div className={vc.shell}>
      <AdminSidebar />
      <main className={vc.main}>{children}</main>
    </div>
  );
}
