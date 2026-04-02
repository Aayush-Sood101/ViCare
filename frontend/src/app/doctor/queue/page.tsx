'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi, doctorsApi } from '@/lib/api';
import { formatDate, getStatusColor } from '@/lib/utils';
import Link from 'next/link';
import { Play, Check, X, User, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Appointment, DoctorStats } from '@/types';

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Patient Queue</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Today</p>
          <p className="text-2xl font-bold">{stats?.today?.total || 0}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <p className="text-yellow-600 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-700">{stats?.today?.pending || 0}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <p className="text-blue-600 text-sm">In Progress</p>
          <p className="text-2xl font-bold text-blue-700">{stats?.today?.in_progress || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <p className="text-green-600 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-700">{stats?.today?.completed || 0}</p>
        </div>
      </div>

      {/* Queue */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Appointments</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : sortedAppointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No appointments for this date</div>
        ) : (
          <div className="divide-y">
            {sortedAppointments.map((apt: Appointment) => (
              <div
                key={apt.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  apt.status === 'in_progress' ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">{apt.patient?.full_name}</p>
                    <p className="text-sm text-gray-600">
                      Token #{apt.token_number} • {apt.patient?.student_id}
                    </p>
                    {apt.reason && <p className="text-sm text-gray-500">{apt.reason}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-16 sm:ml-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                    {apt.status.replace('_', ' ')}
                  </span>

                  {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                    <div className="flex gap-2">
                      {apt.status !== 'in_progress' && (
                        <button
                          onClick={() => updateStatus.mutate({ id: apt.id, status: 'in_progress' })}
                          disabled={updateStatus.isPending}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          title="Start Consultation"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {apt.status === 'in_progress' && (
                        <Link
                          href={`/doctor/consultation/${apt.id}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Open Consultation
                        </Link>
                      )}
                      <button
                        onClick={() => updateStatus.mutate({ id: apt.id, status: 'cancelled' })}
                        disabled={updateStatus.isPending}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
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
