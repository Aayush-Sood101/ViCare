'use client';

import { useAuth } from '@/hooks/useAuth';
import { XCircle } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

export default function DoctorRejectedPage() {
  const { user, status } = useAuth();

  return (
    <div className={`flex min-h-screen items-center justify-center p-4 ${vc.pageCanvas}`}>
      <div className={cn(vc.card, 'w-full max-w-md p-8 text-center shadow-lg')}>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <XCircle className="h-8 w-8" />
        </div>

        <h1 className="font-vicare-display mb-2 text-2xl font-semibold text-slate-900">Application rejected</h1>
        <p className="mb-6 text-slate-600">
          We&apos;re sorry, Dr. {user?.firstName || 'Doctor'}, but your application was not approved.
        </p>

        {status?.rejectionReason && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-left">
            <h3 className="mb-2 font-semibold text-red-900">Reason</h3>
            <p className="text-sm text-red-800">{status.rejectionReason}</p>
          </div>
        )}

        <p className="mb-6 text-sm text-slate-600">
          If you believe this was a mistake or have additional documentation to provide, please contact the
          administrator.
        </p>

        <SignOutButton>
          <button type="button" className={cn(vc.btnPrimary, vc.btnPrimaryBlock, 'bg-slate-900 ring-slate-700 hover:bg-slate-800')}>
            Sign out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
