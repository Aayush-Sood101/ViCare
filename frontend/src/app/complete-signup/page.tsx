'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { authApi, setAuthToken } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { BLOOD_GROUPS, GENDERS, SPECIALIZATIONS } from '@/lib/constants';
import { Activity, Stethoscope } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

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
      <div className={`flex min-h-screen items-center justify-center ${vc.pageCanvas} text-slate-600`}>
        {!userLoaded ? 'Loading…' : 'Redirecting…'}
      </div>
    );
  }

  if (!userType) {
    return (
      <div className={`flex min-h-screen items-center justify-center p-4 ${vc.pageCanvas}`}>
        <div className="w-full max-w-2xl">
          <h1 className="font-vicare-display mb-2 text-center text-3xl font-semibold text-slate-900">
            Complete your registration
          </h1>
          <p className="mb-8 text-center text-slate-600">Choose how you want to use ViCare</p>

          <div className="grid gap-6 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setUserType('patient')}
              className={cn(
                vc.quickLink,
                'text-left transition hover:border-[#0060ac]/50'
              )}
            >
              <div className={cn(vc.iconTileLg, 'mb-4')}>
                <Activity className="h-6 w-6" strokeWidth={2.25} />
              </div>
              <h2 className="font-vicare-display text-xl font-semibold text-slate-900">I&apos;m a student</h2>
              <p className="mt-2 text-slate-600">
                Register as a patient to book appointments, view prescriptions, and manage your health records.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setUserType('doctor')}
              className={cn(
                vc.quickLink,
                'text-left transition hover:border-[#0060ac]/50'
              )}
            >
              <div className={cn(vc.iconTileLg, 'mb-4')}>
                <Stethoscope className="h-6 w-6" />
              </div>
              <h2 className="font-vicare-display text-xl font-semibold text-slate-900">I&apos;m a doctor</h2>
              <p className="mt-2 text-slate-600">
                Register as a doctor to manage consultations, issue prescriptions, and serve patients.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 ${vc.pageCanvas} px-4`}>
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => setUserType(null)}
          className={cn(vc.link, 'mb-4 inline-flex text-sm')}
        >
          ← Back
        </button>

        <div className={cn(vc.card, vc.cardPad)}>
          <h1 className="font-vicare-display mb-6 text-2xl font-semibold text-slate-900">
            {userType === 'patient' ? 'Student registration' : 'Doctor registration'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={vc.label}>Full name</label>
              <p className={cn(vc.readOnlyBox, 'mt-1')}>
                {user?.fullName || formData.full_name || '—'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Taken from your account. Change it in your profile settings if needed.
              </p>
            </div>

            <div>
              <label className={vc.label}>Phone number</label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+91-XXXXXXXXXX"
                className={cn(vc.input, 'mt-1')}
              />
            </div>

            {userType === 'patient' ? (
              <>
                <div>
                  <label className={vc.label}>Student ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    className={cn(vc.input, 'mt-1')}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={vc.label}>Date of birth</label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className={cn(vc.input, 'mt-1')}
                    />
                  </div>
                  <div>
                    <label className={vc.label}>Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className={cn(vc.input, 'mt-1')}
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
                  <label className={vc.label}>Blood group</label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className={cn(vc.input, 'mt-1')}
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
                  <label className={vc.label}>Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className={cn(vc.textarea, 'mt-1')}
                  />
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h3 className="font-vicare-display mb-4 font-semibold text-slate-900">Emergency contact</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className={vc.label}>Name</label>
                      <input
                        type="text"
                        value={formData.emergency_contact_name}
                        onChange={(e) =>
                          setFormData({ ...formData, emergency_contact_name: e.target.value })
                        }
                        className={cn(vc.input, 'mt-1')}
                      />
                    </div>
                    <div>
                      <label className={vc.label}>Phone</label>
                      <input
                        type="tel"
                        value={formData.emergency_contact_phone}
                        onChange={(e) =>
                          setFormData({ ...formData, emergency_contact_phone: e.target.value })
                        }
                        className={cn(vc.input, 'mt-1')}
                      />
                    </div>
                    <div>
                      <label className={vc.label}>Relation</label>
                      <input
                        type="text"
                        value={formData.emergency_contact_relation}
                        onChange={(e) =>
                          setFormData({ ...formData, emergency_contact_relation: e.target.value })
                        }
                        placeholder="e.g., Parent, Sibling"
                        className={cn(vc.input, 'mt-1')}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={vc.label}>Specialization</label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className={cn(vc.input, 'mt-1')}
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
                  <label className={vc.label}>Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g., MBBS, MD"
                    className={cn(vc.input, 'mt-1')}
                  />
                </div>

                <div>
                  <label className={vc.label}>Registration number</label>
                  <input
                    type="text"
                    value={formData.registration_number}
                    onChange={(e) =>
                      setFormData({ ...formData, registration_number: e.target.value })
                    }
                    placeholder="Medical license/registration number"
                    className={cn(vc.input, 'mt-1')}
                  />
                </div>

                <div className={vc.calloutWarn}>
                  <p className="text-sm">
                    <strong>Note:</strong> Your application will be reviewed by an administrator before you can
                    access the doctor portal.
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={completeSignup.isPending}
              className={cn(vc.btnPrimary, vc.btnPrimaryBlock)}
            >
              {completeSignup.isPending
                ? 'Submitting...'
                : userType === 'patient'
                  ? 'Complete registration'
                  : 'Submit application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
