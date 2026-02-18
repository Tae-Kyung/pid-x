import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET /api/projects/:id/equipment — 장비 목록
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '50')));
  const sort = searchParams.get('sort') || 'tag_no';
  const order = searchParams.get('order') === 'desc' ? false : true;
  const search = searchParams.get('search') || '';
  const types = searchParams.getAll('type');

  let query = db
    .from('equipment')
    .select('*', { count: 'exact' })
    .eq('project_id', projectId);

  if (search) query = query.ilike('tag_no', `%${search}%`);
  if (types.length > 0) query = query.in('equip_type', types);

  const validSorts = ['tag_no', 'equip_type', 'created_at'];
  const sortCol = validSorts.includes(sort) ? sort : 'tag_no';
  query = query.order(sortCol, { ascending: order });

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: data ?? [], total: count ?? 0, page, limit });
}
