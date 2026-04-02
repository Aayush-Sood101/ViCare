'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { User, Phone, Heart, AlertTriangle, Pill, Shield } from 'lucide-react';
import type { Patient } from '@/types';

export default function HealthProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Patient>>({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ['patient-profile'],
    queryFn: () => patientsApi.getMe().then((res) => res.data as Patient),
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: (data: Partial<Patient>) => patientsApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-profile'] });
      setIsEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your health profile has been updated successfully.',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      phone_number: formData.phone_number,
      address: formData.address,
      medical_history: formData.medical_history,
      allergies: formData.allergies,
      current_medications: formData.current_medications,
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
        {/* Basic Info */}
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
              <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
              <p className="mt-1 font-medium">{profile?.date_of_birth || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Gender</label>
              <p className="mt-1 font-medium capitalize">{profile?.gender || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Blood Group</label>
              <p className="mt-1 font-medium">{profile?.blood_group || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            Contact Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone_number || ''}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="font-medium">{profile?.phone_number || 'Not set'}</p>
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

        {/* Medical Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            Medical Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Allergies
              </label>
              {isEditing ? (
                <textarea
                  value={formData.allergies || ''}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  rows={2}
                  placeholder="List any known allergies..."
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="font-medium">{profile?.allergies || 'None reported'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                <Pill className="h-4 w-4 text-purple-600" />
                Current Medications
              </label>
              {isEditing ? (
                <textarea
                  value={formData.current_medications || ''}
                  onChange={(e) => setFormData({ ...formData, current_medications: e.target.value })}
                  rows={2}
                  placeholder="List any medications you're currently taking..."
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="font-medium">{profile?.current_medications || 'None reported'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Medical History</label>
              {isEditing ? (
                <textarea
                  value={formData.medical_history || ''}
                  onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                  rows={3}
                  placeholder="Any significant medical history..."
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="font-medium">{profile?.medical_history || 'None reported'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-600" />
            Emergency Contact
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Name</label>
              <p className="mt-1 font-medium">{profile?.emergency_contact_name || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Phone</label>
              <p className="mt-1 font-medium">{profile?.emergency_contact_phone || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Relation</label>
              <p className="mt-1 font-medium">{profile?.emergency_contact_relation || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isEditing && (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData(profile || {});
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
