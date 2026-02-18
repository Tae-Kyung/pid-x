'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ZoomIn, ZoomOut, Maximize, ChevronLeft, ChevronRight } from 'lucide-react';

// PDF.js worker 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  pdfUrl: string;
  totalPages: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

export function PidViewer({ pdfUrl, totalPages, initialPage = 1, onPageChange }: Props) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [scale, setScale] = useState(1.0);
  const [numPages, setNumPages] = useState(totalPages || 0);
  const [pageInput, setPageInput] = useState(String(initialPage));
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부에서 페이지 변경
  useEffect(() => {
    if (initialPage >= 1 && initialPage <= numPages) {
      setCurrentPage(initialPage);
      setPageInput(String(initialPage));
    }
  }, [initialPage, numPages]);

  function onDocumentLoadSuccess({ numPages: n }: { numPages: number }) {
    setNumPages(n);
  }

  const goToPage = useCallback((page: number) => {
    const p = Math.max(1, Math.min(page, numPages));
    setCurrentPage(p);
    setPageInput(String(p));
    onPageChange?.(p);
  }, [numPages, onPageChange]);

  function handlePageInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const n = parseInt(pageInput, 10);
      if (!isNaN(n)) goToPage(n);
    }
  }

  // 키보드 네비게이션
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'ArrowLeft') goToPage(currentPage - 1);
      if (e.key === 'ArrowRight') goToPage(currentPage + 1);
      if (e.key === '+' || e.key === '=') setScale((s) => Math.min(s + 0.25, 4));
      if (e.key === '-') setScale((s) => Math.max(s - 0.25, 0.5));
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, goToPage]);

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 4));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const fitScreen = () => setScale(1.0);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b bg-card px-4 py-2">
        {/* Navigation */}
        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1} className="rounded border p-1.5 hover:bg-muted disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1 text-sm">
          <input
            type="text"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={handlePageInput}
            onBlur={() => { const n = parseInt(pageInput, 10); if (!isNaN(n)) goToPage(n); }}
            className="w-12 rounded border bg-background px-2 py-1 text-center text-xs"
          />
          <span className="text-xs text-muted-foreground">/ {numPages}</span>
        </div>
        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= numPages} className="rounded border p-1.5 hover:bg-muted disabled:opacity-30">
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="mx-2 h-4 w-px bg-border" />

        {/* Zoom */}
        <button onClick={zoomOut} className="rounded border p-1.5 hover:bg-muted" title="Zoom Out (-)">
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="w-12 text-center text-xs">{Math.round(scale * 100)}%</span>
        <button onClick={zoomIn} className="rounded border p-1.5 hover:bg-muted" title="Zoom In (+)">
          <ZoomIn className="h-4 w-4" />
        </button>
        <button onClick={fitScreen} className="rounded border p-1.5 hover:bg-muted" title="Fit Screen">
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      {/* PDF Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-muted/30"
        style={{ cursor: scale > 1 ? 'grab' : 'default' }}
      >
        <div className="flex min-h-full items-start justify-center p-4">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="flex h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}
            error={<div className="flex h-96 items-center justify-center text-sm text-destructive">PDF를 로드할 수 없습니다.</div>}
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              loading={<div className="flex h-96 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>
      </div>
    </div>
  );
}
