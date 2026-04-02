'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import Link from 'next/link';
import { Users, UserCheck, Stethoscope, Calendar, TrendingUp, Activity } from 'lucide-react';
import type { AdminAnalytics } from '@/types';

export default function AdminDashboard() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => adminApi.analytics.overview().then((res) => res.data),
  });

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to the ViCare admin portal</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overview?.totals?.patients || 0}</p>
              <p className="text-sm text-gray-600">Total Patients</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <Stethoscope className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overview?.totals?.activeDoctors || 0}</p>
              <p className="text-sm text-gray-600">Active Doctors</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <UserCheck className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overview?.totals?.pendingApprovals || 0}</p>
              <p className="text-sm text-gray-600">Pending Approvals</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overview?.today?.appointments || 0}</p>
              <p className="text-sm text-gray-600">Today&apos;s Appointments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/approvals"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
        >
          <UserCheck className="h-8 w-8 text-yellow-600 mb-3" />
          <h3 className="font-semibold">Doctor Approvals</h3>
          <p className="text-sm text-gray-600">
            {overview?.totals?.pendingApprovals || 0} pending
          </p>
        </Link>

        <Link
          href="/admin/doctors"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
        >
          <Stethoscope className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="font-semibold">Manage Doctors</h3>
          <p className="text-sm text-gray-600">View and manage doctors</p>
        </Link>

        <Link
          href="/admin/patients"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
        >
          <Users className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="font-semibold">View Patients</h3>
          <p className="text-sm text-gray-600">Search patient records</p>
        </Link>

        <Link
          href="/admin/analytics"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
        >
          <TrendingUp className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="font-semibold">Analytics</h3>
          <p className="text-sm text-gray-600">View insights and reports</p>
        </Link>
      </div>

      {/* Today's Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600" />
          Today&apos;s Activity
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">
              {overview?.today?.appointments || 0}
            </p>
            <p className="text-blue-800">Appointments Scheduled</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">
              {overview?.today?.consultations || 0}
            </p>
            <p className="text-green-800">Consultations Completed</p>
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      {overview?.weeklyAppointments && overview.weeklyAppointments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Weekly Appointment Trend</h2>
          <div className="flex items-end gap-2 h-40">
            {overview.weeklyAppointments.map((day: { date: string; count: number }, index: number) => {
              const maxCount = Math.max(...overview.weeklyAppointments.map((d: { count: number }) => d.count), 1);
              const height = (day.count / maxCount) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs text-gray-600">{day.count}</span>
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-gray-500">
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
