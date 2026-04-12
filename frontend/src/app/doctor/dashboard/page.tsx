'use client';

import { useQuery } from '@tanstack/react-query';
import { doctorsApi, appointmentsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, appointmentTime, appointmentReason } from '@/lib/utils';
import Link from 'next/link';
import { Users, Clock, CheckCircle, Play, Calendar, ChevronRight, Stethoscope, TrendingUp } from 'lucide-react';
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

  const statCards = [
    { label: 'Total today', value: stats?.today?.total || 0, icon: Users, bg: 'bg-[#001e40]', shadow: 'shadow-[#001e40]/20' },
    { label: 'Pending', value: stats?.today?.pending || 0, icon: Clock, bg: 'bg-amber-500', shadow: 'shadow-amber-400/30', muted: true },
    { label: 'In progress', value: stats?.today?.in_progress || 0, icon: Play, bg: 'bg-[#0060ac]', shadow: 'shadow-[#0060ac]/20' },
    { label: 'Completed', value: stats?.today?.completed || 0, icon: CheckCircle, bg: 'bg-emerald-600', shadow: 'shadow-emerald-600/20' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0060ac] mb-1">Doctor Portal</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#001e40]">
            Welcome, Dr. {profile?.full_name?.split(' ')[0] || user?.firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-[#43474f]">
            <span className="font-semibold text-[#001e40]">{profile?.specialization || 'General Medicine'}</span>
            <span className="mx-2 text-slate-300">•</span>
            {formatDate(new Date())}
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 rounded-full bg-[#001e40]/5 border border-[#001e40]/10 px-4 py-2">
          <Stethoscope className="h-4 w-4 text-[#0060ac]" />
          <span className="text-xs font-bold text-[#001e40] uppercase tracking-widest">Sri Narayani Health Centre</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, bg, shadow }) => (
          <div key={label} className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
            <div className={cn('mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md', bg, shadow)}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-extrabold text-[#001e40] tracking-tighter">{value}</p>
            <p className="mt-0.5 text-xs font-semibold text-[#43474f] uppercase tracking-wider">{label}</p>
            <div className={cn('absolute -right-3 -top-3 h-16 w-16 rounded-full opacity-5', bg)} />
          </div>
        ))}
      </div>

      {/* Current patient banner */}
      {currentPatient && (
        <div className="relative overflow-hidden rounded-2xl bg-[#001e40] p-6 text-white shadow-xl shadow-[#001e40]/20">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#0060ac]/20 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />
          <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#a4c9ff]">In Progress</p>
              </div>
              <p className="text-xl font-extrabold">{currentPatient.patient?.full_name}</p>
              <p className="text-[#a4c9ff] text-sm mt-0.5">
                Token #{currentPatient.token_number} &nbsp;·&nbsp; {currentPatient.patient?.student_id}
              </p>
              {appointmentReason(currentPatient) && (
                <p className="mt-1 text-xs text-[#799dd6]">{appointmentReason(currentPatient)}</p>
              )}
            </div>
            <Link
              href={`/doctor/consultation/${currentPatient.id}`}
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-white text-[#001e40] px-6 py-3 text-sm font-extrabold hover:bg-[#d5e3ff] transition-colors shadow-lg"
            >
              <Play className="h-4 w-4" />
              Continue consultation
            </Link>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/doctor/queue" className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-lg hover:border-[#001e40]/20 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#001e40] text-white shadow-md shadow-[#001e40]/20 group-hover:scale-105 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#001e40]">Patient queue</h3>
              <p className="text-sm text-[#43474f]">View and manage today&apos;s appointments</p>
            </div>
          </div>
          <ChevronRight className="absolute bottom-5 right-5 h-4 w-4 text-slate-300 group-hover:text-[#0060ac] transition-colors" />
        </Link>

        <div className="relative rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#001e40]/5 text-[#001e40]">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#001e40]">Next in queue</h3>
              <p className="text-sm text-[#43474f]">
                <span className="font-bold text-[#001e40]">{nextInQueue?.length || 0}</span> patients waiting
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming patients table */}
      {nextInQueue && nextInQueue.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#001e40]/5 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-[#001e40]" />
              </div>
              <h2 className="font-extrabold text-[#001e40] tracking-tight">Upcoming patients</h2>
            </div>
            <Link href="/doctor/queue" className="flex items-center gap-1 text-xs font-bold text-[#0060ac] hover:text-[#001e40] transition-colors uppercase tracking-wider">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {nextInQueue.slice(0, 5).map((apt: Appointment) => (
              <div key={apt.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-[#f8f9fa] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#001e40] text-white text-sm font-extrabold shadow-md shadow-[#001e40]/20">
                    #{apt.token_number}
                  </div>
                  <div>
                    <p className="font-bold text-[#191c1d] text-sm">{apt.patient?.full_name}</p>
                    <p className="text-xs text-[#43474f]">{apt.patient?.student_id}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider',
                    apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
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
