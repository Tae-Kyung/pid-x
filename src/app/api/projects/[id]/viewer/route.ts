import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET /api/projects/:id/viewer — 최신 업로드의 PDF signed URL + 메타데이터
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();

  // 최신 완료된 업로드 찾기
  const { data: upload } = await db
    .from('pdf_uploads')
    .select('id, filename, storage_path, total_pages, parse_status')
    .eq('project_id', projectId)
    .eq('parse_status', 'completed')
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single();

  if (!upload) {
    return NextResponse.json({ error: 'No parsed PDF found' }, { status: 404 });
  }

  // Signed URL 생성 (1시간)
  const { data: signedUrlData } = await db.storage
    .from('pdf-uploads')
    .createSignedUrl(upload.storage_path, 3600);

  return NextResponse.json({
    uploadId: upload.id,
    filename: upload.filename,
    totalPages: upload.total_pages,
    pdfUrl: signedUrlData?.signedUrl || null,
  });
}
