'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  appointmentsApi,
  consultationsApi,
  prescriptionsApi,
  certificatesApi,
  patientsApi,
} from '@/lib/api';
import { formatDate, appointmentTime } from '@/lib/utils';
import { Plus, Trash2, Save, FileText, Award } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MEDICINE_FREQUENCIES } from '@/lib/constants';
import type { Medicine, Consultation } from '@/types';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

export default function ConsultationPage() {
  const { appointmentId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    chief_complaint: '',
    diagnosis: '',
    treatment_plan: '',
    notes: '',
    vitals: {
      blood_pressure: '',
      temperature: '',
      pulse: '',
      weight: '',
      height: '',
    },
    follow_up_date: '',
  });

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptionInstructions, setPrescriptionInstructions] = useState('');
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [certificateData, setCertificateData] = useState({
    reason: '',
    from_date: '',
    to_date: '',
    notes: '',
  });

  // Fetch appointment details
  const { data: appointment, isLoading } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => appointmentsApi.getById(appointmentId as string).then((res) => res.data),
  });

  // Fetch patient history
  const { data: patientHistory } = useQuery({
    queryKey: ['patient-history', appointment?.patient_id],
    queryFn: () => patientsApi.getHistory(appointment.patient_id).then((res) => res.data),
    enabled: !!appointment?.patient_id,
  });

  // Create consultation mutation
  const createConsultation = useMutation({
    mutationFn: async () => {
      if (!appointment) {
        throw new Error('Appointment not loaded');
      }
      const notesCombined = [formData.notes, formData.treatment_plan]
        .filter(Boolean)
        .join('\n\n--- Treatment plan ---\n');

      const { data: consultation } = await consultationsApi.create({
        appointment_id: appointmentId as string,
        patient_id: appointment.patient_id,
        chief_complaint: formData.chief_complaint || undefined,
        diagnosis: formData.diagnosis || undefined,
        notes: notesCombined || undefined,
        vitals: formData.vitals,
        follow_up_date: formData.follow_up_date || undefined,
      });

      // Create prescription if medicines added
      if (medicines.length > 0) {
        await prescriptionsApi.create({
          consultation_id: consultation.id,
          patient_id: appointment.patient_id,
          medicines,
          instructions: prescriptionInstructions,
        });
      }

      // Create certificate if requested
      if (showCertificateForm && certificateData.reason && certificateData.from_date && certificateData.to_date) {
        await certificatesApi.create({
          consultation_id: consultation.id,
          patient_id: appointment.patient_id,
          ...certificateData,
        });
      }

      return consultation;
    },
    onSuccess: () => {
      toast({
        title: 'Consultation Complete',
        description: 'The consultation has been saved successfully.',
        variant: 'success',
      });
      router.push('/doctor/queue');
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save consultation',
        variant: 'destructive',
      });
    },
  });

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      },
    ]);
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return <div className={cn(vc.loadingBox, 'p-8')}>Loading...</div>;
  }

  const patient = appointment?.patient;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className={cn(vc.card, vc.cardPad)}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className={vc.h1}>{patient?.full_name}</h1>
            <p className="text-slate-600">Student ID: {patient?.student_id}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
              <span>DOB: {patient?.date_of_birth || 'N/A'}</span>
              <span>Gender: {patient?.gender || 'N/A'}</span>
              <span>Blood: {patient?.blood_group || 'N/A'}</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-slate-500">Token #{appointment?.token_number}</p>
            <p className="text-sm text-slate-500">
              {appointment ? formatDate(appointmentTime(appointment)) : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className={cn(vc.card, vc.cardPad)}>
            <h2 className={cn(vc.h2, 'mb-4')}>Vitals</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div>
                <label className={vc.label}>Blood pressure</label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={formData.vitals.blood_pressure}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, blood_pressure: e.target.value },
                    })
                  }
                  className={cn(vc.input, 'mt-1')}
                />
              </div>
              <div>
                <label className={vc.label}>Temp (°F)</label>
                <input
                  type="text"
                  placeholder="98.6"
                  value={formData.vitals.temperature}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, temperature: e.target.value },
                    })
                  }
                  className={cn(vc.input, 'mt-1')}
                />
              </div>
              <div>
                <label className={vc.label}>Pulse (bpm)</label>
                <input
                  type="text"
                  placeholder="72"
                  value={formData.vitals.pulse}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, pulse: e.target.value },
                    })
                  }
                  className={cn(vc.input, 'mt-1')}
                />
              </div>
              <div>
                <label className={vc.label}>Weight (kg)</label>
                <input
                  type="text"
                  placeholder="70"
                  value={formData.vitals.weight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, weight: e.target.value },
                    })
                  }
                  className={cn(vc.input, 'mt-1')}
                />
              </div>
              <div>
                <label className={vc.label}>Height (cm)</label>
                <input
                  type="text"
                  placeholder="170"
                  value={formData.vitals.height}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, height: e.target.value },
                    })
                  }
                  className={cn(vc.input, 'mt-1')}
                />
              </div>
            </div>
          </div>

          {/* Chief Complaint & Diagnosis */}
          <div className={cn(vc.card, vc.cardPad, 'space-y-4')}>
            <div>
              <label className={vc.label}>Chief complaint</label>
              <textarea
                value={formData.chief_complaint}
                onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                className={cn(vc.textarea, 'mt-1 h-24')}
                placeholder="Patient's primary complaints..."
              />
            </div>
            <div>
              <label className={vc.label}>Diagnosis</label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className={cn(vc.textarea, 'mt-1 h-24')}
                placeholder="Your diagnosis..."
              />
            </div>
            <div>
              <label className={vc.label}>Treatment plan</label>
              <textarea
                value={formData.treatment_plan}
                onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
                className={cn(vc.textarea, 'mt-1 h-20')}
                placeholder="Treatment plan..."
              />
            </div>
            <div>
              <label className={vc.label}>Clinical notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className={cn(vc.textarea, 'mt-1 h-20')}
                placeholder="Additional observations..."
              />
            </div>
            <div>
              <label className={vc.label}>Follow-up date</label>
              <input
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                className={cn(vc.input, 'mt-1')}
              />
            </div>
          </div>

          {/* Prescription */}
          <div className={cn(vc.card, vc.cardPad)}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={cn(vc.h2, 'flex items-center gap-2')}>
                <FileText className="h-5 w-5 text-teal-700" />
                Prescription
              </h2>
              <button type="button" onClick={addMedicine} className={cn(vc.link, 'inline-flex items-center gap-2 text-sm')}>
                <Plus className="h-4 w-4" />
                Add medicine
              </button>
            </div>

            {medicines.length === 0 ? (
              <p className="py-4 text-center text-slate-500">No medicines added</p>
            ) : (
              <div className="space-y-4">
                {medicines.map((med, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 p-4">
                    <div className="mb-3 flex justify-between">
                      <span className="font-medium text-slate-900">Medicine {index + 1}</span>
                      <button type="button" onClick={() => removeMedicine(index)} className={vc.btnDangerSoft}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="Medicine name"
                        value={med.name}
                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                        className={vc.input}
                      />
                      <input
                        placeholder="Dosage (e.g., 500mg)"
                        value={med.dosage}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                        className={vc.input}
                      />
                      <select
                        value={med.frequency}
                        onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                        className={vc.input}
                      >
                        <option value="">Select frequency</option>
                        {MEDICINE_FREQUENCIES.map((freq) => (
                          <option key={freq} value={freq}>
                            {freq}
                          </option>
                        ))}
                      </select>
                      <input
                        placeholder="Duration (e.g., 5 days)"
                        value={med.duration}
                        onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                        className={vc.input}
                      />
                      <input
                        placeholder="Instructions (e.g., After food)"
                        value={med.instructions || ''}
                        onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                        className={cn(vc.input, 'col-span-2')}
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label className={vc.label}>Additional instructions</label>
                  <textarea
                    value={prescriptionInstructions}
                    onChange={(e) => setPrescriptionInstructions(e.target.value)}
                    className={cn(vc.textarea, 'mt-1 h-20')}
                    placeholder="General instructions for the patient..."
                  />
                </div>
              </div>
            )}
          </div>

          <div className={cn(vc.card, vc.cardPad)}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={cn(vc.h2, 'flex items-center gap-2')}>
                <Award className="h-5 w-5 text-teal-700" />
                Medical certificate
              </h2>
              <button
                type="button"
                onClick={() => setShowCertificateForm(!showCertificateForm)}
                className={cn(vc.link, 'text-sm')}
              >
                {showCertificateForm ? 'Remove' : 'Add certificate'}
              </button>
            </div>

            {showCertificateForm && (
              <div className="space-y-4">
                <div>
                  <label className={vc.label}>Reason for certificate</label>
                  <input
                    type="text"
                    value={certificateData.reason}
                    onChange={(e) =>
                      setCertificateData({ ...certificateData, reason: e.target.value })
                    }
                    placeholder="e.g., Medical leave"
                    className={cn(vc.input, 'mt-1')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={vc.label}>From date</label>
                    <input
                      type="date"
                      value={certificateData.from_date}
                      onChange={(e) =>
                        setCertificateData({ ...certificateData, from_date: e.target.value })
                      }
                      className={cn(vc.input, 'mt-1')}
                    />
                  </div>
                  <div>
                    <label className={vc.label}>To date</label>
                    <input
                      type="date"
                      value={certificateData.to_date}
                      onChange={(e) =>
                        setCertificateData({ ...certificateData, to_date: e.target.value })
                      }
                      className={cn(vc.input, 'mt-1')}
                    />
                  </div>
                </div>
                <div>
                  <label className={vc.label}>Notes</label>
                  <textarea
                    value={certificateData.notes}
                    onChange={(e) =>
                      setCertificateData({ ...certificateData, notes: e.target.value })
                    }
                    placeholder="Additional notes..."
                    className={cn(vc.textarea, 'mt-1 h-20')}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => createConsultation.mutate()}
            disabled={createConsultation.isPending}
            className={cn(vc.btnPrimary, vc.btnPrimaryBlock)}
          >
            <Save className="h-5 w-5" />
            {createConsultation.isPending ? 'Saving...' : 'Complete consultation'}
          </button>
        </div>

        <div className="space-y-4">
          <div className={cn(vc.card, 'p-4')}>
            <h3 className={cn(vc.h2, 'mb-3')}>Patient history</h3>
            {!patientHistory || patientHistory.length === 0 ? (
              <p className="text-sm text-slate-500">No previous visits</p>
            ) : (
              <div className="max-h-96 space-y-3 overflow-y-auto">
                {patientHistory.slice(0, 10).map((visit: Consultation) => (
                  <div key={visit.id} className="border-b border-slate-100 pb-3 last:border-0">
                    <p className="text-xs text-slate-400">{formatDate(visit.created_at)}</p>
                    <p className="text-sm font-medium text-slate-900">{visit.diagnosis || 'No diagnosis'}</p>
                    <p className="text-xs text-slate-600">Dr. {visit.doctor?.full_name}</p>
                    {visit.chief_complaint && (
                      <p className="mt-1 text-xs text-slate-500">{visit.chief_complaint}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
