'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api';
import { formatDate, getStatusColor } from '@/lib/utils';
import Link from 'next/link';
import { Plus, X, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Appointment } from '@/types';

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
        new Date(apt.appointment_date) >= new Date() && apt.status !== 'cancelled'
    ) || [];

  const pastAppointments =
    appointments?.filter(
      (apt: Appointment) =>
        new Date(apt.appointment_date) < new Date() || apt.status === 'cancelled'
    ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Appointments</h1>
        <Link
          href="/patient/appointments/book"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          Book Appointment
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize transition ${
              filter === status ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <>
          {/* Upcoming */}
          {upcomingAppointments.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Upcoming Appointments</h2>
              </div>
              <div className="divide-y">
                {upcomingAppointments.map((apt: Appointment) => (
                  <div key={apt.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Dr. {apt.doctor?.full_name}</p>
                        <p className="text-sm text-gray-600">
                          {apt.doctor?.specialization} • Token #{apt.token_number}
                        </p>
                        {apt.reason && (
                          <p className="text-sm text-gray-500 mt-1">{apt.reason}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">{formatDate(apt.appointment_date)}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                      {apt.status === 'pending' && (
                        <button
                          onClick={() => cancelAppointment.mutate(apt.id)}
                          disabled={cancelAppointment.isPending}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Cancel Appointment"
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

          {/* Past */}
          {pastAppointments.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-600">Past Appointments</h2>
              </div>
              <div className="divide-y">
                {pastAppointments.map((apt: Appointment) => (
                  <div key={apt.id} className="p-4 flex items-center justify-between opacity-75">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">Dr. {apt.doctor?.full_name}</p>
                        <p className="text-sm text-gray-600">{apt.doctor?.specialization}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatDate(apt.appointment_date)}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {appointments?.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500 mb-4">Book your first appointment to get started</p>
              <Link
                href="/appointments/book"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
                Book Appointment
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
