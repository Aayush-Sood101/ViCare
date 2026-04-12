'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { User, Phone, Activity, Shield } from 'lucide-react';
import { BLOOD_GROUPS, GENDERS } from '@/lib/constants';
import type { Patient } from '@/types';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

type EditableProfile = Pick<
  Patient,
  | 'phone'
  | 'address'
  | 'date_of_birth'
  | 'gender'
  | 'blood_group'
  | 'emergency_contact_name'
  | 'emergency_contact_phone'
>;

export default function HealthProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<EditableProfile>>({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ['patient-profile'],
    queryFn: () => patientsApi.getMe().then((res) => res.data as Patient),
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone ?? profile.phone_number,
        address: profile.address,
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
        blood_group: profile.blood_group,
        emergency_contact_name: profile.emergency_contact_name,
        emergency_contact_phone: profile.emergency_contact_phone,
      });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: (data: Partial<EditableProfile>) => patientsApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-profile'] });
      queryClient.invalidateQueries({ queryKey: ['patient-profile-gate'] });
      setIsEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your health profile has been updated successfully.',
        variant: 'default',
      });
    },
    onError: (error: Error & { response?: { data?: { error?: string; errors?: string[] } } }) => {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.errors?.join(', ') ||
        'Failed to update profile';
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      phone: formData.phone?.trim() || undefined,
      address: formData.address?.trim() || undefined,
      date_of_birth: formData.date_of_birth || undefined,
      gender: formData.gender || undefined,
      blood_group: formData.blood_group || undefined,
      emergency_contact_name: formData.emergency_contact_name?.trim() || undefined,
      emergency_contact_phone: formData.emergency_contact_phone?.trim() || undefined,
    });
  };

  if (isLoading) {
    return <div className={vc.loadingBox}>Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className={vc.h1}>Health profile</h1>
        {!isEditing && (
          <button type="button" onClick={() => setIsEditing(true)} className={vc.btnPrimary}>
            Edit profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={cn(vc.card, vc.cardPad)}>
          <h2 className={cn(vc.h2, 'mb-4 flex items-center gap-2')}>
            <User className="h-5 w-5 text-teal-700" />
            Basic information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <span className={vc.label}>Full name</span>
              <p className="mt-1 font-medium text-slate-900">{profile?.full_name || user?.fullName}</p>
            </div>
            <div>
              <span className={vc.label}>Student ID</span>
              <p className="mt-1 font-medium text-slate-900">{profile?.student_id}</p>
            </div>
            <div>
              <span className={vc.label}>Email</span>
              <p className="mt-1 font-medium text-slate-900">{profile?.email}</p>
            </div>
            <div>
              <label className={vc.label}>Date of birth</label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className={cn(vc.input, 'mt-1')}
                />
              ) : (
                <p className="mt-1 font-medium text-slate-900">{profile?.date_of_birth || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className={vc.label}>Gender</label>
              {isEditing ? (
                <select
                  value={formData.gender || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: e.target.value as EditableProfile['gender'],
                    })
                  }
                  className={cn(vc.input, 'mt-1')}
                >
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-1 font-medium capitalize text-slate-900">{profile?.gender || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className={vc.label}>Blood group</label>
              {isEditing ? (
                <select
                  value={formData.blood_group || ''}
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
              ) : (
                <p className="mt-1 font-medium text-slate-900">{profile?.blood_group || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>

        <div className={cn(vc.card, vc.cardPad)}>
          <h2 className={cn(vc.h2, 'mb-4 flex items-center gap-2')}>
            <Phone className="h-5 w-5 text-teal-700" />
            Contact information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={vc.label}>Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91-XXXXXXXXXX"
                  className={cn(vc.input, 'mt-1')}
                />
              ) : (
                <p className="mt-1 font-medium text-slate-900">
                  {profile?.phone ?? profile?.phone_number ?? 'Not set'}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className={vc.label}>Address</label>
              {isEditing ? (
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className={cn(vc.textarea, 'mt-1')}
                />
              ) : (
                <p className="mt-1 font-medium text-slate-900">{profile?.address || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>

        <div className={cn(vc.card, vc.cardPad)}>
          <h2 className={cn(vc.h2, 'mb-4 flex items-center gap-2')}>
            <Shield className="h-5 w-5 text-teal-700" />
            Emergency contact
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={vc.label}>Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.emergency_contact_name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, emergency_contact_name: e.target.value })
                  }
                  className={cn(vc.input, 'mt-1')}
                />
              ) : (
                <p className="mt-1 font-medium text-slate-900">{profile?.emergency_contact_name || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className={vc.label}>Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.emergency_contact_phone || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, emergency_contact_phone: e.target.value })
                  }
                  className={cn(vc.input, 'mt-1')}
                />
              ) : (
                <p className="mt-1 font-medium text-slate-900">
                  {profile?.emergency_contact_phone || 'Not set'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={vc.calloutInfo}>
          <Activity className="mb-2 inline h-4 w-4 text-teal-800" strokeWidth={2.25} /> Clinical notes from
          consultations appear in your visit history. Profile fields above are what the clinic uses for scheduling
          and contact.
        </div>

        {isEditing && (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                if (profile) {
                  setFormData({
                    phone: profile.phone ?? profile.phone_number,
                    address: profile.address,
                    date_of_birth: profile.date_of_birth,
                    gender: profile.gender,
                    blood_group: profile.blood_group,
                    emergency_contact_name: profile.emergency_contact_name,
                    emergency_contact_phone: profile.emergency_contact_phone,
                  });
                }
              }}
              className={cn(vc.btnSecondary, 'flex-1 justify-center py-3')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className={cn(vc.btnPrimary, 'flex-1 justify-center py-3')}
            >
              {updateProfile.isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
