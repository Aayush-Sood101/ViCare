'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authApi, setAuthToken } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { BLOOD_GROUPS, GENDERS, SPECIALIZATIONS } from '@/lib/constants';
import { Heart, Stethoscope } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const initialForm = {
  full_name: '',
  student_id: '',
  date_of_birth: '',
  gender: '',
  blood_group: '',
  phone_number: '',
  address: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relation: '',
  specialization: '',
  qualification: '',
  registration_number: '',
};

export default function CompleteSignupPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [userType, setUserType] = useState<'patient' | 'doctor' | null>(null);
  const [formData, setFormData] = useState(initialForm);

  const completeSignup = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      setAuthToken(token);

      // Backend expects camelCase; display name comes from Clerk first/last name
      const data =
        userType === 'patient'
          ? {
              userType: 'patient' as const,
              studentId: formData.student_id.trim(),
              phone: formData.phone_number.trim() || undefined,
            }
          : {
              userType: 'doctor' as const,
              specialization: formData.specialization.trim(),
              qualification: formData.qualification.trim(),
              registrationNumber: formData.registration_number.trim(),
              phone: formData.phone_number.trim() || undefined,
            };

      return authApi.completeSignup(data);
    },
    onSuccess: () => {
      toast({
        title: userType === 'patient' ? 'Registration Complete!' : 'Application Submitted!',
        description:
          userType === 'patient'
            ? 'You can now access your dashboard.'
            : 'Your application is pending admin approval.',
        variant: 'success',
      });
      router.push(userType === 'patient' ? '/patient/dashboard' : '/doctor/pending');
      router.refresh();
    },
    onError: (error: Error & { response?: { data?: { error?: string; errors?: string[] } } }) => {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.errors?.join(', ') ||
        'Something went wrong';
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    },
  });

  // Admins and doctors already have a role — do not force student/doctor registration here.
  useEffect(() => {
    if (!userLoaded || !user) return;
    const role = user.publicMetadata?.role as string | undefined;
    if (role === 'admin') router.replace('/admin/dashboard');
    else if (role === 'doctor') router.replace('/doctor/dashboard');
    else if (role === 'pending_doctor') router.replace('/doctor/pending');
    else if (role === 'rejected_doctor') router.replace('/doctor/rejected');
  }, [userLoaded, user, router]);

  useEffect(() => {
    if (user?.fullName) {
      setFormData((prev) => ({ ...prev, full_name: user.fullName || '' }));
    }
  }, [user?.fullName]);

  const existingRole = user?.publicMetadata?.role as string | undefined;
  const alreadyRegistered =
    userLoaded &&
    ['admin', 'doctor', 'pending_doctor', 'rejected_doctor'].includes(existingRole ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeSignup.mutate();
  };

  if (!userLoaded || alreadyRegistered) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">
        {!userLoaded ? 'Loading…' : 'Redirecting…'}
      </div>
    );
  }

  if (!userType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-center mb-2">Complete Your Registration</h1>
          <p className="text-gray-600 text-center mb-8">Choose how you want to use ViCare</p>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => setUserType('patient')}
              className="bg-white p-8 rounded-xl shadow-sm border-2 border-transparent hover:border-blue-500 transition text-left"
            >
              <Heart className="h-12 w-12 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">I&apos;m a Student</h2>
              <p className="text-gray-600">
                Register as a patient to book appointments, view prescriptions, and manage your health records.
              </p>
            </button>

            <button
              onClick={() => setUserType('doctor')}
              className="bg-white p-8 rounded-xl shadow-sm border-2 border-transparent hover:border-green-500 transition text-left"
            >
              <Stethoscope className="h-12 w-12 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">I&apos;m a Doctor</h2>
              <p className="text-gray-600">
                Register as a doctor to manage consultations, issue prescriptions, and serve patients.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setUserType(null)}
          className="text-gray-600 hover:text-gray-900 mb-4"
        >
          ← Back
        </button>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-6">
            {userType === 'patient' ? 'Student Registration' : 'Doctor Registration'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <p className="rounded-lg border bg-gray-50 px-3 py-2 text-gray-900">
                {user?.fullName || formData.full_name || '—'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Taken from your account. Change it in your profile settings if needed.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+91-XXXXXXXXXX"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {userType === 'patient' ? (
              <>
                {/* Patient-specific fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select gender</option>
                      {GENDERS.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">Emergency Contact</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.emergency_contact_name}
                        onChange={(e) =>
                          setFormData({ ...formData, emergency_contact_name: e.target.value })
                        }
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.emergency_contact_phone}
                        onChange={(e) =>
                          setFormData({ ...formData, emergency_contact_phone: e.target.value })
                        }
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relation
                      </label>
                      <input
                        type="text"
                        value={formData.emergency_contact_relation}
                        onChange={(e) =>
                          setFormData({ ...formData, emergency_contact_relation: e.target.value })
                        }
                        placeholder="e.g., Parent, Sibling"
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Doctor-specific fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g., MBBS, MD"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.registration_number}
                    onChange={(e) =>
                      setFormData({ ...formData, registration_number: e.target.value })
                    }
                    placeholder="Medical license/registration number"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Your application will be reviewed by an administrator
                    before you can access the doctor portal.
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={completeSignup.isPending}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {completeSignup.isPending
                ? 'Submitting...'
                : userType === 'patient'
                ? 'Complete Registration'
                : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
