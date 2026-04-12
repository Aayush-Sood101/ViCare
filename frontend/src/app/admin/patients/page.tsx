'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { patientsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Search, User, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Patient } from '@/types';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

export default function AdminPatientsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-patients', search, page],
    queryFn: () =>
      patientsApi
        .list({
          search: search || undefined,
          page,
          limit,
        })
        .then((res) => res.data),
  });

  const patients = data?.data || data || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.pages ?? pagination?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <h1 className={vc.h1}>Patient records</h1>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, or student ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className={cn(vc.input, 'pl-10')}
        />
      </div>

      <div className={vc.tableWrap}>
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No patients found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={vc.tableHead}>
                <tr>
                  <th className={vc.th}>Patient</th>
                  <th className={vc.th}>Student ID</th>
                  <th className={vc.th}>Contact</th>
                  <th className={vc.th}>Details</th>
                  <th className={vc.th}>Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient: Patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{patient.full_name}</p>
                          <p className="text-sm text-slate-500">{patient.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="font-mono text-sm text-slate-800">{patient.student_id}</p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-sm text-slate-800">{(patient.phone ?? patient.phone_number) || 'N/A'}</p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-slate-800">
                        <p>
                          <span className="text-slate-500">Blood:</span> {patient.blood_group || 'N/A'}
                        </p>
                        <p>
                          <span className="text-slate-500">Gender:</span>{' '}
                          {patient.gender
                            ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
                            : 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {formatDate(patient.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <p className="text-sm text-slate-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of{' '}
              {pagination.total} patients
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
