'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Search, ToggleLeft, ToggleRight, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Doctor } from '@/types';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

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
      <h1 className={vc.h1}>Manage doctors</h1>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(vc.input, 'pl-10')}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter(undefined)}
            className={activeFilter === undefined ? vc.filterActive : vc.filterIdle}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter(true)}
            className={activeFilter === true ? vc.filterActive : vc.filterIdle}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter(false)}
            className={activeFilter === false ? vc.filterActive : vc.filterIdle}
          >
            Inactive
          </button>
        </div>
      </div>

      <div className={vc.tableWrap}>
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : doctorsList.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No doctors found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={vc.tableHead}>
                <tr>
                  <th className={vc.th}>Doctor</th>
                  <th className={vc.th}>Specialization</th>
                  <th className={vc.th}>Contact</th>
                  <th className={vc.th}>Joined</th>
                  <th className={vc.th}>Status</th>
                  <th className={cn(vc.th, 'text-right')}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctorsList.map((doctor: Doctor) => (
                  <tr key={doctor.id} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#001e40]/10 text-[#004883]">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{doctor.full_name}</p>
                          <p className="text-sm text-slate-500">{doctor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-slate-900">{doctor.specialization || 'General Medicine'}</p>
                      <p className="text-sm text-slate-500">{doctor.qualification}</p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-sm text-slate-800">{(doctor.phone ?? doctor.phone_number) || 'N/A'}</p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {formatDate(doctor.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={cn(
                          'rounded-full px-2 py-1 text-xs font-semibold',
                          doctor.is_active ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-800'
                        )}
                      >
                        {doctor.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          updateDoctor.mutate({ id: doctor.id, is_active: !doctor.is_active })
                        }
                        disabled={updateDoctor.isPending}
                        className="rounded-xl p-2 transition hover:bg-slate-100"
                        title={doctor.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {doctor.is_active ? (
                          <ToggleRight className="h-6 w-6 text-[#001e40]" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-slate-400" />
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
