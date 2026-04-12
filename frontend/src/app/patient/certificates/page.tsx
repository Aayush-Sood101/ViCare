'use client';

import { useQuery } from '@tanstack/react-query';
import { certificatesApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { Award, Download, Calendar } from 'lucide-react';
import type { MedicalCertificate } from '@/types';

export default function CertificatesPage() {
  const { data: certificates, isLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificatesApi.getMe().then((res) => res.data),
  });

  const handleDownload = async (id: string) => {
    try {
      const { data } = await certificatesApi.getPdfUrl(id);
      const url = data.pdf_url as string;
      if (url) window.open(url, '_blank');
    } catch {
      toast({
        title: 'PDF unavailable',
        description: 'Could not open the certificate PDF.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Medical Certificates</h1>

      {certificates?.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
          <p className="text-gray-500">
            Medical certificates issued by doctors will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates?.map((cert: MedicalCertificate) => (
            <div key={cert.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="h-6 w-6 text-orange-600" />
                    <h3 className="font-semibold text-lg">Medical Certificate</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Issued By</p>
                      <p className="font-medium">
                        Dr. {cert.doctor?.full_name}
                        {cert.doctor?.specialization && (
                          <span className="text-gray-500 font-normal">
                            {' '}
                            • {cert.doctor.specialization}
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Issued On</p>
                      <p className="font-medium">{formatDate(cert.issued_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Leave Period</p>
                      <p className="font-medium">
                        {formatDate(cert.from_date)} — {formatDate(cert.to_date)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Reason</p>
                    <p className="font-medium">{cert.reason}</p>
                  </div>

                  {cert.notes && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">{cert.notes}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDownload(cert.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition ml-4"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
