import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET /api/projects/:id/packages/:pkgId — 패키지 상세
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; pkgId: string }> }
) {
  const { id: projectId, pkgId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();

  const { data: pkg, error } = await db
    .from('test_packages')
    .select('*')
    .eq('id', pkgId)
    .eq('project_id', projectId)
    .single();

  if (error || !pkg) return NextResponse.json({ error: '패키지를 찾을 수 없습니다.' }, { status: 404 });

  // 포함 라인 (pkg_line_map JOIN)
  const { data: lineMap } = await db
    .from('pkg_line_map')
    .select('pipeline_id')
    .eq('package_id', pkgId);

  let lines: unknown[] = [];
  if (lineMap && lineMap.length > 0) {
    const lineIds = (lineMap as { pipeline_id: string }[]).map((m) => m.pipeline_id);
    const { data: lineData } = await db
      .from('pipe_lines')
      .select('id, line_number, nominal_size, service_code')
      .in('id', lineIds);
    lines = lineData ?? [];
  }

  // Golden Joints
  const { data: joints } = await db
    .from('golden_joints')
    .select('*')
    .eq('project_id', projectId)
    .eq('test_package_id', pkgId);

  return NextResponse.json({ ...pkg, lines, golden_joints: joints ?? [] });
}

// PUT /api/projects/:id/packages/:pkgId — 상태 변경
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; pkgId: string }> }
) {
  const { id: projectId, pkgId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.status !== undefined) updates.status = body.status;

  const { data, error } = await db
    .from('test_packages')
    .update(updates)
    .eq('id', pkgId)
    .eq('project_id', projectId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
