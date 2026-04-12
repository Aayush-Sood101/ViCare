'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import Link from 'next/link';
import { Users, UserCheck, Activity, Calendar, TrendingUp } from 'lucide-react';
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
    return <div className={vc.loadingBox}>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className={vc.h1}>Admin dashboard</h1>
        <p className={cn(vc.muted, 'mt-1 text-sm')}>Welcome to the ViCare admin portal</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className={vc.statCard}>
          <div className="flex items-center gap-3">
            <div className={vc.iconTile}>
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{overview?.totals?.patients || 0}</p>
              <p className="text-sm text-slate-600">Total patients</p>
            </div>
          </div>
        </div>

        <div className={vc.statCard}>
          <div className="flex items-center gap-3">
            <div className={vc.iconTile}>
              <Activity className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{overview?.totals?.activeDoctors || 0}</p>
              <p className="text-sm text-slate-600">Active doctors</p>
            </div>
          </div>
        </div>

        <div className={vc.statCard}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800 ring-1 ring-amber-200/80">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{overview?.totals?.pendingApprovals || 0}</p>
              <p className="text-sm text-slate-600">Pending approvals</p>
            </div>
          </div>
        </div>

        <div className={vc.statCard}>
          <div className="flex items-center gap-3">
            <div className={vc.iconTile}>
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{overview?.today?.appointments || 0}</p>
              <p className="text-sm text-slate-600">Today&apos;s appointments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/approvals" className={vc.quickLink}>
          <UserCheck className="mb-3 h-8 w-8 text-teal-700" />
          <h3 className="font-vicare-display font-semibold text-slate-900">Doctor approvals</h3>
          <p className="text-sm text-slate-600">{overview?.totals?.pendingApprovals || 0} pending</p>
        </Link>

        <Link href="/admin/doctors" className={vc.quickLink}>
          <Activity className="mb-3 h-8 w-8 text-teal-700" strokeWidth={2.25} />
          <h3 className="font-vicare-display font-semibold text-slate-900">Manage doctors</h3>
          <p className="text-sm text-slate-600">View and manage doctors</p>
        </Link>

        <Link href="/admin/patients" className={vc.quickLink}>
          <Users className="mb-3 h-8 w-8 text-teal-700" />
          <h3 className="font-vicare-display font-semibold text-slate-900">View patients</h3>
          <p className="text-sm text-slate-600">Search patient records</p>
        </Link>

        <Link href="/admin/analytics" className={vc.quickLink}>
          <TrendingUp className="mb-3 h-8 w-8 text-teal-700" />
          <h3 className="font-vicare-display font-semibold text-slate-900">Analytics</h3>
          <p className="text-sm text-slate-600">View insights and reports</p>
        </Link>
      </div>

      <div className={cn(vc.card, vc.cardPad)}>
        <h2 className={cn(vc.h2, 'mb-4 flex items-center gap-2')}>
          <Activity className="h-5 w-5 text-teal-700" strokeWidth={2.25} />
          Today&apos;s activity
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className={cn(vc.subtleHighlight, 'rounded-2xl p-4')}>
            <p className="text-3xl font-bold text-teal-800">{overview?.today?.appointments || 0}</p>
            <p className="text-teal-900">Appointments scheduled</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 ring-1 ring-emerald-100">
            <p className="text-3xl font-bold text-emerald-800">{overview?.today?.consultations || 0}</p>
            <p className="text-emerald-900">Consultations completed</p>
          </div>
        </div>
      </div>

      {weeklyChart.length > 0 && (
        <div className={cn(vc.card, vc.cardPad)}>
          <h2 className={cn(vc.h2, 'mb-4')}>Weekly appointment trend</h2>
          <div className="flex h-40 items-end gap-2">
            {weeklyChart.map((day: { date: string; count: number }, index: number) => {
              const maxCount = Math.max(...weeklyChart.map((d: { count: number }) => d.count), 1);
              const height = (day.count / maxCount) * 100;
              return (
                <div key={index} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs text-slate-600">{day.count}</span>
                  <div
                    className={cn(vc.barChart, 'w-full rounded-t')}
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-slate-500">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
