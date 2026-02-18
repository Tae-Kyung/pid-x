'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { FileSpreadsheet, Download, Loader2 } from 'lucide-react';

const REPORT_TYPES = [
  {
    id: 'line-list',
    title: 'Line List',
    description: '전체 배관 라인 목록 (3개 시트: Line List, Summary, Filter Info)',
    icon: '📋',
  },
  {
    id: 'equipment',
    title: 'Equipment List',
    description: '전체 장비 목록 (Tag No, Type, Source Pages)',
    icon: '🔧',
  },
  {
    id: 'packages',
    title: 'Test Packages',
    description: 'Test Package 목록 + 시스템별 요약 (2개 시트)',
    icon: '📦',
  },
  {
    id: 'summary',
    title: 'Pipe Size Summary',
    description: '사이즈/서비스/장비 타입별 통계 요약 (4개 시트)',
    icon: '📊',
  },
];

export default function ReportsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [downloading, setDownloading] = useState<string | null>(null);

  async function downloadReport(type: string) {
    setDownloading(type);
    try {
      const res = await fetch(`/api/projects/${projectId}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (!res.ok) throw new Error('Failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="(.+)"/);
      a.download = match ? match[1] : `PID-X_${type}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('보고서 생성에 실패했습니다.');
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="text-sm text-muted-foreground">프로젝트 데이터를 엑셀 파일로 다운로드합니다.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {REPORT_TYPES.map((rt) => (
          <div key={rt.id} className="rounded-xl border bg-card p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{rt.icon}</span>
              <div>
                <h3 className="font-semibold">{rt.title}</h3>
                <p className="text-xs text-muted-foreground">{rt.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-auto pt-2">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">.xlsx</span>
              <button
                onClick={() => downloadReport(rt.id)}
                disabled={downloading !== null}
                className="ml-auto flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {downloading === rt.id ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating...</>
                ) : (
                  <><Download className="h-3.5 w-3.5" /> Download</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
