/**
 * PDF 텍스트 추출 서비스
 * pdfjs-dist를 사용하여 페이지별 텍스트를 추출합니다.
 * PRD [FR-102]: 417페이지 60초 이내 텍스트 추출
 */
import { createServiceClient } from '@/lib/supabase/server';

export interface PageTextData {
  pageNumber: number;
  rawText: string;
  hasText: boolean;
}

/**
 * Supabase Storage에서 PDF를 다운로드하고 페이지별 텍스트를 추출
 */
export async function extractTextFromPdf(
  storagePath: string,
  onProgress?: (current: number, total: number) => void
): Promise<PageTextData[]> {
  const supabase = createServiceClient();

  // Storage에서 PDF 다운로드
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('pdf-uploads')
    .download(storagePath);

  if (downloadError || !fileData) {
    throw new Error(`PDF 다운로드 실패: ${downloadError?.message}`);
  }

  const arrayBuffer = await fileData.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // pdfjs-dist 동적 임포트 (서버사이드 Node.js 빌드)
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const pages: PageTextData[] = [];

  // 페이지별 텍스트 추출
  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const rawText = textContent.items
      .filter((item) => 'str' in item)
      .map((item) => (item as { str: string }).str)
      .join(' ');

    pages.push({
      pageNumber: i,
      rawText,
      hasText: rawText.trim().length > 100,
    });

    // 페이지 리소스 정리
    page.cleanup();

    // 진행률 콜백 (10페이지마다)
    if (onProgress && i % 10 === 0) {
      onProgress(i, totalPages);
    }
  }

  // PDF 리소스 정리
  await pdf.destroy();

  // 마지막 진행률 콜백
  if (onProgress) {
    onProgress(totalPages, totalPages);
  }

  return pages;
}

/**
 * 추출된 페이지 텍스트를 DB에 벌크 인서트
 */
export async function savePageTexts(
  uploadId: string,
  pages: PageTextData[]
): Promise<void> {
  const supabase = createServiceClient();
  const BATCH_SIZE = 50;

  for (let i = 0; i < pages.length; i += BATCH_SIZE) {
    const batch = pages.slice(i, i + BATCH_SIZE).map((p) => ({
      upload_id: uploadId,
      page_number: p.pageNumber,
      raw_text: p.rawText,
    }));

    const { error } = await supabase.from('page_texts').insert(batch);
    if (error) {
      throw new Error(`page_texts 저장 실패 (batch ${i}): ${error.message}`);
    }
  }
}

/**
 * 파싱 진행률을 pdf_uploads 테이블에 업데이트
 * Supabase Realtime이 자동으로 변경을 클라이언트에 Push
 */
export async function updateParseProgress(
  uploadId: string,
  progress: number,
  status?: 'pending' | 'processing' | 'completed' | 'failed',
  errorMessage?: string
): Promise<void> {
  const supabase = createServiceClient();

  const updates: {
    progress: number;
    parse_status?: 'pending' | 'processing' | 'completed' | 'failed';
    error_message?: string | null;
  } = { progress };
  if (status) updates.parse_status = status;
  if (errorMessage !== undefined) updates.error_message = errorMessage;

  await supabase.from('pdf_uploads').update(updates).eq('id', uploadId);
}
