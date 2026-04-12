'use client';

import { useQuery } from '@tanstack/react-query';
import { certificatesApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { Award, Download, Calendar } from 'lucide-react';
import type { MedicalCertificate } from '@/types';
import { vc } from '@/lib/vicare-ui';
import { cn } from '@/lib/utils';

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
    return <div className={vc.loadingBox}>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className={vc.h1}>Medical certificates</h1>

      {certificates?.length === 0 ? (
        <div className={vc.emptyCard}>
          <Award className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <h3 className="font-vicare-display text-lg font-semibold text-slate-900">No certificates yet</h3>
          <p className="text-slate-500">Medical certificates issued by doctors will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates?.map((cert: MedicalCertificate) => (
            <div key={cert.id} className={cn(vc.card, vc.cardPad)}>
              <div className="flex flex-col justify-between gap-4 lg:flex-row">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <div className={vc.iconTile}>
                      <Award className="h-5 w-5" />
                    </div>
                    <h3 className="font-vicare-display text-lg font-semibold text-slate-900">Medical certificate</h3>
                  </div>

                  <div className="mb-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-slate-600">Issued by</p>
                      <p className="font-medium text-slate-900">
                        Dr. {cert.doctor?.full_name}
                        {cert.doctor?.specialization && (
                          <span className="font-normal text-slate-500"> • {cert.doctor.specialization}</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Issued on</p>
                      <p className="font-medium text-slate-900">{formatDate(cert.issued_at)}</p>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <Calendar className="h-5 w-5 shrink-0 text-[#001e40]" />
                    <div>
                      <p className="text-sm text-slate-600">Leave period</p>
                      <p className="font-medium text-slate-900">
                        {formatDate(cert.from_date)} — {formatDate(cert.to_date)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Reason</p>
                    <p className="font-medium text-slate-900">{cert.reason}</p>
                  </div>

                  {cert.notes && (
                    <div className={cn(vc.calloutWarn, 'mt-3')}>
                      <p className="text-sm">{cert.notes}</p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(cert.id)}
                  className={cn(vc.btnPrimary, 'h-fit shrink-0 self-start lg:ml-4')}
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
