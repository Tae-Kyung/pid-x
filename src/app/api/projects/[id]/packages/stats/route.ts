import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET /api/projects/:id/packages/stats
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();

  const { data } = await db
    .from('test_packages')
    .select('system_code, status, test_medium')
    .eq('project_id', projectId);

  const rows = (data ?? []) as { system_code: string; status: string; test_medium: string }[];

  // 시스템별 그룹
  const systemMap = new Map<string, { total: number; completed: number }>();
  const statusMap = new Map<string, number>();
  const mediumMap = new Map<string, number>();

  for (const row of rows) {
    const sys = row.system_code || 'Unknown';
    const s = systemMap.get(sys) || { total: 0, completed: 0 };
    s.total++;
    if (row.status === 'completed' || row.status === 'approved') s.completed++;
    systemMap.set(sys, s);

    statusMap.set(row.status, (statusMap.get(row.status) ?? 0) + 1);
    mediumMap.set(row.test_medium, (mediumMap.get(row.test_medium) ?? 0) + 1);
  }

  return NextResponse.json({
    total: rows.length,
    completed: rows.filter((r) => r.status === 'completed' || r.status === 'approved').length,
    systems: [...systemMap.entries()].map(([name, v]) => ({ name, ...v })),
    statuses: [...statusMap.entries()].map(([name, count]) => ({ name, count })),
    mediums: [...mediumMap.entries()].map(([name, count]) => ({ name, count })),
  });
}
