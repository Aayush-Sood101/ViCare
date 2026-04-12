'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import Link from 'next/link';
import { Users, UserCheck, Activity, Calendar, TrendingUp, ChevronRight, ShieldCheck, ArrowUpRight, BarChart3 } from 'lucide-react';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => adminApi.analytics.overview().then((res) => res.data),
  });

  const weeklyChart = useMemo(() => {
    const raw = overview?.weeklyAppointments;
    if (!raw?.length) return [];
    const counts: Record<string, number> = {};
    for (const row of raw) {
      const day = new Date(row.scheduled_at).toISOString().split('T')[0];
      counts[day] = (counts[day] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [overview?.weeklyAppointments]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-[#001e40] border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-[#43474f]">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total patients', value: overview?.totals?.patients || 0, icon: Users, bg: 'bg-[#001e40]', shadow: 'shadow-[#001e40]/20' },
    { label: 'Active doctors', value: overview?.totals?.activeDoctors || 0, icon: Activity, bg: 'bg-[#0060ac]', shadow: 'shadow-[#0060ac]/20' },
    { label: 'Pending approvals', value: overview?.totals?.pendingApprovals || 0, icon: UserCheck, bg: 'bg-amber-500', shadow: 'shadow-amber-400/30' },
    { label: "Today's appointments", value: overview?.today?.appointments || 0, icon: Calendar, bg: 'bg-emerald-600', shadow: 'shadow-emerald-500/20' },
  ];

  const quickLinks = [
    { href: '/admin/approvals', icon: UserCheck, label: 'Doctor approvals', sub: `${overview?.totals?.pendingApprovals || 0} pending`, color: 'bg-amber-500', shadow: 'shadow-amber-400/20' },
    { href: '/admin/doctors', icon: Activity, label: 'Manage doctors', sub: 'View and manage doctors', color: 'bg-[#0060ac]', shadow: 'shadow-[#0060ac]/20' },
    { href: '/admin/patients', icon: Users, label: 'View patients', sub: 'Search patient records', color: 'bg-[#001e40]', shadow: 'shadow-[#001e40]/20' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics', sub: 'View insights and reports', color: 'bg-[#003366]', shadow: 'shadow-[#001e40]/20' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0060ac] mb-1">Admin Console</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#001e40]">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-[#43474f]">Welcome to the ViCare admin portal</p>
        </div>
        <div className="hidden lg:flex items-center gap-2 rounded-full bg-[#001e40]/5 border border-[#001e40]/10 px-4 py-2">
          <ShieldCheck className="h-4 w-4 text-[#0060ac]" />
          <span className="text-xs font-bold text-[#001e40] uppercase tracking-widest">Full access</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, bg, shadow }) => (
          <div key={label} className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
            <div className={cn('mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md', bg, shadow)}>
              <Icon className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <p className="text-3xl font-extrabold text-[#001e40] tracking-tighter">{value}</p>
            <p className="mt-0.5 text-xs font-semibold text-[#43474f] uppercase tracking-wider">{label}</p>
            <div className={cn('absolute -right-3 -top-3 h-16 w-16 rounded-full opacity-5', bg)} />
          </div>
        ))}
      </div>

      {/* Quick action links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map(({ href, icon: Icon, label, sub, color, shadow }) => (
          <Link
            key={href}
            href={href}
            className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-lg hover:border-[#001e40]/20 transition-all duration-300"
          >
            <div className={cn('mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md transition-transform group-hover:scale-110', color, shadow)}>
              <Icon className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <h3 className="font-extrabold text-[#001e40] text-sm">{label}</h3>
            <p className="text-xs text-[#43474f] mt-0.5">{sub}</p>
            <ArrowUpRight className="absolute bottom-4 right-4 h-4 w-4 text-slate-300 group-hover:text-[#0060ac] transition-colors" />
          </Link>
        ))}
      </div>

      {/* Today's activity */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
          <div className="h-8 w-8 rounded-lg bg-[#001e40]/5 flex items-center justify-center">
            <Activity className="h-4 w-4 text-[#001e40]" strokeWidth={2.25} />
          </div>
          <h2 className="font-extrabold text-[#001e40] tracking-tight">Today&apos;s activity</h2>
        </div>
        <div className="p-6 grid gap-4 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl bg-[#001e40] p-5 text-white shadow-lg shadow-[#001e40]/20">
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[#0060ac]/20 blur-xl pointer-events-none" />
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#a4c9ff] mb-1">Scheduled</p>
            <p className="text-4xl font-extrabold tracking-tighter">{overview?.today?.appointments || 0}</p>
            <p className="text-[#a4c9ff] text-sm mt-1">Appointments today</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-emerald-600 p-5 text-white shadow-lg shadow-emerald-600/20">
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-100 mb-1">Completed</p>
            <p className="text-4xl font-extrabold tracking-tighter">{overview?.today?.consultations || 0}</p>
            <p className="text-emerald-100 text-sm mt-1">Consultations done</p>
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      {weeklyChart.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#001e40]/5 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-[#001e40]" />
              </div>
              <h2 className="font-extrabold text-[#001e40] tracking-tight">Weekly appointment trend</h2>
            </div>
            <Link href="/admin/analytics" className="flex items-center gap-1 text-xs font-bold text-[#0060ac] hover:text-[#001e40] transition-colors uppercase tracking-wider">
              Full report <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="p-6">
            <div className="flex h-44 items-end gap-2">
              {weeklyChart.map((day: { date: string; count: number }, index: number) => {
                const maxCount = Math.max(...weeklyChart.map((d: { count: number }) => d.count), 1);
                const height = (day.count / maxCount) * 100;
                return (
                  <div key={index} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-xs font-bold text-[#001e40]">{day.count}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#001e40] to-[#0060ac] transition-all duration-500"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    />
                    <span className="text-[10px] font-semibold text-[#43474f]">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
