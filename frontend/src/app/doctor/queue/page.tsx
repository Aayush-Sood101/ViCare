'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi, doctorsApi } from '@/lib/api';
import { getStatusColor, appointmentReason } from '@/lib/utils';
import Link from 'next/link';
import { Play, X, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Appointment } from '@/types';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

export default function DoctorQueue() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: stats } = useQuery({
    queryKey: ['doctor-stats'],
    queryFn: () => doctorsApi.getStats().then((res) => res.data),
  });

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['doctor-queue', selectedDate],
    queryFn: () => appointmentsApi.list({ date: selectedDate }).then((res) => res.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      appointmentsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-queue'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-stats'] });
      toast({
        title: 'Status Updated',
        description: 'Appointment status has been updated.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    },
  });

  const statusOrder = ['in_progress', 'confirmed', 'pending', 'completed', 'cancelled'];
  const sortedAppointments =
    appointments?.sort((a: Appointment, b: Appointment) => {
      return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
    }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className={vc.h1}>Patient queue</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={cn(vc.input, 'w-full sm:w-auto sm:min-w-[12rem]')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className={vc.statCard}>
          <p className="text-sm text-slate-600">Total today</p>
          <p className="text-2xl font-bold text-slate-900">{stats?.today?.total || 0}</p>
        </div>
        <div className={cn(vc.statCard, 'bg-amber-50/50 ring-1 ring-amber-100')}>
          <p className="text-sm text-amber-800">Pending</p>
          <p className="text-2xl font-bold text-amber-900">{stats?.today?.pending || 0}</p>
        </div>
        <div className={cn(vc.statCard, vc.subtleHighlight)}>
          <p className="text-sm text-[#001e40]">In progress</p>
          <p className="text-2xl font-bold text-[#001e40]">{stats?.today?.in_progress || 0}</p>
        </div>
        <div className={cn(vc.statCard, 'bg-emerald-50/50 ring-1 ring-emerald-100')}>
          <p className="text-sm text-emerald-800">Completed</p>
          <p className="text-2xl font-bold text-emerald-900">{stats?.today?.completed || 0}</p>
        </div>
      </div>

      <div className={vc.tableWrap}>
        <div className={vc.cardHeader}>
          <h2 className={vc.h2}>Appointments</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : sortedAppointments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No appointments for this date</div>
        ) : (
          <div className={vc.divideCard}>
            {sortedAppointments.map((apt: Appointment) => (
              <div
                key={apt.id}
                className={cn(
                  vc.listRow,
                  'flex-col sm:flex-row',
                  apt.status === 'in_progress' && vc.subtleHighlight
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={vc.iconAvatar}>
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{apt.patient?.full_name}</p>
                    <p className="text-sm text-slate-600">
                      Token #{apt.token_number} • {apt.patient?.student_id}
                    </p>
                    {appointmentReason(apt) && (
                      <p className="text-sm text-slate-500">{appointmentReason(apt)}</p>
                    )}
                  </div>
                </div>

                <div className="ml-14 flex flex-wrap items-center gap-3 sm:ml-0">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-semibold',
                      getStatusColor(apt.status)
                    )}
                  >
                    {apt.status.replace('_', ' ')}
                  </span>

                  {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                    <div className="flex gap-2">
                      {apt.status !== 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => updateStatus.mutate({ id: apt.id, status: 'in_progress' })}
                          disabled={updateStatus.isPending}
                          className={vc.btnIconNavy}
                          title="Start consultation"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      {apt.status === 'in_progress' && (
                        <Link href={`/doctor/consultation/${apt.id}`} className={vc.btnSuccess}>
                          Open consultation
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => updateStatus.mutate({ id: apt.id, status: 'cancelled' })}
                        disabled={updateStatus.isPending}
                        className={vc.btnDangerSoft}
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
