'use client';

import { useAuth } from '@/hooks/useAuth';
import { XCircle } from 'lucide-react';
import { SignOutButton } from '@clerk/nextjs';

export default function DoctorRejectedPage() {
  const { user, status } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Rejected</h1>
        <p className="text-gray-600 mb-6">
          We&apos;re sorry, Dr. {user?.firstName || 'Doctor'}, but your application was not approved.
        </p>

        {status?.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-6">
            <h3 className="font-medium text-red-800 mb-2">Reason:</h3>
            <p className="text-sm text-red-700">{status.rejectionReason}</p>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-6">
          If you believe this was a mistake or have additional documentation to provide, please contact the administrator.
        </p>

        <SignOutButton>
          <button className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition font-semibold">
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
