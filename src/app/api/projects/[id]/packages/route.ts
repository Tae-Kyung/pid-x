import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET /api/projects/:id/packages — 패키지 목록
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
  const systemCode = searchParams.get('system_code') || '';
  const medium = searchParams.get('medium') || '';
  const status = searchParams.get('status') || '';

  let query = db
    .from('test_packages')
    .select('*')
    .eq('project_id', projectId)
    .order('system_code')
    .order('package_no');

  if (systemCode) query = query.eq('system_code', systemCode);
  if (medium) query = query.eq('test_medium', medium);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
