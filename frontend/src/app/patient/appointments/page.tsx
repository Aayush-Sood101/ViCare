'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api';
import { formatDate, getStatusColor, appointmentTime, appointmentReason } from '@/lib/utils';
import Link from 'next/link';
import { Plus, X, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Appointment } from '@/types';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('all');

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', filter],
    queryFn: () =>
      appointmentsApi.list(filter !== 'all' ? { status: filter } : undefined).then((res) => res.data),
  });

  const cancelAppointment = useMutation({
    mutationFn: (id: string) => appointmentsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Appointment Cancelled',
        description: 'Your appointment has been cancelled successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to cancel appointment',
        variant: 'destructive',
      });
    },
  });

  const upcomingAppointments =
    appointments?.filter(
      (apt: Appointment) =>
        new Date(appointmentTime(apt)) >= new Date() && apt.status !== 'cancelled'
    ) || [];

  const pastAppointments =
    appointments?.filter(
      (apt: Appointment) =>
        new Date(appointmentTime(apt)) < new Date() || apt.status === 'cancelled'
    ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className={vc.h1}>My appointments</h1>
        <Link href="/patient/appointments/book" className={cn(vc.btnPrimary, 'shrink-0')}>
          <Plus className="h-4 w-4" />
          Book appointment
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={cn(filter === status ? vc.filterActive : vc.filterIdle, 'capitalize')}
          >
            {status}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className={vc.loadingBox}>Loading...</div>
      ) : (
        <>
          {upcomingAppointments.length > 0 && (
            <div className={vc.tableWrap}>
              <div className={vc.cardHeader}>
                <h2 className={vc.h2}>Upcoming appointments</h2>
              </div>
              <div className={vc.divideCard}>
                {upcomingAppointments.map((apt: Appointment) => (
                  <div key={apt.id} className={cn(vc.listRow, 'flex-wrap')}>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Dr. {apt.doctor?.full_name}</p>
                        <p className="text-sm text-slate-600">
                          {apt.doctor?.specialization} • Token #{apt.token_number}
                        </p>
                        {appointmentReason(apt) && (
                          <p className="mt-1 text-sm text-slate-500">{appointmentReason(apt)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-slate-900">{formatDate(appointmentTime(apt))}</p>
                        <span
                          className={cn(
                            'mt-1 inline-block rounded-full px-2 py-1 text-xs font-semibold',
                            getStatusColor(apt.status)
                          )}
                        >
                          {apt.status}
                        </span>
                      </div>
                      {(apt.status === 'pending' || apt.status === 'confirmed') && (
                        <button
                          type="button"
                          onClick={() => cancelAppointment.mutate(apt.id)}
                          disabled={cancelAppointment.isPending}
                          className={vc.btnDangerSoft}
                          title="Cancel appointment"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastAppointments.length > 0 && (
            <div className={vc.tableWrap}>
              <div className={vc.cardHeader}>
                <h2 className={cn(vc.h2, 'text-slate-600')}>Past appointments</h2>
              </div>
              <div className={vc.divideCard}>
                {pastAppointments.map((apt: Appointment) => (
                  <div key={apt.id} className={cn(vc.listRow, 'opacity-80')}>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Dr. {apt.doctor?.full_name}</p>
                        <p className="text-sm text-slate-600">{apt.doctor?.specialization}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">{formatDate(appointmentTime(apt))}</p>
                      <span
                        className={cn(
                          'mt-1 inline-block rounded-full px-2 py-1 text-xs font-semibold',
                          getStatusColor(apt.status)
                        )}
                      >
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {appointments?.length === 0 && (
            <div className={vc.emptyCard}>
              <Calendar className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <h3 className="font-vicare-display text-lg font-semibold text-slate-900">No appointments found</h3>
              <p className="mb-4 text-slate-500">Book your first appointment to get started</p>
              <Link href="/patient/appointments/book" className={vc.btnPrimary}>
                <Plus className="h-4 w-4" />
                Book appointment
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
