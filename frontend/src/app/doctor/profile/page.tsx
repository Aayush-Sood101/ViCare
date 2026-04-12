'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Stethoscope, Phone } from 'lucide-react';
import { SPECIALIZATIONS } from '@/lib/constants';
import type { Doctor } from '@/types';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

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
    return <div className={vc.loadingBox}>Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className={vc.h1}>My profile</h1>
        {!isEditing && (
          <button type="button" onClick={() => setIsEditing(true)} className={vc.btnPrimary}>
            Edit
          </button>
        )}
      </div>

      <div className={cn(vc.card, vc.cardPad)}>
        <div className="mb-6 flex items-center gap-3">
          <div className={vc.iconTileLg}>
            <Stethoscope className="h-7 w-7" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{profile?.full_name || user?.fullName}</p>
            <p className="text-sm text-slate-600">{profile?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={cn(vc.label, 'flex items-center gap-2')}>
              <Phone className="h-4 w-4" />
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={cn(vc.input, 'mt-1')}
              />
            ) : (
              <p className="mt-1 text-slate-900">{profile?.phone ?? profile?.phone_number ?? '—'}</p>
            )}
          </div>

          <div>
            <label className={vc.label}>Specialization</label>
            {isEditing ? (
              <select
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className={cn(vc.input, 'mt-1')}
              >
                <option value="">Select</option>
                {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-1 text-slate-900">{profile?.specialization || '—'}</p>
            )}
          </div>

          <div>
            <label className={vc.label}>Qualification</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className={cn(vc.input, 'mt-1')}
              />
            ) : (
              <p className="mt-1 text-slate-900">{profile?.qualification || '—'}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-slate-500">Registration number</label>
            <p className="font-mono text-sm text-slate-900">{profile?.registration_number || '—'}</p>
            <p className="mt-1 text-xs text-slate-400">Contact admin to change registration details.</p>
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
              className={cn(vc.btnSecondary, 'flex-1 justify-center py-2.5')}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={updateProfile.isPending}
              onClick={() => updateProfile.mutate()}
              className={cn(vc.btnPrimary, 'flex-1 justify-center py-2.5')}
            >
              {updateProfile.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
