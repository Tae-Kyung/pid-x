import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/projects/:id/search?q=keyword — 전체 검색 (라인/장비/패키지)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  if (!q || q.length < 2) return NextResponse.json([]);

  const pattern = `%${q}%`;

  const [linesRes, equipRes, pkgRes] = await Promise.all([
    supabase
      .from('pipe_lines')
      .select('id, line_number, source_pages')
      .eq('project_id', projectId)
      .ilike('line_number', pattern)
      .limit(20),
    supabase
      .from('equipment')
      .select('id, tag_no, source_pages')
      .eq('project_id', projectId)
      .ilike('tag_no', pattern)
      .limit(20),
    supabase
      .from('test_packages')
      .select('id, package_no, source_page')
      .eq('project_id', projectId)
      .ilike('package_no', pattern)
      .limit(10),
  ]);

  const results: { entityType: string; entityId: string; displayName: string; sourcePages: number[] }[] = [];

  for (const line of (linesRes.data ?? []) as { id: string; line_number: string; source_pages: number[] | null }[]) {
    results.push({
      entityType: 'line',
      entityId: line.id,
      displayName: line.line_number,
      sourcePages: Array.isArray(line.source_pages) ? line.source_pages : [],
    });
  }

  for (const eq of (equipRes.data ?? []) as { id: string; tag_no: string; source_pages: number[] | null }[]) {
    results.push({
      entityType: 'equipment',
      entityId: eq.id,
      displayName: eq.tag_no,
      sourcePages: Array.isArray(eq.source_pages) ? eq.source_pages : [],
    });
  }

  for (const pkg of (pkgRes.data ?? []) as { id: string; package_no: string; source_page: number | null }[]) {
    results.push({
      entityType: 'package',
      entityId: pkg.id,
      displayName: pkg.package_no,
      sourcePages: pkg.source_page ? [pkg.source_page] : [],
    });
  }

  return NextResponse.json(results.slice(0, 50));
}
