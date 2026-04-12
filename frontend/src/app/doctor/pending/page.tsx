'use client';

import { useAuth } from '@/hooks/useAuth';
import { Clock, CheckCircle } from 'lucide-react';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

export default function DoctorPendingPage() {
  const { user } = useAuth();

  return (
    <div className={`flex min-h-screen items-center justify-center p-4 ${vc.pageCanvas}`}>
      <div className={cn(vc.card, 'w-full max-w-md p-8 text-center shadow-lg')}>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Clock className="h-8 w-8" />
        </div>

        <h1 className="font-vicare-display mb-2 text-2xl font-semibold text-slate-900">Application pending</h1>
        <p className="mb-6 text-slate-600">
          Thank you for registering, Dr. {user?.firstName || 'Doctor'}! Your application is currently under review.
        </p>

        <div className={cn(vc.readOnlyBox, 'mb-6 text-left')}>
          <h3 className="mb-3 font-semibold text-slate-900">What happens next?</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
              <span>An administrator will review your credentials</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
              <span>You&apos;ll receive an email once approved</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
              <span>Then you can access the doctor portal</span>
            </li>
          </ul>
        </div>

        <p className="text-xs text-slate-500">
          This usually takes 1–2 business days. If you have questions, please contact the administrator.
        </p>
      </div>
    </div>
  );
}
