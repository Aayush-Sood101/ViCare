'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Search, ToggleLeft, ToggleRight, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Doctor } from '@/types';

export default function AdminDoctorsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['admin-doctors', search, activeFilter],
    queryFn: () =>
      adminApi
        .getDoctors({
          search: search || undefined,
          is_active: activeFilter,
        })
        .then((res) => res.data),
  });

  const updateDoctor = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      adminApi.updateDoctor(id, { is_active }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      toast({
        title: variables.is_active ? 'Doctor Activated' : 'Doctor Deactivated',
        description: `The doctor has been ${variables.is_active ? 'activated' : 'deactivated'}.`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update doctor status',
        variant: 'destructive',
      });
    },
  });

  const doctorsList = doctors?.data || doctors || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Doctors</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter(undefined)}
            className={`px-4 py-2 rounded-lg transition ${
              activeFilter === undefined ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter(true)}
            className={`px-4 py-2 rounded-lg transition ${
              activeFilter === true ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveFilter(false)}
            className={`px-4 py-2 rounded-lg transition ${
              activeFilter === false ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Doctors List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : doctorsList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No doctors found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {doctorsList.map((doctor: Doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{doctor.full_name}</p>
                          <p className="text-sm text-gray-500">{doctor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p>{doctor.specialization || 'General Medicine'}</p>
                      <p className="text-sm text-gray-500">{doctor.qualification}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm">{(doctor.phone ?? doctor.phone_number) || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(doctor.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          doctor.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {doctor.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() =>
                          updateDoctor.mutate({ id: doctor.id, is_active: !doctor.is_active })
                        }
                        disabled={updateDoctor.isPending}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title={doctor.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {doctor.is_active ? (
                          <ToggleRight className="h-6 w-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-gray-400" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
