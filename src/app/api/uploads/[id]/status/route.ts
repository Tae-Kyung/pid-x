/**
 * GET /api/uploads/:id/status — 파싱 진행 상태 (polling fallback)
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: uploadId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('pdf_uploads')
    .select('id, parse_status, progress, error_message, total_pages, filename')
    .eq('id', uploadId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: '업로드를 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json(data);
}
