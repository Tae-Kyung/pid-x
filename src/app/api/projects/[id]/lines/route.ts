import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/projects/:id/lines — 라인 목록 (필터/정렬/페이지네이션)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '50')));
  const sort = searchParams.get('sort') || 'line_number';
  const order = searchParams.get('order') === 'desc' ? false : true;
  const search = searchParams.get('search') || '';
  const sizes = searchParams.getAll('size');
  const services = searchParams.getAll('service');
  const units = searchParams.getAll('unit');
  const spec = searchParams.get('spec') || '';

  let query = supabase
    .from('pipe_lines')
    .select('*', { count: 'exact' })
    .eq('project_id', projectId);

  // 필터
  if (search) query = query.ilike('line_number', `%${search}%`);
  if (sizes.length > 0) query = query.in('nominal_size', sizes);
  if (services.length > 0) query = query.in('service_code', services);
  if (spec) query = query.ilike('spec_class', `%${spec}%`);

  // 정렬
  const validSorts = ['line_number', 'nominal_size', 'service_code', 'spec_class', 'status', 'created_at'];
  const sortCol = validSorts.includes(sort) ? sort : 'line_number';
  query = query.order(sortCol, { ascending: order });

  // 페이지네이션
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    items: data ?? [],
    total: count ?? 0,
    page,
    limit,
  });
}

// PATCH /api/projects/:id/lines — 벌크 수정
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ids, updates } = await request.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids 배열이 필요합니다.' }, { status: 400 });
  }

  const allowedFields: Record<string, boolean> = {
    nominal_size: true, service_code: true, spec_class: true, status: true,
  };
  const safeUpdates: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(updates || {})) {
    if (allowedFields[k]) safeUpdates[k] = v;
  }

  if (Object.keys(safeUpdates).length === 0) {
    return NextResponse.json({ error: '수정할 필드가 없습니다.' }, { status: 400 });
  }

  // status → 'modified'
  if (!safeUpdates.status) safeUpdates.status = 'modified';

  const { error } = await supabase
    .from('pipe_lines')
    .update(safeUpdates)
    .eq('project_id', projectId)
    .in('id', ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, updated: ids.length });
}
