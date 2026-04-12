'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import {
  TrendingUp,
  Clock,
  Pill,
  Activity,
  Users,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

const COLORS = ['#0d9488', '#0f766e', '#14b8a6', '#5eead4', '#115e59', '#134e4a', '#99f6e4', '#ccfbf1'];

export default function AdminAnalyticsPage() {
  const { data: overview } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => adminApi.analytics.overview().then((res) => res.data),
  });

  const { data: visits } = useQuery({
    queryKey: ['admin-visits'],
    queryFn: () => adminApi.analytics.visits(30).then((res) => res.data),
  });

  const { data: peakHours } = useQuery({
    queryKey: ['admin-peak-hours'],
    queryFn: () => adminApi.analytics.peakHours().then((res) => res.data),
  });

  const { data: diagnoses } = useQuery({
    queryKey: ['admin-diagnoses'],
    queryFn: () => adminApi.analytics.diagnoses(10).then((res) => res.data),
  });

  const { data: medicines } = useQuery({
    queryKey: ['admin-medicines'],
    queryFn: () => adminApi.analytics.medicines(10).then((res) => res.data),
  });

  const { data: demographics } = useQuery({
    queryKey: ['admin-demographics'],
    queryFn: () => adminApi.analytics.demographics().then((res) => res.data),
  });

  return (
    <div className="space-y-6">
      <h1 className={vc.h1}>Analytics and reports</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className={vc.statCard}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-700 text-white shadow-md shadow-teal-900/15 ring-2 ring-teal-600/25">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{overview?.totals?.patients || 0}</p>
              <p className="text-sm text-slate-600">Total patients</p>
            </div>
          </div>
        </div>
        <div className={vc.statCard}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80">
              <Activity className="h-6 w-6" strokeWidth={2.25} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{overview?.today?.consultations || 0}</p>
              <p className="text-sm text-slate-600">Today&apos;s consultations</p>
            </div>
          </div>
        </div>
        <div className={vc.statCard}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-800 ring-1 ring-slate-200">
              <TrendingUp className="h-6 w-6" />
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
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{overview?.totals?.pendingApprovals || 0}</p>
              <p className="text-sm text-slate-600">Pending approvals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visit Trends */}
      <div className={cn(vc.card, vc.cardPad)}>
        <h2 className={cn(vc.h2, 'mb-4 flex items-center gap-2')}>
          <TrendingUp className="h-5 w-5 text-teal-700" />
          Visit trends (last 30 days)
        </h2>
        <div className="h-80">
          {visits && visits.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visits}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })
                  }
                />
                <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">No data available</div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={cn(vc.card, vc.cardPad)}>
          <h2 className={cn(vc.h2, 'mb-4 flex items-center gap-2')}>
            <Clock className="h-5 w-5 text-amber-600" />
            Peak consultation hours
          </h2>
          <div className="h-64">
            {peakHours && peakHours.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => `${value}:00 - ${Number(value) + 1}:00`} />
                  <Bar dataKey="count" fill="#0d9488" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Gender Distribution */}
        <div className={cn(vc.card, vc.cardPad)}>
          <h2 className={cn(vc.h2, 'mb-4 flex items-center gap-2')}>
            <Users className="h-5 w-5 text-teal-700" />
            Gender distribution
          </h2>
          <div className="h-64">
            {demographics?.gender && demographics.gender.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographics.gender}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} (${((percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="gender"
                  >
                    {demographics.gender.map((_: unknown, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Top Diagnoses */}
        <div className={cn(vc.card, vc.cardPad)}>
          <h2 className={cn(vc.h2, 'mb-4 flex items-center gap-2')}>
            <Activity className="h-5 w-5 text-teal-700" strokeWidth={2.25} />
            Top diagnoses
          </h2>
          <div className="h-64">
            {diagnoses && diagnoses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diagnoses} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="diagnosis" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Top Medicines */}
        <div className={cn(vc.card, vc.cardPad)}>
          <h2 className={cn(vc.h2, 'mb-4 flex items-center gap-2')}>
            <Pill className="h-5 w-5 text-teal-700" />
            Most prescribed medicines
          </h2>
          <div className="h-64">
            {medicines && medicines.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={medicines.map((m: { medicine: string; count: number }) => ({
                    name: m.medicine,
                    count: m.count,
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#14b8a6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blood Group Distribution */}
      {demographics?.bloodGroup && demographics.bloodGroup.length > 0 && (
        <div className={cn(vc.card, vc.cardPad)}>
          <h2 className={cn(vc.h2, 'mb-4')}>Blood group distribution</h2>
          <div className="grid grid-cols-4 gap-4 md:grid-cols-8">
            {demographics.bloodGroup.map((item: { bloodGroup: string; count: number }) => (
              <div
                key={item.bloodGroup}
                className="rounded-2xl border border-teal-100 bg-teal-50/80 p-4 text-center ring-1 ring-teal-900/5"
              >
                <p className="text-2xl font-bold text-teal-800">{item.bloodGroup}</p>
                <p className="text-sm text-slate-600">{item.count} patients</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
