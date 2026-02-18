import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/projects/:id/lines/:lineId
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; lineId: string }> }
) {
  const { id: projectId, lineId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('pipe_lines')
    .select('*')
    .eq('id', lineId)
    .eq('project_id', projectId)
    .single();

  if (error || !data) return NextResponse.json({ error: '라인을 찾을 수 없습니다.' }, { status: 404 });
  return NextResponse.json(data);
}

// PUT /api/projects/:id/lines/:lineId
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; lineId: string }> }
) {
  const { id: projectId, lineId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.nominal_size !== undefined) updates.nominal_size = body.nominal_size;
  if (body.service_code !== undefined) updates.service_code = body.service_code;
  if (body.spec_class !== undefined) updates.spec_class = body.spec_class;
  if (body.status !== undefined) updates.status = body.status;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: '수정할 필드가 없습니다.' }, { status: 400 });
  }

  // 자동으로 modified 상태
  if (!updates.status) updates.status = 'modified';

  const { data, error } = await supabase
    .from('pipe_lines')
    .update(updates)
    .eq('id', lineId)
    .eq('project_id', projectId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
