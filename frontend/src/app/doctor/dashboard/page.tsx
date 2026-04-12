'use client';

import { useQuery } from '@tanstack/react-query';
import { doctorsApi, appointmentsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, appointmentTime, appointmentReason } from '@/lib/utils';
import Link from 'next/link';
import { Users, Clock, CheckCircle, Play, Calendar } from 'lucide-react';
import type { Appointment, DoctorStats } from '@/types';

export default function DoctorDashboard() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['doctor-profile'],
    queryFn: () => doctorsApi.getMe().then((res) => res.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['doctor-stats'],
    queryFn: () => doctorsApi.getStats().then((res) => res.data),
  });

  const today = new Date().toISOString().split('T')[0];
  const { data: todayAppointments } = useQuery({
    queryKey: ['doctor-appointments-today'],
    queryFn: () => appointmentsApi.list({ date: today }).then((res) => res.data),
  });

  const currentPatient = todayAppointments?.find(
    (apt: Appointment) => apt.status === 'in_progress'
  );

  const nextInQueue = todayAppointments?.filter(
    (apt: Appointment) => apt.status === 'confirmed' || apt.status === 'pending'
  );

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, Dr. {profile?.full_name || user?.firstName}
        </h1>
        <p className="text-gray-600">
          {profile?.specialization || 'General Medicine'} • {formatDate(new Date())}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.today?.total || 0}</p>
              <p className="text-sm text-gray-600">Total Today</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.today?.pending || 0}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Play className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.today?.in_progress || 0}</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.today?.completed || 0}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Patient */}
      {currentPatient && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <Play className="h-5 w-5" />
            Current Patient
          </h2>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl font-semibold text-gray-900">
                {currentPatient.patient?.full_name}
              </p>
              <p className="text-gray-600">
                Token #{currentPatient.token_number} • {currentPatient.patient?.student_id}
              </p>
              {appointmentReason(currentPatient) && (
                <p className="text-sm text-gray-500 mt-1">{appointmentReason(currentPatient)}</p>
              )}
            </div>
            <Link
              href={`/doctor/consultation/${currentPatient.id}`}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Continue Consultation
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/doctor/queue"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-100 rounded-full">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Patient Queue</h3>
              <p className="text-gray-600">View and manage today&apos;s appointments</p>
            </div>
          </div>
        </Link>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-100 rounded-full">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Next in Queue</h3>
              <p className="text-gray-600">
                {nextInQueue?.length || 0} patients waiting
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Preview */}
      {nextInQueue && nextInQueue.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">Upcoming Patients</h2>
            <Link
              href="/doctor/queue"
              className="text-blue-600 hover:underline text-sm"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y">
            {nextInQueue.slice(0, 5).map((apt: Appointment) => (
              <div key={apt.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-semibold">
                    #{apt.token_number}
                  </div>
                  <div>
                    <p className="font-medium">{apt.patient?.full_name}</p>
                    <p className="text-sm text-gray-600">{apt.patient?.student_id}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
