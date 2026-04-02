'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Check, X, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { DoctorApprovalRequest } from '@/types';

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
      <h1 className="text-2xl font-bold">Doctor Approvals</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['pending', 'approved', 'rejected', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize transition ${
              filter === status ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : requests?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No requests found</div>
        ) : (
          <div className="divide-y">
            {requests?.map((request: DoctorApprovalRequest) => (
              <div key={request.id} className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{request.full_name}</h3>
                      <p className="text-gray-600">{request.email}</p>
                      <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                        <p>
                          <span className="text-gray-500">Specialization:</span>{' '}
                          {request.specialization || 'N/A'}
                        </p>
                        <p>
                          <span className="text-gray-500">Qualification:</span>{' '}
                          {request.qualification || 'N/A'}
                        </p>
                        <p>
                          <span className="text-gray-500">Registration:</span>{' '}
                          {request.registration_number || 'N/A'}
                        </p>
                        <p>
                          <span className="text-gray-500">Phone:</span>{' '}
                          {request.phone_number || 'N/A'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Applied: {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-16 lg:ml-0">
                    {request.status === 'pending' ? (
                      <>
                        <button
                          onClick={() =>
                            processApproval.mutate({ id: request.id, action: 'approve' })
                          }
                          disabled={processApproval.isPending}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            setRejectModal({ id: request.id, name: request.full_name })
                          }
                          disabled={processApproval.isPending}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    )}
                  </div>
                </div>

                {request.status === 'rejected' && request.rejection_reason && (
                  <div className="mt-4 ml-16 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">Rejection Reason:</span>{' '}
                      {request.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Reject Application: {rejectModal.name}
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border rounded-lg p-3 h-32 resize-none"
              required
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  processApproval.mutate({
                    id: rejectModal.id,
                    action: 'reject',
                    reason: rejectReason,
                  })
                }
                disabled={!rejectReason.trim() || processApproval.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
