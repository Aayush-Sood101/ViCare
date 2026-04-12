'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { patientsApi, appointmentsApi, consultationsApi } from '@/lib/api';
import { formatDate, appointmentTime, appointmentReason } from '@/lib/utils';
import Link from 'next/link';
import { Calendar, FileText, Activity, Clock, Award, ArrowRight, ChevronRight, Stethoscope } from 'lucide-react';
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

  const quickLinks = [
    { href: '/patient/appointments/book', icon: Calendar, label: 'Book appointment', sub: 'Schedule a visit', color: 'bg-[#001e40]' },
    { href: '/patient/health-profile', icon: Activity, label: 'Health profile', sub: 'View your records', color: 'bg-[#0060ac]' },
    { href: '/patient/prescriptions', icon: FileText, label: 'Prescriptions', sub: 'Download prescriptions', color: 'bg-[#003366]' },
    { href: '/patient/certificates', icon: Award, label: 'Certificates', sub: 'Medical certificates', color: 'bg-[#004883]' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0060ac] mb-1">Patient Portal</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#001e40]">
            Welcome back, {profile?.full_name?.split(' ')[0] || user?.firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-[#43474f]">Student ID: <span className="font-semibold text-[#001e40]">{profile?.student_id}</span></p>
        </div>

      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {quickLinks.map(({ href, icon: Icon, label, sub, color }) => (
          <Link
            key={href}
            href={href}
            className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-lg hover:border-[#001e40]/20 transition-all duration-300"
          >
            <div className={cn('mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md transition-transform group-hover:scale-110', color)}>
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-[#001e40] text-sm">{label}</h3>
            <p className="text-xs text-[#43474f] mt-0.5">{sub}</p>
            <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-slate-300 group-hover:text-[#0060ac] group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>

      {/* Upcoming appointments */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#001e40]/5 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-[#001e40]" />
            </div>
            <h2 className="font-extrabold text-[#001e40] tracking-tight">Upcoming appointments</h2>
          </div>
          <Link href="/patient/appointments" className="flex items-center gap-1 text-xs font-bold text-[#0060ac] hover:text-[#001e40] transition-colors uppercase tracking-wider">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="p-4">
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 3).map((apt: Appointment) => (
                <div
                  key={apt.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f8f9fa] border border-slate-100 p-4 hover:border-[#001e40]/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#001e40] text-white shadow-md shadow-[#001e40]/20">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#001e40] text-sm">Dr. {apt.doctor?.full_name}</p>
                      <p className="text-xs text-[#43474f]">{apt.doctor?.specialization}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#191c1d] text-sm">{formatDate(appointmentTime(apt))}</p>
                    <p className="text-xs text-[#43474f]">Token: <span className="font-bold">#{apt.token_number}</span></p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider',
                      apt.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : apt.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="h-12 w-12 rounded-full bg-[#001e40]/5 flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6 text-[#001e40]/40" />
              </div>
              <p className="text-sm font-semibold text-[#43474f]">No upcoming appointments</p>
              <p className="text-xs text-slate-400 mt-1">Book a visit with a campus specialist</p>
              <Link href="/patient/appointments/book" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#001e40] text-white text-xs font-bold px-4 py-2 hover:bg-[#0060ac] transition-colors">
                <Calendar className="h-3.5 w-3.5" /> Book now
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent visits */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
          <div className="h-8 w-8 rounded-lg bg-[#001e40]/5 flex items-center justify-center">
            <Activity className="h-4 w-4 text-[#001e40]" strokeWidth={2.25} />
          </div>
          <h2 className="font-extrabold text-[#001e40] tracking-tight">Recent visits</h2>
        </div>
        <div className="p-4">
          {recentVisits.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {recentVisits.map((visit: Consultation) => (
                <div key={visit.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#001e40]/5 flex items-center justify-center shrink-0">
                      <Stethoscope className="h-4 w-4 text-[#001e40]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#191c1d] text-sm">{visit.diagnosis || 'Consultation'}</p>
                      <p className="text-xs text-[#43474f]">Dr. {visit.doctor?.full_name}</p>
                    </div>
                  </div>
                  <p className="shrink-0 text-xs font-medium text-[#43474f] bg-slate-50 rounded-full px-3 py-1">{formatDate(visit.created_at)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm font-semibold text-[#43474f]">No recent visits</p>
              <p className="text-xs text-slate-400 mt-1">Your consultation history will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
