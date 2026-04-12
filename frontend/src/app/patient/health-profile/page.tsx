'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { User, Phone, Heart, Shield } from 'lucide-react';
import { BLOOD_GROUPS, GENDERS } from '@/lib/constants';
import type { Patient } from '@/types';

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
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Health Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Basic Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Full Name</label>
              <p className="mt-1 font-medium">{profile?.full_name || user?.fullName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Student ID</label>
              <p className="mt-1 font-medium">{profile?.student_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <p className="mt-1 font-medium">{profile?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-1 font-medium">{profile?.date_of_birth || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
              {isEditing ? (
                <select
                  value={formData.gender || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: e.target.value as EditableProfile['gender'],
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-1 font-medium capitalize">{profile?.gender || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Blood Group</label>
              {isEditing ? (
                <select
                  value={formData.blood_group || ''}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-1 font-medium">{profile?.blood_group || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            Contact Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91-XXXXXXXXXX"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="font-medium">{profile?.phone ?? profile?.phone_number ?? 'Not set'}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
              {isEditing ? (
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="font-medium">{profile?.address || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-600" />
            Emergency Contact
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.emergency_contact_name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, emergency_contact_name: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="font-medium">{profile?.emergency_contact_name || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.emergency_contact_phone || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, emergency_contact_phone: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="font-medium">{profile?.emergency_contact_phone || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-900">
          <Heart className="mb-2 inline h-4 w-4" /> Clinical notes from consultations appear in your
          visit history. Profile fields above are what the clinic uses for scheduling and contact.
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
              className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
