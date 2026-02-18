import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// PUT /api/projects/:id/golden-joints/:gjId — Golden Joint 상태 변경
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; gjId: string }> }
) {
  const { id: projectId, gjId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  if (body.status !== undefined) updates.status = body.status;
  if (body.test_package_id !== undefined) updates.test_package_id = body.test_package_id;

  const { data, error } = await db
    .from('golden_joints')
    .update(updates)
    .eq('id', gjId)
    .eq('project_id', projectId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
