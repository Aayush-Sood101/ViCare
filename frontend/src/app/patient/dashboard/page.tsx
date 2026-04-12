'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { patientsApi, appointmentsApi, consultationsApi } from '@/lib/api';
import { formatDate, appointmentTime, appointmentReason } from '@/lib/utils';
import Link from 'next/link';
import { Calendar, FileText, Activity, Clock, Award } from 'lucide-react';
import type { Appointment, Consultation } from '@/types';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

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
        new Date(appointmentTime(apt)) >= new Date() && apt.status !== 'cancelled'
    ) || [];

  const recentVisits = consultations?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className={vc.h1}>
          Welcome, {profile?.full_name || user?.firstName}
        </h1>
        <p className={cn(vc.muted, 'mt-1 text-sm')}>Student ID: {profile?.student_id}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/patient/appointments/book" className={vc.quickLink}>
          <div className={cn(vc.iconTile, 'mb-3')}>
            <Calendar className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-slate-900">Book appointment</h3>
          <p className="text-sm text-slate-600">Schedule a visit</p>
        </Link>

        <Link href="/patient/health-profile" className={vc.quickLink}>
          <div className={cn(vc.iconTile, 'mb-3')}>
            <Activity className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <h3 className="font-semibold text-slate-900">Health profile</h3>
          <p className="text-sm text-slate-600">View your records</p>
        </Link>

        <Link href="/patient/prescriptions" className={vc.quickLink}>
          <div className={cn(vc.iconTile, 'mb-3')}>
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-slate-900">Prescriptions</h3>
          <p className="text-sm text-slate-600">Download prescriptions</p>
        </Link>

        <Link href="/patient/certificates" className={vc.quickLink}>
          <div className={cn(vc.iconTile, 'mb-3')}>
            <Award className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-slate-900">Certificates</h3>
          <p className="text-sm text-slate-600">Medical certificates</p>
        </Link>
      </div>

      <div className={cn(vc.card, vc.cardPad)}>
        <h2 className={cn(vc.h2, 'mb-4')}>Upcoming appointments</h2>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-3">
            {upcomingAppointments.slice(0, 3).map((apt: Appointment) => (
              <div
                key={apt.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Dr. {apt.doctor?.full_name}</p>
                    <p className="text-sm text-slate-600">{apt.doctor?.specialization}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">{formatDate(appointmentTime(apt))}</p>
                  <p className="text-sm text-slate-600">Token: {apt.token_number}</p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold',
                    apt.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-900'
                      : apt.status === 'pending'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-100 text-slate-800'
                  )}
                >
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No upcoming appointments</p>
        )}
        <Link href="/patient/appointments" className={cn(vc.link, 'mt-4 inline-block text-sm')}>
          View all appointments →
        </Link>
      </div>

      <div className={cn(vc.card, vc.cardPad)}>
        <h2 className={cn(vc.h2, 'mb-4')}>Recent visits</h2>
        {recentVisits.length > 0 ? (
          <div className="space-y-3">
            {recentVisits.map((visit: Consultation) => (
              <div key={visit.id} className="rounded-xl border border-slate-200/80 p-4">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">{visit.diagnosis || 'Consultation'}</p>
                    <p className="text-sm text-slate-600">Dr. {visit.doctor?.full_name}</p>
                  </div>
                  <p className="shrink-0 text-sm text-slate-500">{formatDate(visit.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No recent visits</p>
        )}
      </div>
    </div>
  );
}
