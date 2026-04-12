'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { doctorsApi, appointmentsApi } from '@/lib/api';
import { scheduledAtFromDateInput } from '@/lib/datetime';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import type { Doctor } from '@/types';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

export default function BookAppointmentPage() {
  const router = useRouter();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [reason, setReason] = useState('');

  const { data: doctors, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorsApi.list().then((res) => res.data),
  });

  const bookAppointment = useMutation({
    mutationFn: () =>
      appointmentsApi.create({
        doctor_id: selectedDoctor!.id,
        scheduled_at: scheduledAtFromDateInput(appointmentDate),
        reason_for_visit: reason.trim() || undefined,
      }),
    onSuccess: (response) => {
      toast({
        title: 'Appointment Booked!',
        description: `Your token number is #${response.data.token_number}`,
        variant: 'success',
      });
      router.push('/patient/appointments');
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast({
        title: 'Booking Failed',
        description: error.response?.data?.error || 'Failed to book appointment',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !appointmentDate) return;
    bookAppointment.mutate();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/patient/appointments"
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:border-[#001e40]/20 hover:bg-slate-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className={vc.h1}>Book appointment</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={cn(vc.card, vc.cardPad)}>
          <h2 className={cn(vc.h2, 'mb-4')}>Select doctor</h2>
          {isLoading ? (
            <div className="py-8 text-center text-slate-500">Loading doctors...</div>
          ) : (
            <div className="grid gap-3">
              {doctors?.map((doctor: Doctor) => (
                <button
                  key={doctor.id}
                  type="button"
                  onClick={() => setSelectedDoctor(doctor)}
                  className={cn(
                    'rounded-2xl border-2 p-4 text-left transition',
                    selectedDoctor?.id === doctor.id
                      ? 'border-[#0060ac] bg-[#001e40]/5 ring-2 ring-[#0060ac]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#001e40]/10 text-[#004883]">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Dr. {doctor.full_name}</p>
                      <p className="text-sm text-slate-600">
                        {doctor.specialization || 'General Medicine'}
                      </p>
                      {doctor.qualification && (
                        <p className="text-xs text-slate-500">{doctor.qualification}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {doctors?.length === 0 && (
                <p className="py-8 text-center text-slate-500">No doctors available</p>
              )}
            </div>
          )}
        </div>

        <div className={cn(vc.card, vc.cardPad)}>
          <h2 className={cn(vc.h2, 'mb-4')}>Select date</h2>
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 shrink-0 text-slate-400" />
            <input
              type="date"
              min={today}
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
              className={vc.input}
            />
          </div>
        </div>

        <div className={cn(vc.card, vc.cardPad)}>
          <h2 className={cn(vc.h2, 'mb-4')}>Reason for visit (optional)</h2>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Briefly describe your symptoms or reason for visit..."
            rows={3}
            className={vc.textarea}
          />
        </div>

        <button
          type="submit"
          disabled={!selectedDoctor || !appointmentDate || bookAppointment.isPending}
          className={cn(vc.btnPrimary, vc.btnPrimaryBlock)}
        >
          {bookAppointment.isPending ? 'Booking...' : 'Confirm booking'}
        </button>
      </form>
    </div>
  );
}
