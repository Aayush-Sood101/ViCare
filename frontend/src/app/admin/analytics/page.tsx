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

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

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
      <h1 className="text-2xl font-bold">Analytics & Reports</h1>

      {/* Summary Cards */}
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
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overview?.today?.consultations || 0}</p>
              <p className="text-sm text-gray-600">Today&apos;s Consultations</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
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
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overview?.totals?.pendingApprovals || 0}</p>
              <p className="text-sm text-gray-600">Pending Approvals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visit Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Visit Trends (Last 30 Days)
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
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Peak Consultation Hours
          </h2>
          <div className="h-64">
            {peakHours && peakHours.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tickFormatter={(value) => `${value}:00`} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => `${value}:00 - ${Number(value) + 1}:00`} />
                  <Bar dataKey="count" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Gender Distribution
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
              <div className="h-full flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Top Diagnoses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-600" />
            Top Diagnoses
          </h2>
          <div className="h-64">
            {diagnoses && diagnoses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diagnoses} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="diagnosis" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Top Medicines */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Pill className="h-5 w-5 text-green-600" />
            Most Prescribed Medicines
          </h2>
          <div className="h-64">
            {medicines && medicines.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={medicines} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blood Group Distribution */}
      {demographics?.bloodGroup && demographics.bloodGroup.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Blood Group Distribution</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {demographics.bloodGroup.map((item: { blood_group: string; count: number }) => (
              <div key={item.blood_group} className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{item.blood_group}</p>
                <p className="text-sm text-gray-600">{item.count} patients</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
