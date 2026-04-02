'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { patientsApi, appointmentsApi, consultationsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Calendar, FileText, Stethoscope, Clock, Award } from 'lucide-react';
import type { Appointment, Consultation } from '@/types';

export default function PatientDashboard() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['patient-profile'],
    queryFn: () => patientsApi.getMe().then((res) => res.data),
  });

  const { data: appointments } = useQuery({
    queryKey: ['patient-appointments'],
    queryFn: () => appointmentsApi.list().then((res) => res.data),
  });

  const { data: consultations } = useQuery({
    queryKey: ['patient-consultations'],
    queryFn: () => consultationsApi.getMe().then((res) => res.data),
  });

  const upcomingAppointments =
    appointments?.filter(
      (apt: Appointment) =>
        new Date(apt.appointment_date) >= new Date() && apt.status !== 'cancelled'
    ) || [];

  const recentVisits = consultations?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {profile?.full_name || user?.firstName}
        </h1>
        <p className="text-gray-600">Student ID: {profile?.student_id}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/patient/appointments/book"
          className="p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
        >
          <Calendar className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-semibold">Book Appointment</h3>
          <p className="text-sm text-gray-600">Schedule a visit</p>
        </Link>

        <Link
          href="/patient/health-profile"
          className="p-6 bg-green-50 rounded-lg hover:bg-green-100 transition"
        >
          <Stethoscope className="h-8 w-8 text-green-600 mb-2" />
          <h3 className="font-semibold">Health Profile</h3>
          <p className="text-sm text-gray-600">View your records</p>
        </Link>

        <Link
          href="/patient/prescriptions"
          className="p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
        >
          <FileText className="h-8 w-8 text-purple-600 mb-2" />
          <h3 className="font-semibold">Prescriptions</h3>
          <p className="text-sm text-gray-600">Download prescriptions</p>
        </Link>

        <Link
          href="/patient/certificates"
          className="p-6 bg-orange-50 rounded-lg hover:bg-orange-100 transition"
        >
          <Award className="h-8 w-8 text-orange-600 mb-2" />
          <h3 className="font-semibold">Certificates</h3>
          <p className="text-sm text-gray-600">Medical certificates</p>
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-3">
            {upcomingAppointments.slice(0, 3).map((apt: Appointment) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Dr. {apt.doctor?.full_name}</p>
                    <p className="text-sm text-gray-600">{apt.doctor?.specialization}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatDate(apt.appointment_date)}</p>
                  <p className="text-sm text-gray-600">Token: {apt.token_number}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    apt.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : apt.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming appointments</p>
        )}
        <Link
          href="/patient/appointments"
          className="text-blue-600 hover:underline text-sm mt-4 inline-block"
        >
          View all appointments →
        </Link>
      </div>

      {/* Recent Visits */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Visits</h2>
        {recentVisits.length > 0 ? (
          <div className="space-y-3">
            {recentVisits.map((visit: Consultation) => (
              <div key={visit.id} className="p-4 border rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{visit.diagnosis || 'Consultation'}</p>
                    <p className="text-sm text-gray-600">Dr. {visit.doctor?.full_name}</p>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(visit.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recent visits</p>
        )}
      </div>
    </div>
  );
}
