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
import { formatDate } from '@/lib/utils';
import { Plus, Trash2, Save, FileText, Award } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MEDICINE_FREQUENCIES } from '@/lib/constants';
import type { Medicine, Consultation } from '@/types';

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
      // Create consultation
      const { data: consultation } = await consultationsApi.create({
        appointment_id: appointmentId as string,
        patient_id: appointment.patient_id,
        ...formData,
        vitals: formData.vitals,
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
    return <div className="p-8 text-center">Loading...</div>;
  }

  const patient = appointment?.patient;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Patient Info Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{patient?.full_name}</h1>
            <p className="text-gray-600">Student ID: {patient?.student_id}</p>
            <div className="mt-2 flex gap-4 text-sm text-gray-500">
              <span>DOB: {patient?.date_of_birth || 'N/A'}</span>
              <span>Gender: {patient?.gender || 'N/A'}</span>
              <span>Blood: {patient?.blood_group || 'N/A'}</span>
            </div>
            {patient?.allergies && (
              <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                <strong>Allergies:</strong> {patient.allergies}
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Token #{appointment?.token_number}</p>
            <p className="text-sm text-gray-500">{formatDate(appointment?.appointment_date)}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vitals */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4">Vitals</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm text-gray-600">Blood Pressure</label>
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
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Temp (°F)</label>
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
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Pulse (bpm)</label>
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
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Weight (kg)</label>
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
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Height (cm)</label>
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
                  className="w-full border rounded-lg p-2 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Chief Complaint & Diagnosis */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <label className="font-medium">Chief Complaint</label>
              <textarea
                value={formData.chief_complaint}
                onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                className="w-full border rounded-lg p-3 mt-1 h-24"
                placeholder="Patient's primary complaints..."
              />
            </div>
            <div>
              <label className="font-medium">Diagnosis</label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="w-full border rounded-lg p-3 mt-1 h-24"
                placeholder="Your diagnosis..."
              />
            </div>
            <div>
              <label className="font-medium">Treatment Plan</label>
              <textarea
                value={formData.treatment_plan}
                onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
                className="w-full border rounded-lg p-3 mt-1 h-20"
                placeholder="Treatment plan..."
              />
            </div>
            <div>
              <label className="font-medium">Clinical Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full border rounded-lg p-3 mt-1 h-20"
                placeholder="Additional observations..."
              />
            </div>
            <div>
              <label className="font-medium">Follow-up Date</label>
              <input
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>
          </div>

          {/* Prescription */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Prescription
              </h2>
              <button
                type="button"
                onClick={addMedicine}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                Add Medicine
              </button>
            </div>

            {medicines.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No medicines added</p>
            ) : (
              <div className="space-y-4">
                {medicines.map((med, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-3">
                      <span className="font-medium">Medicine {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeMedicine(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="Medicine name"
                        value={med.name}
                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                        className="border rounded p-2"
                      />
                      <input
                        placeholder="Dosage (e.g., 500mg)"
                        value={med.dosage}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                        className="border rounded p-2"
                      />
                      <select
                        value={med.frequency}
                        onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                        className="border rounded p-2"
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
                        className="border rounded p-2"
                      />
                      <input
                        placeholder="Instructions (e.g., After food)"
                        value={med.instructions || ''}
                        onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                        className="border rounded p-2 col-span-2"
                      />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-sm text-gray-600">Additional Instructions</label>
                  <textarea
                    value={prescriptionInstructions}
                    onChange={(e) => setPrescriptionInstructions(e.target.value)}
                    className="w-full border rounded-lg p-2 mt-1 h-20"
                    placeholder="General instructions for the patient..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Medical Certificate */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-600" />
                Medical Certificate
              </h2>
              <button
                type="button"
                onClick={() => setShowCertificateForm(!showCertificateForm)}
                className="text-blue-600 hover:text-blue-800"
              >
                {showCertificateForm ? 'Remove' : 'Add Certificate'}
              </button>
            </div>

            {showCertificateForm && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Reason for Certificate</label>
                  <input
                    type="text"
                    value={certificateData.reason}
                    onChange={(e) =>
                      setCertificateData({ ...certificateData, reason: e.target.value })
                    }
                    placeholder="e.g., Medical leave"
                    className="w-full border rounded-lg p-2 mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">From Date</label>
                    <input
                      type="date"
                      value={certificateData.from_date}
                      onChange={(e) =>
                        setCertificateData({ ...certificateData, from_date: e.target.value })
                      }
                      className="w-full border rounded-lg p-2 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">To Date</label>
                    <input
                      type="date"
                      value={certificateData.to_date}
                      onChange={(e) =>
                        setCertificateData({ ...certificateData, to_date: e.target.value })
                      }
                      className="w-full border rounded-lg p-2 mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <textarea
                    value={certificateData.notes}
                    onChange={(e) =>
                      setCertificateData({ ...certificateData, notes: e.target.value })
                    }
                    placeholder="Additional notes..."
                    className="w-full border rounded-lg p-2 mt-1 h-20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={() => createConsultation.mutate()}
            disabled={createConsultation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
          >
            <Save className="w-5 h-5" />
            {createConsultation.isPending ? 'Saving...' : 'Complete Consultation'}
          </button>
        </div>

        {/* Patient History Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3">Patient History</h3>
            {!patientHistory || patientHistory.length === 0 ? (
              <p className="text-sm text-gray-500">No previous visits</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {patientHistory.slice(0, 10).map((visit: Consultation) => (
                  <div key={visit.id} className="border-b pb-3 last:border-0">
                    <p className="text-xs text-gray-400">{formatDate(visit.created_at)}</p>
                    <p className="font-medium text-sm">{visit.diagnosis || 'No diagnosis'}</p>
                    <p className="text-xs text-gray-600">Dr. {visit.doctor?.full_name}</p>
                    {visit.chief_complaint && (
                      <p className="text-xs text-gray-500 mt-1">{visit.chief_complaint}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {patient?.current_medications && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2">Current Medications</h3>
              <p className="text-sm text-gray-600">{patient.current_medications}</p>
            </div>
          )}

          {patient?.medical_history && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-2">Medical History</h3>
              <p className="text-sm text-gray-600">{patient.medical_history}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
