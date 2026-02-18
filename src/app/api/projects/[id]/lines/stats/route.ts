import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET /api/projects/:id/lines/stats — 라인 필터 옵션 + 통계
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createServiceClient();

  // 사이즈 목록, 서비스 목록 (필터 옵션용)
  const [sizesRes, servicesRes] = await Promise.all([
    db.from('pipe_lines').select('nominal_size').eq('project_id', projectId),
    db.from('pipe_lines').select('service_code').eq('project_id', projectId),
  ]);

  const sizes = [...new Set(
    ((sizesRes.data ?? []) as { nominal_size: string }[])
      .map((r) => r.nominal_size)
      .filter(Boolean)
  )].sort((a, b) => parseFloat(a.replace('"', '')) - parseFloat(b.replace('"', '')));

  const services = [...new Set(
    ((servicesRes.data ?? []) as { service_code: string }[])
      .map((r) => r.service_code)
      .filter(Boolean)
  )].sort();

  return NextResponse.json({ sizes, services });
}
