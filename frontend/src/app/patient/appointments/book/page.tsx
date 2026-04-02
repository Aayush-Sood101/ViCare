'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { doctorsApi, appointmentsApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import type { Doctor } from '@/types';

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
        appointment_date: appointmentDate,
        reason: reason || undefined,
      }),
    onSuccess: (response) => {
      toast({
        title: 'Appointment Booked!',
        description: `Your token number is #${response.data.token_number}`,
        variant: 'success',
      });
      router.push('/appointments');
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patient/appointments" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Book Appointment</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Select Doctor */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Select Doctor</h2>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading doctors...</div>
          ) : (
            <div className="grid gap-3">
              {doctors?.map((doctor: Doctor) => (
                <button
                  key={doctor.id}
                  type="button"
                  onClick={() => setSelectedDoctor(doctor)}
                  className={`p-4 border rounded-lg text-left transition ${
                    selectedDoctor?.id === doctor.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Dr. {doctor.full_name}</p>
                      <p className="text-sm text-gray-600">
                        {doctor.specialization || 'General Medicine'}
                      </p>
                      {doctor.qualification && (
                        <p className="text-xs text-gray-500">{doctor.qualification}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              {doctors?.length === 0 && (
                <p className="text-center py-8 text-gray-500">No doctors available</p>
              )}
            </div>
          )}
        </div>

        {/* Select Date */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Select Date</h2>
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              min={today}
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
              className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Reason */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Reason for Visit (Optional)</h2>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Briefly describe your symptoms or reason for visit..."
            rows={3}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!selectedDoctor || !appointmentDate || bookAppointment.isPending}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {bookAppointment.isPending ? 'Booking...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
}
