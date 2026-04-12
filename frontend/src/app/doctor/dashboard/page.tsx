'use client';

import { useQuery } from '@tanstack/react-query';
import { doctorsApi, appointmentsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, appointmentTime, appointmentReason } from '@/lib/utils';
import Link from 'next/link';
import { Users, Clock, CheckCircle, Play, Calendar } from 'lucide-react';
import type { Appointment } from '@/types';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

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
      <div>
        <h1 className={vc.h1}>
          Welcome, Dr. {profile?.full_name || user?.firstName}
        </h1>
        <p className={cn(vc.muted, 'mt-1 text-sm')}>
          {profile?.specialization || 'General Medicine'} • {formatDate(new Date())}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total today', value: stats?.today?.total || 0, icon: Users },
          { label: 'Pending', value: stats?.today?.pending || 0, icon: Clock, muted: true },
          { label: 'In progress', value: stats?.today?.in_progress || 0, icon: Play },
          { label: 'Completed', value: stats?.today?.completed || 0, icon: CheckCircle },
        ].map(({ label, value, icon: Icon, muted }) => (
          <div key={label} className={vc.statCard}>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  muted ? 'bg-amber-100 text-amber-800' : '',
                  !muted && 'bg-teal-700 text-white shadow-md shadow-teal-900/15 ring-2 ring-teal-600/25',
                  'flex h-11 w-11 items-center justify-center rounded-xl'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-600">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentPatient && (
        <div className={cn(vc.subtleHighlight, 'rounded-2xl p-6')}>
          <h2 className={cn(vc.h2, 'mb-4 flex items-center gap-2 text-teal-900')}>
            <Play className="h-5 w-5" />
            Current patient
          </h2>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xl font-semibold text-slate-900">{currentPatient.patient?.full_name}</p>
              <p className="text-slate-600">
                Token #{currentPatient.token_number} • {currentPatient.patient?.student_id}
              </p>
              {appointmentReason(currentPatient) && (
                <p className="mt-1 text-sm text-slate-500">{appointmentReason(currentPatient)}</p>
              )}
            </div>
            <Link href={`/doctor/consultation/${currentPatient.id}`} className={cn(vc.btnPrimary, 'shrink-0')}>
              Continue consultation
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/doctor/queue" className={vc.quickLink}>
          <div className="flex items-center gap-4">
            <div className={vc.iconTileLg}>
              <Users className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-vicare-display text-lg font-semibold text-slate-900">Patient queue</h3>
              <p className="text-slate-600">View and manage today&apos;s appointments</p>
            </div>
          </div>
        </Link>

        <div className={cn(vc.card, vc.cardPad)}>
          <div className="flex items-center gap-4">
            <div className={vc.iconTileLg}>
              <Calendar className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-vicare-display text-lg font-semibold text-slate-900">Next in queue</h3>
              <p className="text-slate-600">{nextInQueue?.length || 0} patients waiting</p>
            </div>
          </div>
        </div>
      </div>

      {nextInQueue && nextInQueue.length > 0 && (
        <div className={vc.tableWrap}>
          <div className={cn(vc.cardHeader, 'flex items-center justify-between')}>
            <h2 className={vc.h2}>Upcoming patients</h2>
            <Link href="/doctor/queue" className={cn(vc.link, 'text-sm')}>
              View all →
            </Link>
          </div>
          <div className={vc.divideCard}>
            {nextInQueue.slice(0, 5).map((apt: Appointment) => (
              <div key={apt.id} className={vc.listRow}>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-800">
                    #{apt.token_number}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{apt.patient?.full_name}</p>
                    <p className="text-sm text-slate-600">{apt.patient?.student_id}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold',
                    apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  )}
                >
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
