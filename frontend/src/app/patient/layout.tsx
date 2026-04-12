import { redirect } from 'next/navigation';
import PatientChrome from '@/components/layouts/PatientChrome';
import { getAppRole } from '@/lib/clerk-session-role';

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const role = await getAppRole();

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

  return <PatientChrome>{children}</PatientChrome>;
}
