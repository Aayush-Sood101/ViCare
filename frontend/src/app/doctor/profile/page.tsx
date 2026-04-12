'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Stethoscope, Phone } from 'lucide-react';
import { SPECIALIZATIONS } from '@/lib/constants';
import type { Doctor } from '@/types';

export default function DoctorProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    specialization: '',
    qualification: '',
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['doctor-profile'],
    queryFn: () => doctorsApi.getMe().then((res) => res.data as Doctor),
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone ?? profile.phone_number ?? '',
        specialization: profile.specialization || '',
        qualification: profile.qualification || '',
      });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: () =>
      doctorsApi.updateMe({
        phone: formData.phone.trim() || undefined,
        specialization: formData.specialization.trim() || undefined,
        qualification: formData.qualification.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] });
      setIsEditing(false);
      toast({ title: 'Profile updated' });
    },
    onError: () => {
      toast({ title: 'Update failed', variant: 'destructive' });
    },
  });

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Edit
          </button>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-green-100 p-3">
            <Stethoscope className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-lg font-semibold">{profile?.full_name || user?.fullName}</p>
            <p className="text-sm text-gray-600">{profile?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-600">
              <Phone className="h-4 w-4" />
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
              />
            ) : (
              <p>{profile?.phone ?? profile?.phone_number ?? '—'}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">Specialization</label>
            {isEditing ? (
              <select
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">Select</option>
                {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <p>{profile?.specialization || '—'}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">Qualification</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
              />
            ) : (
              <p>{profile?.qualification || '—'}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-500">Registration number</label>
            <p className="font-mono text-sm">{profile?.registration_number || '—'}</p>
            <p className="mt-1 text-xs text-gray-400">Contact admin to change registration details.</p>
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                if (profile) {
                  setFormData({
                    phone: profile.phone ?? profile.phone_number ?? '',
                    specialization: profile.specialization || '',
                    qualification: profile.qualification || '',
                  });
                }
              }}
              className="flex-1 rounded-lg border py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={updateProfile.isPending}
              onClick={() => updateProfile.mutate()}
              className="flex-1 rounded-lg bg-green-600 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {updateProfile.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
