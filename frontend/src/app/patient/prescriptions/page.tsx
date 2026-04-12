'use client';

import { useQuery } from '@tanstack/react-query';
import { prescriptionsApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { FileText, Download, Pill } from 'lucide-react';
import type { Prescription, Medicine } from '@/types';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

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
    return <div className={vc.loadingBox}>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className={vc.h1}>My prescriptions</h1>

      {prescriptions?.length === 0 ? (
        <div className={vc.emptyCard}>
          <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <h3 className="font-vicare-display text-lg font-semibold text-slate-900">No prescriptions yet</h3>
          <p className="text-slate-500">Your prescriptions will appear here after consultations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions?.map((prescription: Prescription) => (
            <div key={prescription.id} className={cn(vc.card, 'overflow-hidden')}>
              <div className={vc.cardPad}>
                <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      Prescription from Dr. {prescription.doctor?.full_name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {prescription.doctor?.specialization} • {formatDate(prescription.issued_at)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(prescription.id)}
                    className={cn(vc.btnPrimary, 'shrink-0')}
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
                    <h4 className="flex items-center gap-2 font-medium text-slate-900">
                      <Pill className="h-4 w-4 text-[#001e40]" />
                      Prescribed medicines
                    </h4>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {prescription.medicines?.map((med: Medicine, idx: number) => (
                      <div key={idx} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-slate-900">{med.name}</p>
                            <p className="text-sm text-slate-600">
                              {med.dosage} • {med.frequency} • {med.duration}
                            </p>
                            {med.instructions && (
                              <p className="mt-1 text-sm text-slate-500">{med.instructions}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {prescription.instructions && (
                  <div className={cn(vc.calloutWarn, 'mt-4')}>
                    <p className="text-sm font-medium">Additional instructions</p>
                    <p className="mt-1 text-sm">{prescription.instructions}</p>
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
