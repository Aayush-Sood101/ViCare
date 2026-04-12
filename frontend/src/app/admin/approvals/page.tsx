'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Check, X, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { DoctorApprovalRequest } from '@/types';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

export default function AdminApprovalsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('pending');
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['approval-requests', filter],
    queryFn: () =>
      adminApi
        .getApprovalRequests(filter !== 'all' ? { status: filter } : undefined)
        .then((res) => res.data),
  });

  const processApproval = useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: 'approve' | 'reject';
      reason?: string;
    }) => adminApi.processApproval(id, action, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
      setRejectModal(null);
      setRejectReason('');
      toast({
        title: variables.action === 'approve' ? 'Doctor Approved' : 'Application Rejected',
        description:
          variables.action === 'approve'
            ? 'The doctor can now access the portal.'
            : 'The applicant has been notified.',
        variant: variables.action === 'approve' ? 'success' : 'default',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to process the request',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="space-y-6">
      <h1 className={vc.h1}>Doctor approvals</h1>

      <div className="flex flex-wrap gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={cn(filter === status ? vc.filterActive : vc.filterIdle, 'capitalize')}
          >
            {status}
          </button>
        ))}
      </div>

      <div className={vc.tableWrap}>
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : requests?.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No requests found</div>
        ) : (
          <div className={vc.divideCard}>
            {requests?.map((request: DoctorApprovalRequest) => (
              <div key={request.id} className="p-6">
                <div className="flex flex-col items-start justify-between gap-4 lg:flex-row">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#001e40]/10 text-[#004883]">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{request.full_name}</h3>
                      <p className="text-slate-600">{request.email}</p>
                      <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                        <p>
                          <span className="text-slate-500">Specialization:</span>{' '}
                          {request.specialization || 'N/A'}
                        </p>
                        <p>
                          <span className="text-slate-500">Qualification:</span>{' '}
                          {request.qualification || 'N/A'}
                        </p>
                        <p>
                          <span className="text-slate-500">Registration:</span>{' '}
                          {request.registration_number || 'N/A'}
                        </p>
                        <p>
                          <span className="text-slate-500">Phone:</span>{' '}
                          {(request.phone ?? request.phone_number) || 'N/A'}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">Applied: {formatDate(request.created_at)}</p>
                    </div>
                  </div>

                  <div className="ml-14 flex items-center gap-2 lg:ml-0">
                    {request.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => processApproval.mutate({ id: request.id, action: 'approve' })}
                          disabled={processApproval.isPending}
                          className={cn(vc.btnSuccess, 'px-4 py-2')}
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectModal({ id: request.id, name: request.full_name })}
                          disabled={processApproval.isPending}
                          className={cn(vc.btnDanger, 'px-4 py-2')}
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </button>
                      </>
                    ) : (
                      <span
                        className={cn(
                          'rounded-full px-4 py-2 text-sm font-semibold',
                          getStatusColor(request.status)
                        )}
                      >
                        {request.status}
                      </span>
                    )}
                  </div>
                </div>

                {request.status === 'rejected' && request.rejection_reason && (
                  <div className="ml-14 mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">Rejection reason:</span> {request.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className={cn(vc.card, 'w-full max-w-md p-6 shadow-xl')}>
            <h3 className="font-vicare-display mb-4 text-lg font-semibold text-slate-900">
              Reject application: {rejectModal.name}
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className={cn(vc.textarea, 'h-32 resize-none')}
              required
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason('');
                }}
                className={vc.btnSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  processApproval.mutate({
                    id: rejectModal.id,
                    action: 'reject',
                    reason: rejectReason,
                  })
                }
                disabled={!rejectReason.trim() || processApproval.isPending}
                className={vc.btnDanger}
              >
                Confirm rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
