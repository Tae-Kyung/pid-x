import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

// GET /api/projects/:id/uploads — 업로드 이력
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('pdf_uploads')
    .select('*')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/projects/:id/uploads — PDF 업로드
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const revision = formData.get('revision') as string | null;

  if (!file) {
    return NextResponse.json({ error: '파일이 필요합니다.' }, { status: 400 });
  }

  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: '파일 크기는 200MB 이하여야 합니다.' }, { status: 400 });
  }

  // PDF 매직넘버 검증 (%PDF)
  const headerBytes = await file.slice(0, 5).arrayBuffer();
  const header = new TextDecoder().decode(headerBytes);
  if (!header.startsWith('%PDF')) {
    return NextResponse.json({ error: 'PDF 파일만 업로드할 수 있습니다.' }, { status: 400 });
  }

  // 고유 업로드 ID 생성
  const uploadId = crypto.randomUUID();
  const storagePath = `${projectId}/${uploadId}/${file.name}`;

  // Supabase Storage 업로드
  const arrayBuffer = await file.arrayBuffer();
  const { error: storageError } = await supabase.storage
    .from('pdf-uploads')
    .upload(storagePath, arrayBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (storageError) {
    return NextResponse.json({ error: `스토리지 업로드 실패: ${storageError.message}` }, { status: 500 });
  }

  // DB 레코드 생성
  const { data: upload, error: dbError } = await supabase
    .from('pdf_uploads')
    .insert({
      id: uploadId,
      project_id: projectId,
      filename: file.name,
      file_size: file.size,
      storage_path: storagePath,
      parse_status: 'pending',
      revision: revision || null,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (dbError) {
    // DB 실패 시 스토리지 정리
    await supabase.storage.from('pdf-uploads').remove([storagePath]);
    return NextResponse.json({ error: `DB 저장 실패: ${dbError.message}` }, { status: 500 });
  }

  return NextResponse.json(upload, { status: 201 });
}
