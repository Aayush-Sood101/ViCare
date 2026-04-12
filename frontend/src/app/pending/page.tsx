'use client';

import { useAuth } from '@/hooks/useAuth';
import { Clock, CheckCircle } from 'lucide-react';

export default function DoctorPendingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="h-8 w-8 text-yellow-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Pending</h1>
        <p className="text-gray-600 mb-6">
          Thank you for registering, Dr. {user?.firstName || 'Doctor'}! Your application is currently under review.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
          <h3 className="font-medium text-gray-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>An administrator will review your credentials</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>You&apos;ll receive an email once approved</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Then you can access the doctor portal</span>
            </li>
          </ul>
        </div>

        <p className="text-xs text-gray-500">
          This usually takes 1-2 business days. If you have questions, please contact the administrator.
        </p>
      </div>
    </div>
  );
}
