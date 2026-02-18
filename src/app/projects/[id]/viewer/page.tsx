'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PidViewer } from '@/components/viewer/PidViewer';
import { ViewerSearch } from '@/components/viewer/ViewerSearch';

interface ViewerData {
  uploadId: string;
  filename: string;
  totalPages: number;
  pdfUrl: string | null;
}

export default function ViewerPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [data, setData] = useState<ViewerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [targetPage, setTargetPage] = useState(1);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/viewer`)
      .then((r) => {
        if (!r.ok) throw new Error('No PDF');
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError('파싱 완료된 PDF가 없습니다. PDF를 먼저 업로드해 주세요.'); setLoading(false); });
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data || !data.pdfUrl) {
    return (
      <div className="flex h-[calc(100vh-120px)] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error || 'PDF를 불러올 수 없습니다.'}</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col gap-3">
      {/* Search bar */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold shrink-0">P&ID Viewer</h1>
        <ViewerSearch projectId={projectId} onPageSelect={(p) => setTargetPage(p)} />
        <span className="text-xs text-muted-foreground shrink-0">{data.filename}</span>
      </div>

      {/* Viewer */}
      <div className="flex-1 overflow-hidden rounded-lg border">
        <PidViewer
          pdfUrl={data.pdfUrl}
          totalPages={data.totalPages}
          initialPage={targetPage}
        />
      </div>
    </div>
  );
}
