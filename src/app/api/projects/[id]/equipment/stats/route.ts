import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET /api/projects/:id/equipment/stats
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
    .from('equipment')
    .select('equip_type')
    .eq('project_id', projectId);

  const typeMap = new Map<string, number>();
  for (const row of (data ?? []) as { equip_type: string }[]) {
    const t = row.equip_type || 'Unknown';
    typeMap.set(t, (typeMap.get(t) ?? 0) + 1);
  }

  const types = [...typeMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ types });
}
