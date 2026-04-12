'use client';

import { useQuery } from '@tanstack/react-query';
import { prescriptionsApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { FileText, Download, Pill } from 'lucide-react';
import type { Prescription, Medicine } from '@/types';

export default function PrescriptionsPage() {
  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => prescriptionsApi.getMe().then((res) => res.data),
  });

  const handleDownload = async (id: string) => {
    try {
      const { data } = await prescriptionsApi.getPdfUrl(id);
      const url = data.pdf_url as string;
      if (url) window.open(url, '_blank');
    } catch {
      toast({
        title: 'PDF unavailable',
        description: 'Could not open the prescription PDF.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Prescriptions</h1>

      {prescriptions?.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions yet</h3>
          <p className="text-gray-500">Your prescriptions will appear here after consultations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions?.map((prescription: Prescription) => (
            <div key={prescription.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-lg">
                      Prescription from Dr. {prescription.doctor?.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {prescription.doctor?.specialization} • {formatDate(prescription.issued_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(prescription.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>
                </div>

                {/* Medicines */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <h4 className="font-medium flex items-center gap-2">
                      <Pill className="h-4 w-4 text-purple-600" />
                      Prescribed Medicines
                    </h4>
                  </div>
                  <div className="divide-y">
                    {prescription.medicines?.map((med: Medicine, idx: number) => (
                      <div key={idx} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{med.name}</p>
                            <p className="text-sm text-gray-600">
                              {med.dosage} • {med.frequency} • {med.duration}
                            </p>
                            {med.instructions && (
                              <p className="text-sm text-gray-500 mt-1">{med.instructions}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                {prescription.instructions && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">Additional Instructions:</p>
                    <p className="text-sm text-yellow-700 mt-1">{prescription.instructions}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
