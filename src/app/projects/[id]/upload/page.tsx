'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/lib/supabase/client';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

type UploadState = 'idle' | 'uploading' | 'parsing' | 'completed' | 'error';

interface UploadRecord {
  id: string;
  filename: string;
  file_size: number;
  parse_status: string;
  progress: number;
  error_message: string | null;
  uploaded_at: string;
  revision: string | null;
}

export default function UploadPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const supabase = createClient();

  const [state, setState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseStatus, setParseStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [revision, setRevision] = useState('');

  // 업로드 이력 로드
  useEffect(() => {
    loadUploads();
  }, [projectId]);

  async function loadUploads() {
    const res = await fetch(`/api/projects/${projectId}/uploads`);
    if (res.ok) {
      setUploads(await res.json());
    }
  }

  // Supabase Realtime 구독 — 파싱 진행률 감지
  useEffect(() => {
    if (!currentUploadId || state !== 'parsing') return;

    const channel = supabase
      .channel(`upload-${currentUploadId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pdf_uploads',
          filter: `id=eq.${currentUploadId}`,
        },
        (payload) => {
          const record = payload.new as UploadRecord;
          setParseProgress(record.progress);

          if (record.parse_status === 'completed') {
            setState('completed');
            setParseStatus('파싱 완료!');
            loadUploads();
          } else if (record.parse_status === 'failed') {
            setState('error');
            setErrorMessage(record.error_message || '파싱 중 오류가 발생했습니다.');
            loadUploads();
          } else if (record.parse_status === 'processing') {
            setParseStatus(getProgressLabel(record.progress));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUploadId, state]);

  function getProgressLabel(progress: number): string {
    if (progress <= 30) return `텍스트 추출 중... (${progress}%)`;
    if (progress <= 40) return `메타데이터 분석 중... (${progress}%)`;
    if (progress <= 60) return `배관 라인 추출 중... (${progress}%)`;
    if (progress <= 70) return `장비 태그 추출 중... (${progress}%)`;
    if (progress <= 85) return `Test Package 추출 중... (${progress}%)`;
    if (progress <= 95) return `계장/Golden Joint 추출 중... (${progress}%)`;
    return `최종 확인 중... (${progress}%)`;
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // 프론트 검증
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('PDF 파일만 업로드할 수 있습니다.');
      setState('error');
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setErrorMessage('파일 크기는 200MB 이하여야 합니다.');
      setState('error');
      return;
    }

    setState('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    try {
      // 업로드 진행률 시뮬레이션 (실제는 fetch에서 progress 없으므로)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const formData = new FormData();
      formData.append('file', file);
      if (revision.trim()) formData.append('revision', revision.trim());

      const res = await fetch(`/api/projects/${projectId}/uploads`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '업로드 실패');
      }

      setUploadProgress(100);
      const upload = await res.json();
      setCurrentUploadId(upload.id);

      // 파싱 시작
      setState('parsing');
      setParseProgress(0);
      setParseStatus('파싱 준비 중...');

      const parseRes = await fetch(`/api/uploads/${upload.id}/parse`, {
        method: 'POST',
      });

      if (!parseRes.ok) {
        const data = await parseRes.json();
        throw new Error(data.error || '파싱 시작 실패');
      }
    } catch (err) {
      setState('error');
      setErrorMessage(err instanceof Error ? err.message : '알 수 없는 오류');
    }
  }, [projectId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: state === 'uploading' || state === 'parsing',
  });

  function handleReset() {
    setState('idle');
    setUploadProgress(0);
    setParseProgress(0);
    setParseStatus('');
    setErrorMessage('');
    setCurrentUploadId(null);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">PDF Upload</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        P&ID PDF를 업로드하면 배관/장비/패키지 데이터를 자동 추출합니다.
      </p>

      {/* 드래그앤드롭 영역 */}
      <div className="mt-6">
        {state === 'idle' && (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">
                {isDragActive ? 'PDF 파일을 놓으세요' : 'PDF 파일을 드래그하거나 클릭하여 선택'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                최대 200MB, PDF 형식
              </p>
            </div>
            <div className="flex items-center gap-2 max-w-xs">
              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Revision:</label>
              <input
                type="text"
                value={revision}
                onChange={(e) => setRevision(e.target.value)}
                placeholder="예: Rev.2C, IFC"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* 업로드 진행 */}
        {state === 'uploading' && (
          <div className="rounded-xl border bg-card p-8 text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">파일 업로드 중...</p>
            <div className="mx-auto mt-4 h-2 w-64 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{uploadProgress}%</p>
          </div>
        )}

        {/* 파싱 진행 */}
        {state === 'parsing' && (
          <div className="rounded-xl border bg-card p-8 text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium">{parseStatus}</p>
            <div className="mx-auto mt-4 h-2 w-64 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${parseProgress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{parseProgress}%</p>
          </div>
        )}

        {/* 완료 */}
        {state === 'completed' && (
          <div className="rounded-xl border bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-500" />
            <p className="text-lg font-semibold">파싱 완료!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              데이터 추출이 완료되었습니다.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => router.push(`/projects/${projectId}`)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                대시보드로 이동
              </button>
              <button
                onClick={handleReset}
                className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
              >
                추가 업로드
              </button>
            </div>
          </div>
        )}

        {/* 에러 */}
        {state === 'error' && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
            <p className="text-sm font-medium text-destructive">{errorMessage}</p>
            <button
              onClick={handleReset}
              className="mt-4 rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              다시 시도
            </button>
          </div>
        )}
      </div>

      {/* 업로드 이력 */}
      {uploads.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold">업로드 이력</h2>
          <div className="mt-3 space-y-2">
            {uploads.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{u.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {(u.file_size / 1024 / 1024).toFixed(1)}MB
                    {u.revision && ` · Rev ${u.revision}`}
                    {' · '}
                    {new Date(u.uploaded_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <StatusBadge status={u.parse_status} progress={u.progress} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, progress }: { status: string; progress: number }) {
  switch (status) {
    case 'completed':
      return <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">완료</span>;
    case 'processing':
      return <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">파싱 중 {progress}%</span>;
    case 'failed':
      return <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">실패</span>;
    default:
      return <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">대기</span>;
  }
}
